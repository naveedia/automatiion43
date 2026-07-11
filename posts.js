import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export function getAllSlugs() {
  ensureDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostBySlug(slug) {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);
  return { slug, ...data, html };
}

export function getAllPosts() {
  ensureDir();
  const posts = getAllSlugs().map((slug) => {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);
    return { slug, ...data };
  });
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getNextDispatchNumber() {
  const posts = getAllPosts();
  const max = posts.reduce((m, p) => Math.max(m, p.dispatch || 0), 0);
  return max + 1;
}
