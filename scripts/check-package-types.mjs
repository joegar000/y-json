import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "attw.cmd" : "attw";
const result = spawnSync(command, ["--pack", ".", "--profile", "esm-only"], {
  env: {
    ...process.env,
    npm_config_dry_run: "false",
  },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
