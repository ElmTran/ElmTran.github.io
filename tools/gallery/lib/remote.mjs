/**
 * Uploads for tools/gallery/photos.mjs, through rclone. The remote `r2:` and its keys come from the RCLONE_CONFIG_R2_*
 * environment variables (~/devenv/env/20-r2.sh); this file only needs the bucket name. Set PHOTOS_REMOTE to upload
 * somewhere else instead, e.g. a local directory for a test run.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const OPTS = { maxBuffer: 64 * 1024 * 1024 };

/** Where uploads go: PHOTOS_REMOTE, else r2:$R2_BUCKET. */
export function remoteTarget() {
  if (process.env.PHOTOS_REMOTE) return process.env.PHOTOS_REMOTE.replace(/\/+$/, "");
  if (process.env.R2_BUCKET) return `r2:${process.env.R2_BUCKET}`;
  throw new Error("没有设置 R2_BUCKET（在 ~/devenv/env/20-r2.sh 里）。打开一个新终端，或先执行 source ~/devenv/init.sh");
}

async function rclone(args) {
  try {
    return (await run("rclone", args, OPTS)).stdout;
  } catch (err) {
    if (err.code === "ENOENT") throw new Error("找不到 rclone（应在 ~/.local/bin）");
    const detail = String(err.stderr || err.message).trim().split("\n").slice(-3).join("\n");
    throw new Error(`rclone ${args[0]} 失败：\n${detail}`);
  }
}

/** File names directly under `dir` on the remote (no subfolders). */
export async function listFiles(target, dir = "") {
  const out = await rclone(["lsf", "--files-only", "--max-depth", "1", dir ? `${target}/${dir}` : target]);
  return new Set(out.split("\n").filter(Boolean));
}

/**
 * Copy the contents of local `dir` into `target/prefix`. With `immutable`, a remote file that already exists is
 * skipped if its content is identical (a re-run) and is an error if it differs, so an original is never overwritten.
 */
export async function upload(dir, target, prefix = "", { immutable = false } = {}) {
  const args = ["copy", dir, prefix ? `${target}/${prefix.replace(/\/+$/, "")}` : target, "--checksum"];
  if (immutable) args.push("--immutable");
  await rclone(args);
}
