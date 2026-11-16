import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page should not scroll horizontally").toBeLessThanOrEqual(1);
}

test.describe("homepage", () => {
  test("shows the headline, question box, topics, sources and disclaimer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Know Your Constitution. Know Your Rights.");
    await expect(page.getByText("Explore, search and understand the Constitution of the Republic of Seychelles.")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Ask a question about the Constitution" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Speak your question" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Language", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the Constitution" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Arrest and Detention/ })).toBeVisible();
    await expect(page.getByText("Unofficial transcription").first()).toBeVisible();
    await expect(page.getByText("Legal information, not legal advice").first()).toBeVisible();
    await noHorizontalScroll(page);
  });

  test("rejects a too-short question with an accessible message", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "at least three characters" })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("asking a question (no AI key configured)", () => {
  test("typing a question leads to matching provisions that link to the text", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Ask a question about the Constitution" }).fill("What are my rights if I am arrested?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page).toHaveURL(/\/ask#q=/);
    await expect(page.getByText("AI explanations are not switched on")).toBeVisible();
    const first = page.getByRole("link", { name: "Article 18", exact: true }).first();
    await expect(first).toBeVisible();
    await first.click();
    await expect(page).toHaveURL(/\/constitution\/article-18$/);
    await expect(page.locator("[data-official-text]")).toContainText("Every person has a right to liberty and security of the person.");
    await noHorizontalScroll(page);
  });

  test("the question is never sent in a URL", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => urls.push(r.url()));
    await page.goto("/ask#q=" + encodeURIComponent("Can the police search my house?"));
    await expect(page.getByRole("link", { name: "Article 20", exact: true }).first()).toBeVisible();
    expect(urls.some((u) => /search|police|house/i.test(new URL(u).search))).toBe(false);
  });

  test("a nonsense question gets an honest empty state", async ({ page }) => {
    await page.goto("/ask#q=zzqxv%20wlkjh");
    await expect(page.getByText("No provision of the Constitution that answers this question was found.")).toBeVisible();
  });

  test("a failing server shows an error instead of hanging", async ({ page }) => {
    await page.route("**/api/ask", (r) => r.fulfill({ status: 500, body: "{}" }));
    await page.goto("/ask#q=freedom%20of%20expression");
    await expect(page.getByRole("alert").filter({ hasText: "Something went wrong" })).toBeVisible();
  });

  test("rate limiting is explained to the user", async ({ page }) => {
    await page.route("**/api/ask", (r) => r.fulfill({ status: 429, body: "{}" }));
    await page.goto("/ask#q=freedom%20of%20expression");
    await expect(page.getByRole("alert").filter({ hasText: "Please wait a moment" })).toBeVisible();
  });

  test("an AI answer renders every section, labelled as AI, and escapes markup", async ({ page }) => {
    await page.route("**/api/ask", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          mode: "ai", status: "answered", language: "en",
          shortAnswer: "You must be told why. <img src=x onerror=window.__xss=1>",
          whatThisMeans: "Plain explanation.", limitations: ["A court may refuse release."],
          unverifiedMentions: ["301"],
          citations: [{ id: "article-18", label: "Article 18", heading: "Right to liberty", href: "/constitution/article-18", relevance: "Rights on arrest.", excerpt: "Every person has a right to liberty" }],
        }),
      }),
    );
    await page.goto("/ask#q=arrest");
    await expect(page.getByText("AI-generated explanation")).toBeVisible();
    for (const h of ["Short answer", "What this means", "Important limitations", "Relevant constitutional provisions"]) {
      await expect(page.getByRole("heading", { name: h })).toBeVisible();
    }
    await expect(page.getByText("Article 301")).toBeVisible();
    await expect(page.getByText("<img src=x onerror=window.__xss=1>")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });
});

test.describe("voice input", () => {
  const mockSpeech = (behaviour: "ok" | "denied") => `
    window.__speech = { started: 0, aborted: 0, lang: null };
    window.webkitSpeechRecognition = class {
      start() {
        window.__speech.started++; window.__speech.lang = this.lang;
        setTimeout(() => {
          if (${JSON.stringify(behaviour)} === "denied") { this.onerror && this.onerror({ error: "not-allowed" }); this.onend && this.onend(); return; }
          this.onresult && this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: "who can vote in seychelles" }], { isFinal: true })] });
          this.onend && this.onend();
        }, 50);
      }
      stop() { this.onend && this.onend(); }
      abort() { window.__speech.aborted++; }
    };
    window.SpeechRecognition = window.webkitSpeechRecognition;`;

  test("transcript is placed in the box for review and is not submitted automatically", async ({ page }) => {
    await page.addInitScript(mockSpeech("ok"));
    await page.goto("/");
    await page.getByRole("button", { name: "Speak your question" }).click();
    const box = page.getByRole("textbox", { name: "Ask a question about the Constitution" });
    await expect(box).toHaveValue("who can vote in seychelles");
    await expect(page.getByText("Check the text below and correct it before asking.")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    await box.fill("Who can vote in Seychelles?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page.getByRole("link", { name: "Article 113", exact: true }).first()).toBeVisible();
  });

  test("Kreol Seselwa is marked experimental and uses the French recogniser", async ({ page }) => {
    await page.addInitScript(mockSpeech("ok"));
    await page.goto("/");
    await page.getByRole("combobox", { name: "Speech language" }).selectOption("crs");
    await expect(page.getByText(/Experimental: we have not found a speech recognition service that supports Kreol Seselwa/)).toBeVisible();
    await page.getByRole("button", { name: "Speak your question" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __speech: { lang: string } }).__speech.lang)).toBe("fr-FR");
  });

  test("a denied microphone permission is explained", async ({ page }) => {
    await page.addInitScript(mockSpeech("denied"));
    await page.goto("/");
    await page.getByRole("button", { name: "Speak your question" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Microphone permission was denied" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Speak your question" })).toBeVisible();
  });

  test("browsers without speech recognition get a typed fallback", async ({ page }) => {
    await page.addInitScript("delete window.SpeechRecognition; delete window.webkitSpeechRecognition;");
    await page.goto("/");
    await expect(page.getByText("Voice input is not available in this browser.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Speak your question" })).toBeDisabled();
  });
});

