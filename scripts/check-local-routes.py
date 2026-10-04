"""Check primary entry routes and optional example pages without remote requests."""
import json
import argparse
import os
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

hub=Path(__file__).resolve().parents[1]
workspace=hub.parent
repositories=sorted(path.stem for path in (hub/'content/projects/en').glob('*.mdx'))
parser=argparse.ArgumentParser()
parser.add_argument('--repository',choices=repositories)
args=parser.parse_args()
report_path=hub/'docs/quality/entry-route-acceptance.json'
report=json.loads(report_path.read_text(encoding='utf-8')) if args.repository and report_path.exists() else []
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for index,repository in enumerate(repositories):
  if args.repository and repository!=args.repository:continue
  root=workspace/repository
  base=f'http://localhost:{3400+index}'
  entry={'repository':repository,'routes':[],'errors':[]}
  log=open(root/'docs/quality/entry-server.log','w',encoding='utf-8')
  env=dict(os.environ)
  for key in ['DATABASE_URL','SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','NEXT_PUBLIC_SUPABASE_ANON_KEY','OPENROUTER_API_KEY','TRUORA_API_KEY','EXA_API_KEY','TAVILY_API_KEY']:
   env[key]=''
  process=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--port',str(3400+index)],cwd=root,env=env,stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
  try:
   for attempt in range(60):
    if process.poll() is not None:raise RuntimeError('Owned server exited before readiness')
    try:
     urllib.request.urlopen(base+'/en',timeout=2)
     break
    except Exception:time.sleep(.3)
   page=browser.new_page(viewport={'width':390,'height':844})
   page.on('pageerror',lambda error:entry['errors'].append(str(error)))
   def guard(route):
    if '/api/' in route.request.url or (route.request.url.startswith('http') and not route.request.url.startswith(base+'/')):
     entry['errors'].append('Unexpected remote/API request: '+route.request.url)
     route.abort()
    else:route.continue_()
   page.route('**/*',guard)
   bodies={}
   for locale in ['en','es']:
    paths=['']
    if repository=='kyc-antifraude':paths.append('/admin')
    if repository=='radar-proveedores':paths.extend(['/history','/supplier/Example%20Supplier'])
    for path in paths:
     response=page.goto(base+'/'+locale+path)
     page.wait_for_load_state('networkidle')
     assert response.status==200,(locale,path,response.status)
     assert page.locator('html').get_attribute('lang')==locale
     body=page.locator('body').inner_text()
     assert 'Cargando informe' not in body and 'Loading report' not in body
     entry['routes'].append({'locale':locale,'path':path or '/','title':page.locator('h1').inner_text(),'noHorizontalOverflow':page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')})
     bodies[(locale,path)]=body
     if path:
      page.screenshot(path=str(root/'docs/images'/('secondary-'+path.split('/')[1]+'.'+locale+'.png')),full_page=True)
   for (_,path) in bodies:
    assert bodies[('en',path)]!=bodies[('es',path)],(repository,path,'Identical public language copy')
   assert not entry['errors'],entry['errors']
   assert all(route['noHorizontalOverflow'] for route in entry['routes']),entry['routes']
   page.close()
   print(repository,'entry and secondary routes passed',flush=True)
  except Exception as error:
   entry['failure']=repr(error)
   print(repository,'FAILED',repr(error),flush=True)
  finally:
   process.terminate()
   try:process.wait(timeout=10)
   except subprocess.TimeoutExpired:process.kill()
   log.close()
   report=[previous for previous in report if previous['repository']!=repository]
   report.append(entry)
   report.sort(key=lambda item:item['repository'])
   report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
 browser.close()
assert len(report)==21 and all(not entry.get('failure') and not entry['errors'] for entry in report), 'Inspect entry-route-acceptance.json'
