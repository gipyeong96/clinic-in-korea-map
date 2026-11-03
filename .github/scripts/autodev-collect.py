"""Collect an untrusted proposal, never commit/push/publish it."""
import json
import os
from pathlib import Path
import subprocess

out = Path(os.environ['RUNNER_TEMP']) / 'autodev-result'
out.mkdir(exist_ok=True)
base = os.environ['BASE_SHA']
subprocess.run(['git', 'add', '--intent-to-add', '--', '.'], check=True)
names = subprocess.check_output(['git', 'diff', '--name-only', '-z', base]).decode().split('\0')
names = [name for name in names if name]
patch = subprocess.check_output(['git', 'diff', '--no-ext-diff', '--no-textconv', '--binary', base, '--'])
(out / 'proposal.patch').write_bytes(patch)
(out / 'manifest.json').write_text(json.dumps({
    'task_id': os.environ['TASK_ID'], 'base_sha': base,
    'codex_outcome': os.environ['CODEX_OUTCOME'], 'changed_files': names,
    'review_required': True,
}, indent=2) + '\n')
final = Path(os.environ['RUNNER_TEMP']) / 'autodev-final.md'
if final.is_file():
    (out / 'agent-report.md').write_bytes(final.read_bytes())
print('Collected untrusted proposal; no repository writes or deployment performed.')
