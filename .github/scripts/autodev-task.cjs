'use strict';
function approvedTask(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.tasks)) throw new Error('Invalid task list');
  const ids = new Set();
  for (const task of data.tasks) {
    if (!task || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(task.id || '') || ids.has(task.id)) throw new Error('Invalid or duplicate task ID');
    ids.add(task.id);
    if (!['approved','completed','blocked'].includes(task.status) || typeof task.instructions !== 'string' || !task.instructions.trim()) throw new Error('Invalid task entry');
  }
  const pending = data.tasks.filter(task => task.status === 'approved');
  if (pending.length > 1) throw new Error('Only one approved task is allowed');
  return pending[0] || null;
}
module.exports = {approvedTask};
