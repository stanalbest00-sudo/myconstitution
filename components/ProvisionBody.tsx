import { highlightSegments } from "@/lib/search";
import type { ContentNode } from "@/lib/types";

function Text({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  return (
    <>
      {highlightSegments(text, terms).map((s, i) => (s.hit ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
    </>
  );
}

function Nodes({ nodes, terms }: { nodes: ContentNode[]; terms: string[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.t === "p") return <p key={i}><Text text={n.text} terms={terms} /></p>;
        if (n.t === "h") return <h4 key={i}>{n.text}</h4>;
        const marked = n.items.some((it) => it.m);
        return (
          <ol key={i} className={marked ? undefined : "plain-list"}>
            {n.items.map((it, j) => (
              <li key={j}>
                {marked && <span className="marker">({it.m})</span>}
                <div><Nodes nodes={it.c} terms={terms} /></div>
              </li>
            ))}
          </ol>
        );
      })}
    </>
  );
}

/**
 * Renders constitutional text exactly as stored. Only source text goes through
 * this component: explanations and labels are always rendered outside it.
 */
export function ProvisionBody({ content, terms = [] }: { content: ContentNode[]; terms?: string[] }) {
  return (
    <div className="legal" lang="en" data-official-text>
      <Nodes nodes={content} terms={terms} />
    </div>
  );
}
