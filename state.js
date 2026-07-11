import fs from "fs";
import path from "path";

const STATE_PATH = path.join(process.cwd(), "content", "state.json");

export function readState() {
  if (!fs.existsSync(STATE_PATH)) return { topicIndex: 0, dispatch: 0 };
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
}

export function writeState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}
