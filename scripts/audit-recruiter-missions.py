"""Create scoped evidence for the approved four-repository recruiter phase."""
import hashlib
import json
import re
import shutil
import struct
import subprocess
from pathlib import Path

hub=Path(__file__).resolve().parents[1]
names=['portafolio-mdea','evidencia','compuerta','destilacion']
commands=[]
tests=0
for name in names:
    root=hub if name=='portafolio-mdea' else hub.parent/name
    quality=root/'docs/quality'
    record=json.loads((quality/'decision-lab-verification.json').read_text(encoding='utf-8'))
    assert len(record['commands'])==4 and all(item['exitCode']==0 for item in record['commands']),name
    for item in record['commands']:
        target=item['log'].replace('decision-lab-','recruiter-missions-')
        shutil.copyfile(quality/item['log'],quality/target)
        item['log']=target
    branch=subprocess.check_output(['git','branch','--show-current'],cwd=root,text=True).strip()
    assert branch=='feat/guided-recruiter-missions',(name,branch)
    subprocess.run(['git','diff','--check'],cwd=root,check=True)
    log=(quality/'recruiter-missions-test.log').read_text(encoding='utf-8')
    match=re.search(r'Tests\s+(\d+)\s+passed',log) or re.search(r'^# pass (\d+)',log,re.M)
    assert match,name
    tests+=int(match.group(1))
    record.update({'repository':name,'branch':branch,'scope':'Guided recruiter missions; current tests, lint, strict types and production build.'})
    (quality/'recruiter-missions-verification.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
    commands.append(record)
browser=json.loads((hub/'docs/quality/recruiter-missions-browser.json').read_text(encoding='utf-8'))
assert len(browser['checks'])==8
assert all(not item['errors'] and not item['externalRequests'] for item in browser['checks'])
for name in names[1:]:
    report=json.loads((hub.parent/name/'docs/quality/decision-lab-browser.json').read_text(encoding='utf-8'))
    assert len(report['checks'])==2 and not report.get('failure') and not report['errors'],name
    assert all(item['presetRestoresAllInputs'] for item in report['checks']),name
kit=hashlib.sha256((hub/'design-system/demo/mission-lab.tsx').read_bytes()).hexdigest()
assert all(hashlib.sha256((hub.parent/name/'design-system/demo/mission-lab.tsx').read_bytes()).hexdigest()==kit for name in names[1:])
assets=[]
for path in sorted((hub/'docs/quality').glob('mission-*.png'))+sorted((hub/'docs/images').glob('recruiter-journey*.png')):
    data=path.read_bytes()
    assert data[:8]==b'\x89PNG\r\n\x1a\n',path
    width,height=struct.unpack('>II',data[16:24])
    assert width>0 and height>0
    assets.append({'path':str(path.relative_to(hub)),'width':width,'height':height,'sha256':hashlib.sha256(data).hexdigest()})
assert len(assets)==20,len(assets)
for name in names[1:]:
    root=hub.parent/name
    for filename in ['mission.png','mission.es.png','mission.mobile.png']:
        assert (root/'docs/images'/filename).is_file(),(name,filename)
    for locale in ['en','es']:
        text=(root/('README.md' if locale=='en' else 'README.es.md')).read_text(encoding='utf-8')
        assert text.count('<!-- recruiter-mission:start -->')==1
        for link in re.findall(r'\]\((docs/[^)]+)\)',text):assert (root/link).is_file(),(name,link)
        case=(hub/f'content/projects/{locale}/{name}.mdx').read_text(encoding='utf-8')
        assert case.count('{/* recruiter-mission:start */}')==1
        assert len(re.findall(r'^## ',case,re.M))==5
local=json.loads((hub/'docs/quality/recruiter-missions-local-preview.json').read_text(encoding='utf-8'))
assert local['passed'] and not local['errors'] and not local['externalRequests']
report={'scope':'Current guided recruiter phase: four repositories. Real browser components and local file previews; Next HTTP routes and deployment remain unverified.','tests':tests,'commandChecks':16,'browserChecks':browser['checks'],'commands':commands,'assets':assets,'localPreview':local,'publication':'Pending; no push, deployment or external publication performed.'}
(hub/'docs/quality/recruiter-missions-acceptance.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
print(f'4 repositories / {tests} tests / 16 command checks / 8 bilingual browser checks / {len(assets)} PNG evidence assets verified')
