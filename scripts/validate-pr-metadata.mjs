const title = process.env.PR_TITLE ?? "";
const branch = process.env.PR_BRANCH ?? "";

const titlePattern = /^(feat|fix|docs|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: .{3,}$/;
const branchPattern = /^(feat|fix|docs|refactor|perf|test|build|ci|chore|release|hotfix)\/(?:\d+-)?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const automatedBranch = /^(dependabot|renovate)\//.test(branch);

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

