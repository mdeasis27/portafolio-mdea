"""Consolidate actual passing artifacts and inspect repository state."""
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

hub = Path(__file__).resolve().parents[1]
slugs = sorted(path.stem for path in (hub/'content/projects/en').glob('*.mdx'))
repositories, browsers, assets = [], [], []
test_count = 0
for name in ['portafolio-mdea'] + slugs:
    root = hub.parent/name
    quality = root/'docs/quality'
    record = json.loads((quality/'decision-lab-verification.json').read_text(encoding='utf-8'))
    assert len(record['commands']) == 4 and all(command['exitCode'] == 0 for command in record['commands']), name
    log = re.sub(r'\x1b\[[0-9;]*m', '', (quality/'decision-lab-test.log').read_text(encoding='utf-8'))
    counts = re.findall(r'# tests (\d+)', log) or re.findall(r'Tests\s+(\d+) passed', log)
    assert counts, name
    count = sum(map(int, counts))
    test_count += count
    branch = subprocess.run(['git', 'branch', '--show-current'], cwd=root, capture_output=True, text=True, check=True).stdout.strip()
    assert branch == 'feat/memorable-decision-labs', name
    diff = subprocess.run(['git', 'diff', '--check'], cwd=root, capture_output=True, text=True)
    assert diff.returncode == 0, name + diff.stdout
    repositories.append({'repository': name, 'branch': branch, 'testCount': count, **record})
    if name == 'portafolio-mdea':
        continue
    browser = json.loads((quality/'decision-lab-browser.json').read_text(encoding='utf-8'))
    assert not browser.get('failure') and not browser['errors'] and len(browser['checks']) == 2, name
    for check in browser['checks']:
        for field in ['mobileNoOverflow', 'reducedMotion', 'keyboard', 'noRequests', 'sceneChangesWithScenario', 'editingClearsPresetAndTrace', 'resetRestoresFirstPreset', 'cancelControlPresent', 'presetRestoresAllInputs']:
            assert check[field], name + '/' + field
    browsers.append(browser)
    for filename in ['cover.png', 'demo.png', 'demo.es.png', 'demo.mobile.png', 'scenario-a.png', 'scenario-b.png', 'scenario-a.es.png', 'scenario-b.es.png']:
        file = root/'docs/images'/filename
        data = file.read_bytes()
        assert data[:8] == b'\x89PNG\r\n\x1a\n', str(file)
        assets.append({'repository': name, 'file': filename, 'sha256': hashlib.sha256(data).hexdigest(), 'width': int.from_bytes(data[16:20], 'big'), 'height': int.from_bytes(data[20:24], 'big')})
    for suffix in ['.png', '.es.png', '.stage.png', '.stage.es.png']:
        assert (hub/'public/project-captures'/(name+suffix)).is_file()
    for filename in ['README.md', 'README.es.md']:
        text = (root/filename).read_text(encoding='utf-8')
        for target in re.findall(r'\]\((docs/[^)]+)\)', text):
            assert (root/target).is_file(), name+'/'+target
        assert 'decision-lab-verification.json' in text and 'decision-lab-browser.json' in text
        assert not re.search(r'Truora|Acme Corp|Northwind|Contoso|Globex', text, re.I), name
preview = json.loads((hub/'docs/quality/decision-lab-local-preview.json').read_text(encoding='utf-8'))
assert len(preview['previews']) == 21 and not preview['errors'] and not preview['externalRequests']
for filename in ['decision-lab-gallery.png', 'decision-lab-gallery.en.png']:
    assert (hub/'docs/quality'/filename).is_file()
report = {'recordedAt': datetime.now(timezone.utc).isoformat(), 'repositoryCount': len(repositories), 'testCount': test_count,
          'commands': repositories, 'browserComponents': browsers, 'assets': assets, 'localPreviews': preview,
          'scope': 'Actual React components and production CSS, controlled locale/navigation. No new Next server, route certification, publication or deployment.'}
(hub/'docs/quality/decision-lab-acceptance.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
(hub/'docs/quality/decision-lab-commands.json').write_text(json.dumps({'repositories': repositories, 'testCount': test_count, 'repositoryCount': len(repositories)}, indent=2), encoding='utf-8')
(hub/'docs/quality/decision-lab-browser.json').write_text(json.dumps(browsers, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'{len(repositories)} repositories / {test_count} tests / 88 command checks / {len(browsers)} bilingual browser components / 21 file previews / {len(assets)} PNG assets verified.')
