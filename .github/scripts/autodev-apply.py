"""Validate the proposal on a separate disposable runner without API secrets."""
import json
import os
from pathlib import Path, PurePosixPath
import subprocess

proposal = Path(os.environ['PROPOSAL_DIR'])
manifest = json.loads((proposal / 'manifest.json').read_text())
head = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()
if manifest['base_sha'] != head or manifest['codex_outcome'] != 'success':
    raise SystemExit('Refusing mismatched or unsuccessful proposal')
patch = proposal / 'proposal.patch'
if not patch.stat().st_size:
    raise SystemExit('No changes proposed; nothing to validate')
subprocess.run(['git', 'apply', '--check', str(patch)], check=True)
subprocess.run(['git', 'apply', '--index', str(patch)], check=True)
names = subprocess.check_output(['git', 'diff', '--cached', '--name-only', '-z']).decode().split('\0')
names = [name for name in names if name]
if sorted(names) != sorted(manifest['changed_files']):
    raise SystemExit('Patch and manifest disagree')
for name in names:
    path = PurePosixPath(name)
    allowed = ((path.parts[0] == 'components' and path.suffix == '.tsx') or
               (path.parts[0] == 'lib' and path.suffix == '.ts') or
               (path.parts[0] == 'tests' and name.endswith('.test.cjs')))
    if not allowed or '..' in path.parts:
        raise SystemExit('Outside initial code/test scope: ' + name)
# Do not allow symbolic links, submodules or binary patch payloads.
for line in subprocess.check_output(['git', 'diff', '--cached', '--raw']).decode().splitlines():
    modes = line.split()[:2]
    if any(mode.lstrip(':') not in ('000000', '100644', '100755') for mode in modes):
        raise SystemExit('Non-regular-file change refused')
if b'GIT binary patch' in patch.read_bytes():
    raise SystemExit('Binary patch refused')
print('Patch scope validated. Semantic restrictions still require human review.')
