-- OPTIONAL, NOT APPLIED BY DEFAULT, NOT TESTED IN THIS REPOSITORY.
--
-- Semantic retrieval with pgvector. The first version of the site does not use
-- embeddings: the corpus is ~220 provisions and lexical search plus an
-- AI-written query plan retrieves well (see docs/ARCHITECTURE.md). Apply this
-- only if evaluation shows lexical retrieval is missing relevant provisions.
create extension if not exists vector;

create table provision_embeddings (
  version_id   bigint not null,
  provision_id text not null,
  model        text not null,
  embedding    vector(1024) not null,
  primary key (version_id, provision_id, model),
  foreign key (version_id, provision_id) references provisions (version_id, provision_id) on delete cascade
);
create index provision_embeddings_hnsw on provision_embeddings using hnsw (embedding vector_cosine_ops);
alter table provision_embeddings enable row level security;
