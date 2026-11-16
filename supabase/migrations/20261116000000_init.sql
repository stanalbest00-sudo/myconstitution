-- My Constitution Seychelles: initial schema
--
-- Design rules
--   * Constitutional text (provisions.content / body) is stored separately from
--     editorial labels and never mixed with generated explanations.
--   * Every row of text belongs to a document version with explicit language,
--     source and verification status. Only "published" versions are readable
--     by the public; imports land as "draft" and are published explicitly.
--   * No table stores questions, transcripts, IP addresses or audio.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- sources
create table source_documents (
  id               text primary key,
  title            text not null,
  publisher        text not null,
  is_official      boolean not null default false,
  url              text not null,
  pdf_url          text,
  sha256           text,
  retrieved_on     date,
  publication_date date,
  notes            text
);

create table document_versions (
  id                   bigint generated always as identity primary key,
  source_document_id   text not null references source_documents (id),
  language             text not null check (language in ('en', 'fr', 'crs')),
  text_status          text not null check (text_status in
                         ('official', 'unofficial-transcription', 'official-translation', 'unofficial-translation')),
  consolidated_through text not null,
  verification         text not null,
  status               text not null default 'draft' check (status in ('draft', 'published', 'superseded')),
  stats                jsonb not null default '{}',
  source_sha256        text not null,
  created_at           timestamptz not null default now(),
  published_at         timestamptz,
  check ((status = 'draft') = (published_at is null))
);
-- At most one published version per language.
create unique index document_versions_one_published on document_versions (language) where status = 'published';

create table amendments (
  id                  bigint generated always as identity primary key,
  title               text not null,
  act_reference       text,
  commenced_on        date,
  affected_provisions text[] not null default '{}',
  source_url          text,
  verification_status text not null default 'unverified'
                        check (verification_status in ('verified-official', 'verified-secondary', 'unverified', 'disputed')),
  notes               text
);

-- ------------------------------------------------------------------- text
create table chapters (
  version_id bigint not null references document_versions (id) on delete cascade,
  number     text not null,
  title      text,
  heading    text not null,
  position   int not null,
  primary key (version_id, number)
);

create table parts (
  version_id     bigint not null,
  chapter_number text not null,
  number         text not null,
  title          text,
  heading        text not null,
  position       int not null,
  primary key (version_id, chapter_number, number),
  foreign key (version_id, chapter_number) references chapters (version_id, number) on delete cascade
);

create table provisions (
  version_id      bigint not null references document_versions (id) on delete cascade,
  -- Stable identifier shared across versions and languages, e.g. "article-22".
  provision_id    text not null check (provision_id ~ '^[a-z0-9-]+$'),
  kind            text not null check (kind in ('preamble', 'article', 'schedule')),
  number          text,
  label           text not null,
  chapter_number  text,
  part_number     text,
  schedule_number text,
  section_heading text,
  source_heading  text,
  repealed        boolean not null default false,
  position        int not null,
  content         jsonb not null,
  body            text not null check (length(body) > 0),
  search          tsvector generated always as (to_tsvector('english', body)) stored,
  primary key (version_id, provision_id),
  unique (version_id, position)
);
create index provisions_search_idx on provisions using gin (search);
create index provisions_body_trgm_idx on provisions using gin (body gin_trgm_ops);

-- Editorial navigation labels: explicitly not part of the Constitution.
create table editorial_labels (
  provision_id text not null,
  language     text not null check (language in ('en', 'fr', 'crs')),
  label        text not null,
  reviewed     boolean not null default false,
  primary key (provision_id, language)
);

-- ---------------------------------------------------------------- feedback
-- Optional and anonymous. Write-only for the public.
create table feedback (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  provision_id text check (provision_id ~ '^[a-z0-9-]+$'),
  kind         text not null check (kind in ('text-error', 'explanation-problem', 'translation', 'other')),
  comment      text not null check (length(comment) between 5 and 1000)
);

-- ------------------------------------------------------------ publication
-- Publishing checks completeness first, so a partial import can never go live.
create function publish_version(p_version bigint, p_expected_articles int)
returns void language plpgsql security invoker as $$
declare
  v_lang text;
  v_articles int;
  v_dupes int;
begin
  select language into v_lang from document_versions where id = p_version and status = 'draft';
  if v_lang is null then raise exception 'version % is not a draft', p_version; end if;

  select count(*) into v_articles from provisions where version_id = p_version and kind = 'article';
  if v_articles <> p_expected_articles then
    raise exception 'expected % articles, found %', p_expected_articles, v_articles;
  end if;
  select count(*) into v_dupes from (
    select number from provisions where version_id = p_version and kind = 'article' group by number having count(*) > 1
  ) d;
  if v_dupes > 0 then raise exception '% duplicated article numbers', v_dupes; end if;

  update document_versions set status = 'superseded' where language = v_lang and status = 'published';
  update document_versions set status = 'published', published_at = now() where id = p_version;
end $$;

-- ------------------------------------------------------------------ search
create function search_provisions(q text, lang text default 'en', max_results int default 10)
returns table (provision_id text, label text, rank real, excerpt text)
language sql stable security invoker as $$
  select p.provision_id, p.label,
         ts_rank_cd(p.search, websearch_to_tsquery('english', q)) as rank,
         ts_headline('english', p.body, websearch_to_tsquery('english', q),
                     'MaxFragments=1, MaxWords=40, MinWords=15, StartSel=«, StopSel=»') as excerpt
  from provisions p
  join document_versions v on v.id = p.version_id
  where v.status = 'published' and v.language = lang and not p.repealed
    and p.search @@ websearch_to_tsquery('english', q)
  order by rank desc, p.position
  limit least(greatest(max_results, 1), 25)
$$;

-- --------------------------------------------------------------------- RLS
alter table source_documents  enable row level security;
alter table document_versions enable row level security;
alter table amendments        enable row level security;
alter table chapters          enable row level security;
alter table parts             enable row level security;
alter table provisions        enable row level security;
alter table editorial_labels  enable row level security;
alter table feedback          enable row level security;

-- Public, read-only access to published material. There are no public write
-- policies: imports run with the service role, which bypasses RLS.
create policy "public read sources"   on source_documents  for select to anon, authenticated using (true);
create policy "public read amendments" on amendments       for select to anon, authenticated using (true);
create policy "public read labels"    on editorial_labels  for select to anon, authenticated using (true);
create policy "public read published versions" on document_versions for select to anon, authenticated
  using (status = 'published');
create policy "public read published chapters" on chapters for select to anon, authenticated
  using (exists (select 1 from document_versions v where v.id = version_id and v.status = 'published'));
create policy "public read published parts" on parts for select to anon, authenticated
  using (exists (select 1 from document_versions v where v.id = version_id and v.status = 'published'));
create policy "public read published provisions" on provisions for select to anon, authenticated
  using (exists (select 1 from document_versions v where v.id = version_id and v.status = 'published'));

-- Feedback can be submitted but never read back by the public.
create policy "public submit feedback" on feedback for insert to anon, authenticated with check (true);

grant select on source_documents, document_versions, amendments, chapters, parts, provisions, editorial_labels to anon, authenticated;
grant insert (provision_id, kind, comment) on feedback to anon, authenticated;
revoke execute on function publish_version(bigint, int) from public;
grant execute on function search_provisions(text, text, int) to anon, authenticated;
