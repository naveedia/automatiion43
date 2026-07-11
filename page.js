import { getAllPosts } from "../lib/posts";

export const revalidate = 0;

function formatDate(d) {
  return new Date(d).toISOString().slice(0, 10).replace(/-/g, ".");
}

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="wrap feed">
      {posts.length === 0 ? (
        <p className="empty">
          No dispatches yet. Once the daily automation runs (or you add a post
          manually to content/posts), it will show up here.
        </p>
      ) : (
        posts.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} className="entry">
            <span className="entry-num">№{String(p.dispatch).padStart(3, "0")}</span>
            <div>
              <h2 className="entry-headline">{p.title}</h2>
              <p className="entry-dek">{p.dek}</p>
              <span className="entry-meta">{formatDate(p.date)}</span>
            </div>
          </a>
        ))
      )}
    </main>
  );
}
