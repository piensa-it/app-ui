const title = process.env.PR_TITLE ?? "";
const branch = process.env.PR_BRANCH ?? "";

const titlePattern = /^(feat|fix|docs|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: .{3,}$/;
const branchPattern = /^(feat|fix|docs|refactor|perf|test|build|ci|chore|release|hotfix)\/(?:\d+-)?[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Las ramas que abren los bots no eligen su nombre: Dependabot y Renovate
// llevan el suyo, y el agente de Copilot abre siempre `copilot/...`. El título
// del PR sí se les exige, que eso lo escriben.
const automatedBranch = /^(dependabot|renovate|copilot)\//.test(branch);

const errors = [];

if (!titlePattern.test(title)) {
  errors.push(`PR title must follow Conventional Commits. Received: "${title}"`);
}

if (!automatedBranch && !branchPattern.test(branch)) {
  errors.push(`Branch must follow <type>/<issue>-<description>. Received: "${branch}"`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`PR metadata verified: ${branch} -> ${title}`);

