const {test}=require('node:test');
const assert=require('node:assert/strict');
const gate=require('./autodev-gate.cjs');
function fixture(overrides={}){
 const outputs={};const summary=[];let calls=0;
 const pulls=[];const runs=[];const jobs=[];
 const api={pulls:{list:'pulls'},actions:{listJobsForWorkflowRun:'jobs',listWorkflowRuns:async()=>{calls++;return {data:{total_count:runs.length,workflow_runs:runs}};}},repos:{getCommit:async()=>{calls++;return {data:{sha:'a'.repeat(40)}};}}};
 const github={rest:api,paginate:async method=>{calls++;return method==='pulls'?pulls:jobs;}};
 const core={setOutput:(k,v)=>{outputs[k]=v;},summary:{addRaw(text){summary.push(text);return this;},async write(){}}};
 const context={repo:{owner:'owner',repo:'repo'},ref:'refs/heads/main',runId:50,runAttempt:1};
 const env={AUTODEV_ENABLED:'true',AUTODEV_KEY_PRESENT:'true',AUTODEV_TASK:'One approved task',AUTODEV_TASK_ID:'task-1',...overrides};
 return {outputs,summary,pulls,runs,jobs,github,core,context,env,get calls(){return calls;},run(){return gate(this);}};
}
test('off, non-exact true, missing key and blank task never reach remote APIs',async()=>{
 for(const values of [{AUTODEV_ENABLED:''},{AUTODEV_ENABLED:'TRUE'},{AUTODEV_ENABLED:' true'},{AUTODEV_KEY_PRESENT:'false'},{AUTODEV_TASK:' \n '}]){
  const f=fixture(values);await f.run();assert.equal(f.outputs.run,'false');assert.equal(f.calls,0);
 }
});
test('single approval pins latest main SHA and the approved task digest',async()=>{
 const f=fixture();await f.run();assert.equal(f.outputs.run,'true');assert.equal(f.outputs.base_sha,'a'.repeat(40));assert.match(f.outputs.task_digest,/^[a-f0-9]{64}$/);
});
test('open draft PR branch or marker prevents duplicate work',async()=>{
 for(const pr of [{head:{ref:'autodev/task-1'},body:''},{head:{ref:'other'},body:'<!-- clinic-autodev:task-1 -->'}]){
  const f=fixture();f.pulls.push(pr);await f.run();assert.equal(f.outputs.run,'false');
 }
});
test('past successful, failed, cancelled, timed-out or running development blocks a second attempt',async()=>{
 for(const conclusion of ['success','failure','cancelled','timed_out',null]){
  const f=fixture();f.runs.push({id:49,display_title:'Clinic autodev / task-1'});f.jobs.push({name:'Develop approved task',conclusion});await f.run();assert.equal(f.outputs.run,'false');
 }
});
test('disabled/skipped historical jobs do not consume the task; a different task does not block',async()=>{
 const f=fixture();f.runs.push({id:49,display_title:'Clinic autodev / task-1'});f.jobs.push({name:'Develop approved task',conclusion:'skipped'});await f.run();assert.equal(f.outputs.run,'true');
 const g=fixture();g.runs.push({id:49,display_title:'Clinic autodev / another-task'});g.jobs.push({name:'Develop approved task',conclusion:'success'});await g.run();assert.equal(g.outputs.run,'true');
});
test('same run retry, wrong branch, bad ID, API denial and truncated history fail closed',async()=>{
 const retry=fixture();retry.context.runAttempt=2;await retry.run();assert.equal(retry.outputs.run,'false');
 const branch=fixture();branch.context.ref='refs/heads/other';await assert.rejects(branch.run(),/main/);
 const id=fixture({AUTODEV_TASK_ID:'$(untrusted)'});await assert.rejects(id.run(),/task ID/);
 const denied=fixture();denied.github.paginate=async()=>{throw new Error('Forbidden');};await assert.rejects(denied.run(),/Forbidden/);assert.equal(denied.outputs.run,'false');
 const large=fixture();large.github.rest.actions.listWorkflowRuns=async()=>({data:{total_count:1001,workflow_runs:[]}});await assert.rejects(large.run(),/history/);
});
