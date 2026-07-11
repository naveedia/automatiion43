// Test the generator locally without deploying or touching GitHub:
//   node scripts/local-generate.js
// Writes a real post file into content/posts and updates content/state.json,
// so you can run `npm run dev` right after and see it on the site.

const fs = require("fs");
const path = require("path");

async function main() {
  // Lazy require so this works with the same code the API route uses.
  const { generatePost } = require("../lib/generate");
  const siteConfig = require("../site.config");

  const statePath = path.join(process.cwd(), "content", "state.json");
  const state = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, "utf8"))
    : { topicIndex: 0, dispatch: 0 };

  const topics = siteConfig.topics;
  const topic = topics[state.topicIndex % topics.length];
  const dispatch = state.dispatch + 1;

  const { title, dek, body } = await generatePost(topic, dispatch);

  const date = new Date().toISOString().slice(0, 10);
  const slug = `${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    `dispatch: ${dispatch}`,
    `topic: ${JSON.stringify(topic)}`,
    `dek: ${JSON.stringify(dek)}`,
    "---",
    ""
  ].join("\n");

  const postsDir = path.join(process.cwd(), "content", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  fs.writeFileSync(path.join(postsDir, `${slug}.md`), frontmatter + body);

  fs.writeFileSync(
    statePath,
    JSON.stringify({ topicIndex: state.topicIndex + 1, dispatch }, null, 2)
  );

  console.log(`Wrote content/posts/${slug}.md (dispatch #${dispatch}, topic: "${topic}")`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
