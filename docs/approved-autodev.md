# Approved single-task autodev — review-only draft

This workflow uses **GitHub-hosted ubuntu-latest runners**, not the published
Codex cloud development environment or its snapshot, startup skill, credentials,
network policy or running processes. It does not connect to that environment.
No API invocation, key registration, schedule activation, merge or deployment was
performed when preparing this draft. PR #89 is a separate address-copy change.

## Default off and future setup (only after separate cost approval)

The proposed `.github/workflows/clinic-autodev.yml` declares `0 0 * * *`:
00:00 UTC / 09:00 KST daily. GitHub can delay or drop busy scheduled runs; this is
not a guaranteed 09:00 execution SLA. Schedules run from the default branch only.
A branch/draft PR does not activate this schedule. Do not merge or enable it until
the user separately approves API costs and key registration.

All these repository settings must be present to allow one paid agent run
(which may make multiple model API requests):

| Setting | Kind | Requirement |
| --- | --- | --- |
| `CLINIC_MAP_AUTODEV_ENABLED` | Repository variable | Exactly `true`; absent, `TRUE`, whitespace or other values skip |
| `OPENAI_API_KEY` | Actions repository secret | Nonempty; never a repository variable or committed file |
| `CLINIC_MAP_AUTODEV_TASK` | Repository variable | One explicit, user-approved task; blank skips without AI |
| `CLINIC_MAP_AUTODEV_TASK_ID` | Repository variable | Stable unique lowercase ID, 1–64 letters/digits/hyphens, starts alphanumeric |
| `CLINIC_MAP_AUTODEV_MODEL` | Optional repository variable | Leave unset to use Action/Codex default; set only on explicit user choice |

These are future instructions, not permission to add a key or change settings now.
The manual dispatch has the same gates, with no bypass input. Only main may run.
A task hash and ID are checked again immediately before AI execution; changing an
approval during preparation aborts. Turn the switch off or clear the task to stop
future calls. A running API call is not revoked by changing a variable; cancel its
workflow separately if required. Do not use manual retries as a new approval.

## One task, duplicate prevention, previous outcomes

A workflow-wide concurrency group serializes runs (`cancel-in-progress: false`).
Gate queries all open PRs, including drafts, and previous runs of this workflow.
Any PR with head `autodev/<task-id>` or body marker
`<!-- clinic-autodev:<task-id> -->` blocks that task. Use both conventions if a
human later creates a PR from an artifact. Existing PR #89 is not modified.

A prior `Develop approved task` job for the same run-name/task ID blocks another
attempt whether successful, failed, cancelled, timed out or still in progress.
Even a dependency/setup failure conservatively consumes that attempt. Jobs skipped
by a disabled/empty gate do not consume it. Re-runs of a workflow run are blocked.
Closed/merged proposals remain blocked by the prior run history while retained.
Changing task text does not reset the same ID. Only a human may authorize a new ID
following a reviewed failure; changing IDs solely to bypass deduplication is forbidden.

API errors and incomplete history fail closed. More than 1000 workflow runs also
requires human reconciliation rather than ignoring older results. GitHub run/job
history is not a permanent ledger: deleting runs or retention cleanup can erase
prior attempts. Keep the switch off until approved execution, preserve run history,
record consumed IDs externally, and never reuse an ID after history is removed.
This is best-effort deduplication under retained history, not exactly-once billing.

## Permissions and outputs

- Gate: `contents: read`, `actions: read`, `pull-requests: read`; API-key presence
  boolean only. It records the chosen task ID and exact latest main SHA.
- Develop: `contents: read`, checkout credentials not persisted, one Codex action
  invocation with API key passed only to its input. Node 24 and `npm ci` run first.
  `permission-profile: ':workspace'` and `safety-strategy: drop-sudo` are supported
  official inputs; no network access is granted to model shell commands. The managed
  proxy provides model access. No privileged commands run after the action.
- Validation: a fresh runner, no OpenAI key, no GitHub write permissions. Checks
  a collected patch against an initial code/test path allowlist, rejects symlinks,
  submodules and binary patches, then installs the unchanged lockfile and records
  tests, build and TypeScript exit statuses/logs. Applying the patch is local only.
- No job receives a push/PR write token; no automated publishing job exists in this
  first version. Output is a 30-day artifact containing `proposal.patch`, manifest
  and untrusted agent report, plus a separate checks artifact and run summary.
  Failed action attempts collect partial output when possible. A hard timeout or
  cancelled runner may leave no artifact; inspect the failed run before retrying.

The AI job and fresh validation runner each have a 30-minute timeout (gate: three
minutes); these are job deadlines, not a 30-minute bound on the whole pipeline.
Only one task and AI invocation may occur per eligible run. Artifacts are untrusted:
no automatic commit, main push, draft PR, merge, deployment, DB write, medical copy,
noindex/advertising/analytics changes, new dependencies/secrets or workflow changes.
The path gate protects automation/manifests/DB paths, but cannot prove semantic
medical or advertising safety inside UI/helper files. Human diff review is required.
Also review artifacts/logs for sensitive content before sharing. Do not treat an
agent report as evidence that tests passed; inspect the separate validation job.

Repository/package scripts execute untrusted proposal code on a disposable runner.
Job separation and read-only tokens reduce exposure, not a complete isolation or
cost guarantee. The Codex Action itself installs its official CLI/proxy tools;
this proposal adds no application dependency and forbids agent dependency changes.

## Cost and model limits

OpenAI API usage is separately billable; no existing ChatGPT subscription or Codex
cloud environment credit is assumed to cover it. No model name, reasoning effort,
API budget flag or dollar cap is invented here. Empty `model` preserves the official
default. Prompt limits and Actions timeouts are **not hard spending caps**. Review
actual API usage and provider-supported billing controls independently before
activation. A prompt mentioning a budget would not enforce a real spending ceiling.

## Static verification and review

Run locally without invoking Codex or registering secrets:

```sh
node --check .github/scripts/autodev-gate.cjs
node --test .github/scripts/autodev-gate.test.cjs
python3 -m py_compile .github/scripts/autodev-collect.py .github/scripts/autodev-apply.py
# Parse workflow YAML, validate embedded shell/Python syntax and inspect permissions/diff.
git diff --check
```

For this draft, actionlint 1.7.7 passed (official release checksum verified;
external shellcheck/pyflakes integrations disabled), six mocked gate tests passed,
Python/JavaScript and embedded script syntax passed, and configured Codex inputs
matched the fetched official v1 action.yml. No AI/Actions run was executed.

These checks do not prove hosted Actions permissions, Codex runtime compatibility,
API billing, actual schedules or artifact execution. No app regression rerun is
needed for this workflow-only proposal. Before a future authorized pilot, inspect
the workflow and current upstream v1 action again, preserve existing .github files,
confirm the actor has repository write access (the official Action checks it),
review task scope/ID and retained history, and obtain explicit cost/key approval.

Official sources checked 2026-11-03:
- https://github.com/openai/codex-action/tree/v1
- https://github.com/openai/codex-action/blob/v1/action.yml
- https://github.com/openai/codex-action/blob/v1/docs/security.md

`@v1` is the requested moving official version tag, not an immutable supply-chain
pin. Supported inputs were checked against that tag's current action.yml; recheck
upstream changes before activation. This draft makes no hosted execution claim.
