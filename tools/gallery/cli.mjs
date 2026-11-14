/**
 * Entry point for `pnpm photos`. The tool's dependencies live in tools/gallery/node_modules, which a fresh clone or
 * worktree doesn't have; say how to install them instead of failing with a bare stack trace.
 */
try {
  await import("./photos.mjs");
} catch (err) {
  if (err?.code !== "ERR_MODULE_NOT_FOUND") throw err;
  const missing = /package '([^']+)'/.exec(err.message)?.[1];
  console.error(`出错：上传工具的依赖还没装${missing ? `（缺少 ${missing}）` : ""}。在仓库根目录先执行一次：`);
  console.error("  ONNXRUNTIME_NODE_INSTALL=skip npm --prefix tools/gallery install");
  process.exitCode = 1;
}