test.describe("constitution library", () => {
  test("lists chapters and articles and filters them", async ({ page }) => {
    await page.goto("/constitution");
    await expect(page.getByRole("heading", { name: "The Republic", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Article 170/ })).toBeVisible();
    await page.getByRole("searchbox", { name: "Filter articles" }).fill("privacy");
    await expect(page.getByRole("link", { name: /Article 20\b/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Article 170/ })).toHaveCount(0);
    await noHorizontalScroll(page);
  });

  test("full-text search highlights matches in results and in the article", async ({ page }) => {
    await page.goto("/constitution?q=freedom+of+expression");
    const result = page.getByRole("link", { name: "Article 22", exact: true });
    await expect(result).toBeVisible();
    await expect(page.locator("mark").first()).toBeVisible();
    await result.click();
    await expect(page).toHaveURL(/article-22\?hl=/);
    await expect(page.locator("[data-official-text] mark").first()).toBeVisible();
  });

  test("an article page has text, editorial label, related provisions, navigation and source", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.goto("/constitution/article-8");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Article 8");
    await expect(page.getByText("Editorial label")).toBeVisible();
    await expect(page.locator("[data-official-text]")).toHaveText(
      "Subject to article 9, a person born in Seychelles on or after the coming into force of this Constitution, shall become a citizen of Seychelles at the date of birth.",
    );
    await expect(page.getByRole("heading", { name: "This provision refers to" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Source PDF" })).toHaveAttribute("href", /constituteproject\.org/);
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();
    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/article-9$/);
  });

  test("schedules, inserted, repealed and flagged articles are reachable", async ({ page }) => {
    await page.goto("/constitution/article-115a");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Article 115A");
    await page.goto("/constitution/article-52a");
    await expect(page.getByText("Repealed", { exact: true })).toBeVisible();
    await page.goto("/constitution/article-163");
    await expect(page.getByText("Status note")).toBeVisible();
    await page.goto("/constitution/schedule-6--oath-of-allegiance");
    await expect(page.locator("[data-official-text]")).toContainText("bear true allegiance to the Constitution of Seychelles");
  });

  test("a provision that does not exist returns a real 404", async ({ page }) => {
    const res = await page.goto("/constitution/article-999");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});

test.describe("topics", () => {
  test("a topic guide links every statement to provisions", async ({ page }) => {
    await page.goto("/topics");
    await page.getByRole("link", { name: /Arrest and Detention/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Arrest and Detention");
    await expect(page.getByText("Editorial guide written for this site")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What the Constitution alone does not settle" })).toBeVisible();
    await page.getByRole("link", { name: "Article 18", exact: true }).first().click();
    await expect(page).toHaveURL(/article-18$/);
  });

  test("unknown topic is a 404", async ({ page }) => {
    expect((await page.goto("/topics/not-a-topic"))?.status()).toBe(404);
  });
});

test.describe("languages and theme", () => {
  test("switching to French translates the interface, flags it as unreviewed and keeps the legal text in English", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Language", exact: true }).selectOption("fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Connaissez votre Constitution. Connaissez vos droits.");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByText("n'a pas encore été relue")).toBeVisible();
    await page.goto("/constitution/article-1");
    await expect(page.getByText("Texte de la Constitution")).toBeVisible();
    await expect(page.locator("[data-official-text]")).toHaveText("Seychelles is a sovereign democratic Republic.");
    await expect(page.locator("[data-official-text]")).toHaveAttribute("lang", "en");
  });

  test("Kreol Seselwa preview loads and is flagged as unreviewed", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Language", exact: true }).selectOption("crs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Konn ou Konstitisyon. Konn ou Drwa.");
    await expect(page.getByRole("note").filter({ hasText: "pa ankor ganny verifye" })).toBeVisible();
  });

  test("dark mode can be toggled and is remembered", async ({ page }) => {
    await page.goto("/");
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const before = await bg();
    await page.getByRole("button", { name: "Switch colour theme" }).click();
    await expect.poll(bg).not.toBe(before);
    const after = await bg();
    await page.reload();
    expect(await bg()).toBe(after);
  });
});

test.describe("accessibility and security headers", () => {
  for (const path of ["/", "/constitution", "/constitution/article-18", "/topics/privacy", "/about"]) {
    for (const theme of ["light", "dark"] as const) {
      test(`no WCAG A/AA violations on ${path} (${theme})`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("mcs_theme", t), theme);
        await page.goto(path);
        const results = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
      });
    }
  }

  test("answer page has no WCAG A/AA violations", async ({ page }) => {
    // The results fade in; measure contrast on the settled page, not mid-animation.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ask#q=freedom%20of%20expression");
    await expect(page.getByRole("link", { name: "Article 22", exact: true }).first()).toBeVisible();
    const results = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
  });

  test("keyboard users can skip to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  });

  test("security headers are set and the API is not cacheable", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
    const api = await request.post("/api/ask", { data: { question: "freedom of expression" } });
    expect(api.headers()["cache-control"]).toBe("no-store");
    expect((await request.get("/api/ask")).status()).toBe(405);
  });
});
