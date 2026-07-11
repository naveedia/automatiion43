// Generates one blog post: { title, dek, body(markdown) }
// Works with $0 cost using rotating templates.
// If GEMINI_API_KEY is set (free tier at ai.google.dev), it upgrades to
// real AI-written prose instead — same interface, no code changes needed.

const ANGLES = [
  (t) => `The quiet shift happening in ${t}`,
  (t) => `Why ${t} looks different this year`,
  (t) => `Five small changes reshaping ${t}`,
  (t) => `What nobody tells you about ${t}`,
  (t) => `${cap(t)}: what's actually working right now`,
  (t) => `The habits people are dropping in ${t}`,
  (t) => `A closer look at ${t} in 2026`
];

const OPENERS = [
  "It's easy to miss how much has changed until you stop and look closely.",
  "A lot of the advice out there hasn't caught up with how people actually live now.",
  "The shift didn't happen overnight, but it's clearly happened.",
  "Most people are already adjusting, even if they haven't named it yet.",
  "There's a gap between what's trending and what's actually useful — this sits in the useful pile."
];

const SECTION_STARTERS = [
  "What's changing",
  "Why it matters",
  "What to try this week",
  "The trade-offs",
  "Where this is headed"
];

const FILLERS = [
  "It's less about doing more and more about doing the right few things consistently.",
  "Small, repeatable choices tend to beat big one-off efforts here.",
  "The people getting the most out of this aren't the ones with the most complicated systems.",
  "Cost and effort matter — the best approach is usually the one you'll actually keep up.",
  "It's worth revisiting your assumptions every few months instead of setting a routine and forgetting it.",
  "Context matters more than any universal rule; what works for one household or schedule may not for another.",
  "Starting small and adjusting based on what you notice beats committing to a rigid plan upfront."
];

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function templatePost(topic, dispatch) {
  const angleFn = pick(ANGLES, dispatch);
  const title = angleFn(topic);
  const dek = `A short daily dispatch on ${topic}.`;

  const sections = [];
  for (let i = 0; i < 3; i++) {
    const heading = pick(SECTION_STARTERS, dispatch + i);
    const para = [
      pick(OPENERS, dispatch + i),
      pick(FILLERS, dispatch + i + 1),
      pick(FILLERS, dispatch + i + 3)
    ].join(" ");
    sections.push(`## ${heading}\n\n${para}`);
  }

  const body = `${pick(OPENERS, dispatch)}\n\n${sections.join("\n\n")}\n\n---\n\n*This dispatch was generated automatically as part of a daily publishing routine covering ${topic}.*`;

  return { title, dek, body };
}

async function geminiPost(topic) {
  const key = process.env.GEMINI_API_KEY;
  const prompt = `Write a short, genuinely useful ~350 word blog post about "${topic}" for a general daily-interest audience. 
Return strict JSON only, no markdown fences, with keys: title (string, under 70 chars), dek (one sentence summary), body (markdown string with 2-3 "## " subheadings). Do not include the title inside body.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9 }
      })
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function generatePost(topic, dispatch) {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await geminiPost(topic);
    } catch (err) {
      console.error("Gemini generation failed, falling back to template:", err.message);
    }
  }
  return templatePost(topic, dispatch);
}
