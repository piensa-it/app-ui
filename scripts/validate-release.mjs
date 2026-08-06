import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const tag = process.env.RELEASE_TAG ?? process.argv[2] ?? "";
const expectedTag = `v${packageJson.version}`;

if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
  console.error(`Release tag must use semantic versioning (vX.Y.Z). Received: "${tag}"`);
  process.exit(1);
}

if (tag !== expectedTag) {
  console.error(`Release tag ${tag} does not match package.json version ${packageJson.version}. Expected ${expectedTag}.`);
  process.exit(1);
}

console.log(`Release verified: ${packageJson.name}@${packageJson.version} -> ${tag}`);

