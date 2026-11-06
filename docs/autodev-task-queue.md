# Clinic Map task-file queue

Normal task registration uses `.github/autodev/tasks.json` through reviewed GitHub
commits/PRs, rather than editing Actions settings on each cycle. Only one entry
may have `status: "approved"`. Each entry needs a unique lowercase id,
status (`approved`, `completed`, or `blocked`), and nonempty instructions.
After review, merge and deployment verification, mark the old entry completed
and append the next approved entry **in one commit**. Preserve old IDs forever.
No approved entries means no AI invocation; ambiguous or malformed files fail closed.

The daily 09:00 KST GitHub schedule may be delayed. The local 10:00 review keeps
waiting without disabling development merely for a delay. Human review, exact
patch verification, tests/build/types, Vercel/live checks and the user's existing
scope limits remain mandatory. The development model cannot edit this queue,
workflows or policy. It retains read-only GitHub permissions and drop-sudo.

The existing ENABLED variable is an emergency stop; OPENAI_API_KEY stays encrypted.
Neither is rewritten during ordinary task registration. Legacy TASK/TASK_ID
variables are retained for history but are no longer read. No keys, permissions,
model settings or OpenAI project billing controls changed; the existing enforced
USD10 monthly project budget remains the cost control.

Each eligible run saves a 90-day `autodev-claim-<id>` artifact before development.
Claim-upload failure prevents the develop job from starting. Gates inspect retained
claim metadata across prior runs, plus old per-task run titles for pre-migration
attempts and open PR branch/body markers. Failed/cancelled/setup attempts consume
their claimed ID; no automatic retry with new IDs. History/API errors fail closed,
and more than 1000 runs requires reconciliation. Claims/history are retention-limited,
not a permanent billing ledger; never delete/reuse IDs in this file.

Gate and development both pin the event commit. Before invoking Codex, a separate
trusted step rechecks the currently approved main task's ID/digest and enable flag.
An approval changed after that recheck may race with an already-starting call;
cancel an active workflow to stop it. A file edit alone does not revoke an API request.

Run manual dispatch with verify_only=true to execute schema/gate tests without
claims or AI invocation. The default scheduled path remains normal execution.
The first migrated task preserves comparison-link-a11y-20261107 and its approved
instructions. No paid retry was authorized or performed for this migration.
