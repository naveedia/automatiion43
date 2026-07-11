const API = "https://api.github.com";

function env() {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error(
      "Missing GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO environment variables."
    );
  }
  return {
    token: GITHUB_TOKEN,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH || "main"
  };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };
}

// Returns { sha, content } or null if the file doesn't exist yet.
export async function getFile(filePath) {
  const { token, owner, repo, branch } = env();
  const res = await fetch(
    `${API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
    { headers: headers(token) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${filePath} failed: ${res.status}`);
  const data = await res.json();
  return {
    sha: data.sha,
    content: Buffer.from(data.content, "base64").toString("utf8")
  };
}

// Creates or updates a file. Pass sha when updating an existing file.
export async function putFile(filePath, content, message, sha) {
  const { token, owner, repo, branch } = env();
  const res = await fetch(`${API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {})
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${filePath} failed: ${res.status} ${err}`);
  }
  return res.json();
}
