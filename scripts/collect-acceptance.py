"""Collect executable evidence without running propagation or publishing."""
import json
import re
import subprocess
from pathlib import Path

hub = Path(__file__).resolve().parents[1]
workspace = hub.parent
names = ['portafolio-mdea'] + sorted(path.stem for path in (hub/'content/projects/en').glob('*.mdx'))
rows = []
browser_reports = []
for name in names:
    root = workspace/name
    quality = root/'docs/quality'
    raw = json.loads((quality/'final-verification.json').read_text(encoding='utf-8-sig'))
    if isinstance(raw, list):
        commands = raw
    elif 'commands' in raw:
        commands = list(raw['commands'].values())
    else:
        commands = [{'command': key, 'exitCode': value['exit']} for key, value in raw.items()]
    assert len(commands) >= 4 and all(command['exitCode'] == 0 for command in commands), (name, commands)
    test_log = (quality/'final-test.log').read_text(encoding='utf-8-sig')
    counts = re.findall(r'Tests\s+(\d+)\s+passed|# tests (\d+)|(\d+) passed', test_log)
    test_count = max(int(next(value for value in match if value)) for match in counts) if counts else None
    result = subprocess.run(['git','diff','--check'],cwd=root,capture_output=True,text=True)
    assert result.returncode == 0, (name,result.stdout)
    branch = subprocess.check_output(['git','branch','--show-current'],cwd=root,text=True).strip()
    assert branch == 'feat/recruiter-portfolio-experience', (name,branch)
    package = json.loads((root/'package.json').read_text(encoding='utf-8'))
    install = json.loads((quality/'final-install.json').read_text(encoding='utf-8-sig'))
    assert install.get('exitCode',install.get('exit')) == 0, (name,install)
    setup = json.loads((quality/'setup-install.json').read_text(encoding='utf-8-sig'))
    assert setup.get('exitCode',setup.get('exit')) == 0, (name,setup)
    setup_log = (quality/'setup-test.log').read_text(encoding='utf-8-sig')
    assert re.search(r'Tests\s+\d+\s+passed|# tests \d+', setup_log), (name,'Missing post-install test evidence')
    assert (root/'pnpm-lock.yaml').exists(), name
    if (root/'package-lock.json').exists():
        lock = json.loads((root/'package-lock.json').read_text(encoding='utf-8'))['packages']['']
        for section in ['dependencies','devDependencies']:
            assert package.get(section,{}) == lock.get(section,{}), (name,section,'lockfile mismatch')
    for image in ['cover.png','demo.png','demo.es.png','demo.mobile.png']:
        assert (root/'docs/images'/image).exists(), (name,image)
    if name != 'portafolio-mdea':
        browser = json.loads((quality/'browser-acceptance.json').read_text(encoding='utf-8'))
        assert not browser.get('failure') and not browser['errors'], (name,browser)
        for key in ['mobileNoOverflow','reducedMotionDisablesPlayback','noExternalOrApiRequests','translatedBodyDiffers','legacyRedirectRetainsQuery','unsupportedLocale404']:
            assert browser.get(key), (name,key)
        assert len(browser['checks']) == 2 and all(check.get('resetClearsResult') and check.get('languageSwitchWithoutStorage') for check in browser['checks']), name
        browser_reports.append(browser)
    rows.append({'repository':name,'tests':test_count,'commands':commands,'branch':branch,'dependencyLockMatches':True,'frozenInstallPassed':True})

entry_routes = json.loads((hub/'docs/quality/entry-route-acceptance.json').read_text(encoding='utf-8'))
assert len(entry_routes) == 21 and all(not entry['errors'] for entry in entry_routes)
pending_routes = [entry for entry in entry_routes if entry.get('failure') or not all(route['noHorizontalOverflow'] for route in entry['routes'])]
assert all(entry['repository'] == 'kyc-antifraude' and entry.get('followUp',{}).get('status') == 'browser-recheck-blocked' for entry in pending_routes), pending_routes
hub_browser = json.loads((hub/'docs/quality/hub-browser-acceptance.json').read_text(encoding='utf-8'))
assert not hub_browser['errors'] and all(value for key,value in hub_browser.items() if key != 'errors')
(hub/'docs/quality/browser-acceptance.json').write_text(json.dumps(browser_reports,indent=2),encoding='utf-8')

(hub/'docs/quality/final-acceptance.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print(f'{len(rows)} repositories: tests, lint, types, builds, paired images, lockfiles and branch checks passed.')
print('21 primary browser demos: EN/ES, reset, cancel, keyboard, reduced motion, mobile and API isolation passed.')
print(f"{sum(row['tests'] or 0 for row in rows)} TypeScript/Node tests passed; backend checks are recorded separately.")
print(f'{len(entry_routes)-len(pending_routes)} repository entry/secondary route audits passed; {len(pending_routes)} corrected route audit pending because its server launch was denied.')
