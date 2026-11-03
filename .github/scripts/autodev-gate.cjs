'use strict';

module.exports = async function gate({github, context, core, env}) {
  core.setOutput('run', 'false');
  const skip = reason => core.summary.addRaw(`Autodev skipped: ${reason}\n`).write();
  if (env.AUTODEV_ENABLED !== 'true') return skip('explicit enable switch is off');
  if (env.AUTODEV_KEY_PRESENT !== 'true') return skip('API key is absent');
  if (!env.AUTODEV_TASK?.trim()) return skip('approved task is empty');
  const id = env.AUTODEV_TASK_ID || '';
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) throw new Error('Provide a stable lowercase task ID (1–64 letters/digits/hyphens)');
  if (context.ref !== 'refs/heads/main') throw new Error('Only the default main branch may start autodev');
  const repo = context.repo;
  // Query failures abort the gate; never assume a missing API response means no duplicates.
  const pulls = await github.paginate(github.rest.pulls.list, {...repo, state: 'open', per_page: 100});
  if (pulls.some(pr => pr.head.ref === `autodev/${id}` || (pr.body || '').includes(`<!-- clinic-autodev:${id} -->`))) {
    return skip('a draft/open PR already tracks this task');
  }
  const first = await github.rest.actions.listWorkflowRuns({...repo, workflow_id: 'clinic-autodev.yml', per_page: 100, page: 1});
  // GitHub run history is not a permanent ledger. Fail closed rather than silently truncate.
  if (first.data.total_count > 1000) throw new Error('Run history exceeds the audited 1000-run window; human reconciliation required');
  const runs = [...first.data.workflow_runs];
  for (let page = 2; runs.length < first.data.total_count; page++) {
    const next = await github.rest.actions.listWorkflowRuns({...repo, workflow_id: 'clinic-autodev.yml', per_page: 100, page});
    if (!next.data.workflow_runs.length) throw new Error('Incomplete run history; refusing AI execution');
    runs.push(...next.data.workflow_runs);
  }
  for (const run of runs) {
    if (run.id === context.runId) continue;
    if (run.display_title !== `Clinic autodev / ${id}`) continue;
    const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRun, {...repo, run_id: run.id, filter: 'all', per_page: 100});
    if (jobs.some(job => job.name === 'Develop approved task' && job.conclusion !== 'skipped')) {
      return skip('a previous attempt exists, including failed, cancelled or timed-out attempts');
    }
  }
  // Rerunning the same workflow run must not issue a second paid invocation.
  if (Number(context.runAttempt || env.GITHUB_RUN_ATTEMPT || 1) > 1) return skip('reruns require human reconciliation and a new approved task ID');
  const main = await github.rest.repos.getCommit({...repo, ref: 'main'});
  core.setOutput('task_id', id);
  core.setOutput('task_digest', require('node:crypto').createHash('sha256').update(env.AUTODEV_TASK.trim()).digest('hex'));
  core.setOutput('base_sha', main.data.sha);
  core.setOutput('run', 'true');
  await core.summary.addRaw(`Approved single task: ${id}; patch/artifact output only.\n`).write();
};
