#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const pkgPath = new URL("../package.json", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

const [major, minor, patch] = pkg.version.split(".").map(Number);
pkg.version = `${major}.${minor}.${patch + 1}`;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
execSync(`git add package.json`, { stdio: "inherit" });

console.log(`Version bumped to ${pkg.version}`);
