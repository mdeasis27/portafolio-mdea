"""Record new verification evidence after source changes; no server or publication."""
import concurrent.futures
import json
import os
import subprocess
import sys
from pathlib import Path

hub=Path(__file__).resolve().parents[1]
names=['portafolio-mdea']+sorted(path.stem for path in (hub/'content/projects/en').glob('*.mdx'))
if len(sys.argv)>1:names=[name for name in names if name in sys.argv[1:]]

def verify(name):
    root=hub.parent/name
    quality=root/'docs/quality'
    package=json.loads((root/'package.json').read_text(encoding='utf-8'))
    tests=['pnpm.cmd','test'] if 'test' in package['scripts'] else ['node','--test','scripts/portfolio-content.test.mjs','scripts/ai-sync.test.mjs','scripts/brand-sync.test.mjs','scripts/lib/sync-kit.test.mjs','scripts/lib/propagate.test.mjs','scripts/lib/load-config.test.mjs','design-system/demo/foundation.node-test.mjs']
    commands=[('test',tests),('lint',['pnpm.cmd','run','lint']),('types',['node','node_modules/typescript/bin/tsc','--noEmit','--incremental','false']),('build',['pnpm.cmd','run','build'])]
    records=[]
    env=dict(os.environ)
    for key in ['DATABASE_URL','SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','NEXT_PUBLIC_SUPABASE_ANON_KEY','OPENROUTER_API_KEY','TRUORA_API_KEY','EXA_API_KEY','TAVILY_API_KEY']:
        env[key]=''
    for label,command in commands:
        log=quality/f'decision-lab-{label}.log'
        with log.open('w',encoding='utf-8') as output:
            result=subprocess.run(command,cwd=root,env=env,stdout=output,stderr=subprocess.STDOUT)
        records.append({'command':' '.join(command),'exitCode':result.returncode,'log':log.name})
        print(name,label,result.returncode,flush=True)
        (quality/'decision-lab-verification.json').write_text(json.dumps({'commands':records},indent=2),encoding='utf-8')
    return {'repository':name,'commands':records}

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results=list(pool.map(verify,names))
(hub/'docs/quality/decision-lab-command-batch.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
assert all(command['exitCode']==0 for result in results for command in result['commands']), 'Inspect decision-lab command logs'
