import { describe, expect, it } from "vitest";
import { getProvision } from "@/lib/constitution";
import { allTopicRefs, topics } from "@/lib/topics";

describe("topic guides", () => {
  it("covers the planned subjects with unique slugs", () => {
    expect(topics).toHaveLength(11);
    expect(new Set(topics.map((t) => t.slug)).size).toBe(11);
  });

  it.each(topics.map((t) => [t.slug, t] as const))("%s refers only to provisions that exist and are in force", (_slug, topic) => {
    for (const id of allTopicRefs(topic)) {
      const p = getProvision(id);
      expect(p, id).toBeDefined();
      expect(p!.repealed, id).not.toBe(true);
    }
    // Every statement about the Constitution must cite at least one provision.
    for (const pt of [...topic.points, ...topic.limits, ...topic.scenario.whatTheTextSays]) expect(pt.refs.length).toBeGreaterThan(0);
    expect(topic.scenario.notSettledHere.length).toBeGreaterThan(40);
  });
});
