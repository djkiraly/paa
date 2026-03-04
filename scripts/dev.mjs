import { config } from "dotenv";
config();

const { spawn } = await import("child_process");
const args = process.argv.slice(2);
const child = spawn("node", ["node_modules/next/dist/bin/next", ...args], {
  stdio: "inherit",
  env: process.env,
  cwd: process.cwd(),
});
child.on("exit", (code) => process.exit(code ?? 0));
