import json
import os
import subprocess
import time
import urllib.request
import sys
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

workspace = Path(__file__).resolve().parents[2]
repositories = sorted(path.stem for path in (workspace / 'portafolio-mdea/content/projects/en').glob('*.mdx'))
ports = {name: 3300 + index for index, name in enumerate(repositories)}
if len(sys.argv) > 1:
    repositories = [name for name in repositories if name in sys.argv[1:]]
report = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for repo in repositories:
        root = workspace / repo
        port = ports[repo]
        base_url = f'http://localhost:{port}'
        (root / 'docs/quality').mkdir(parents=True,exist_ok=True)
        log = open(root / 'docs/quality/browser-server.log', 'w', encoding='utf-8')
        environment = {key: value for key, value in os.environ.items() if not any(word in key.upper() for word in ['API_KEY', 'DATABASE_URL', 'SUPABASE', 'LLM_KEY'])}
        process = subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'start', '--port', str(port)], cwd=root, env=environment, stdout=log, stderr=log, creationflags=subprocess.CREATE_NO_WINDOW)
        entry = {'repository':repo, 'checks':[], 'errors':[]}
        try:
            for attempt in range(80):
                if process.poll() is not None:
                    raise RuntimeError('Owned server exited before readiness; inspect browser-server.log')
                try:
                    urllib.request.urlopen(base_url + '/en/app', timeout=2)
                    break
                except Exception:
                    time.sleep(.5)
            page = browser.new_page(viewport={'width':1440,'height':1000})
            forbidden_requests = []
            def guard_request(route):
                url = route.request.url
                if '/api/' in url or (url.startswith('http') and not url.startswith(base_url + '/')):
                    forbidden_requests.append(url)
                    route.abort()
                else:
                    route.continue_()
            page.route('**/*', guard_request)
            page.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new Error('Storage unavailable')}})")
            page.on('pageerror', lambda error: entry['errors'].append(str(error)))
            page.on('console', lambda message: entry['errors'].append(message.text) if message.type == 'error' else None)
            images = root / 'docs/images'
            images.mkdir(parents=True,exist_ok=True)
            texts = {}
            response = page.goto(base_url + '/app?acceptance=1')
            assert '/en/app?acceptance=1' in page.url, page.url
            entry['legacyRedirectRetainsQuery'] = True
            response = page.goto(base_url + '/fr/app')
            assert response.status == 404, response.status
            entry['unsupportedLocale404'] = True
            entry['errors'].clear()  # The unsupported route intentionally returns HTTP 404.
            for locale in ['en','es']:
                response = page.goto(base_url + '/'+locale+'/app', timeout=60000)
                page.wait_for_load_state('networkidle')
                page.add_style_tag(content='nextjs-portal{display:none!important}')
                assert response.status == 200, (locale,response.status)
                entry['checks'].append({'locale':locale,'htmlLang':page.locator('html').get_attribute('lang')})
                texts[locale] = page.locator('body').inner_text()
                buttons = page.get_by_role('button')
                button_texts = buttons.all_text_contents()
                entry['checks'][-1]['buttons'] = button_texts
                entry['checks'][-1]['inputs'] = page.locator('input,textarea,select').count()
                field = page.locator('input,textarea,select').first
                original_value = field.input_value()
                original_checked = field.is_checked() if field.get_attribute('type') == 'checkbox' else None
                # Discover actual controls from the rendered DOM before acting.
                candidates = []
                for i,label in enumerate(button_texts):
                    if any(word in label.lower() for word in ['run','simulate','evaluate','resolve','analy','extract','generate','execute','route','validate','retrieve','traverse','assemble','check','interpret','preview','arbitrate','assess','replay','ejecut','simular','evaluar','resolver','analiz','extraer','generar','probar','enrut','validar','recuperar','recorrer','construir','revisar','interpretar','vista previa','arbitrar','reproducir']):
                        candidates.append(i)
                if candidates:
                    buttons.nth(candidates[0]).click()
                    page.wait_for_load_state('networkidle')
                    page.get_by_text('Computed trace · playback' if locale == 'en' else 'Traza calculada · reproducción', exact=True).wait_for()
                    entry['checks'][-1]['clicked'] = button_texts[candidates[0]]
                else:
                    raise AssertionError('No executable primary action discovered')
                trace = page.locator('section').filter(has=page.get_by_text('Computed trace · playback' if locale == 'en' else 'Traza calculada · reproducción', exact=True)).last
                trace.get_by_role('button', name='Show all' if locale == 'en' else 'Ver todo', exact=True).click()
                assert trace.locator('ol li').count() > 0
                entry['checks'][-1]['traceEvents'] = trace.locator('ol li').count()
                page.screenshot(path=str(images / ('demo.png' if locale=='en' else 'demo.es.png')), full_page=True)
                if locale=='en':
                    page.screenshot(path=str(images / 'cover.png'))
                page.keyboard.press('Tab')
                entry['checks'][-1]['keyboardFocus'] = page.evaluate('document.activeElement.tagName')
                assert entry['checks'][-1]['keyboardFocus'] in ['BUTTON','A','INPUT','TEXTAREA','SELECT']
                field_type = field.get_attribute('type')
                tag = field.evaluate('element => element.tagName')
                if field_type == 'checkbox':
                    field.set_checked(not original_checked)
                elif field_type == 'range':
                    field.press('ArrowRight' if original_value != field.get_attribute('max') else 'ArrowLeft')
                elif tag == 'SELECT':
                    values = field.locator('option').evaluate_all('options => options.map(option => option.value)')
                    field.select_option(next(value for value in values if value != original_value))
                elif field_type == 'number':
                    field.fill(str(float(original_value) + 1))
                else:
                    field.fill(original_value + ' ')
                expect(trace.locator('ol li')).to_have_count(0)
                entry['checks'][-1]['editingInvalidatesEvidence'] = True
                page.get_by_role('button', name=re.compile(r'^(Reset|Reiniciar|Restablecer|Restaurar)$')).first.click()
                assert trace.locator('ol li').count() == 0, 'Reset retains computed evidence'
                assert field.input_value() == original_value, 'Reset does not restore the first scenario control'
                if original_checked is not None:
                    assert field.is_checked() == original_checked
                entry['checks'][-1]['resetClearsResult'] = True
                page.get_by_role('button', name='Cancel' if locale == 'en' else 'Cancelar', exact=True).first.click()
                entry['checks'][-1]['cancelUsable'] = True
                # Exercise the actual locale control, with denied browser storage.
                switch = page.get_by_role('link', name='ES' if locale == 'en' else 'EN', exact=True)
                if switch.count() == 0:
                    switch = page.get_by_role('button', name='ES' if locale == 'en' else 'EN', exact=True)
                switch.click()
                page.wait_for_load_state('networkidle')
                assert page.locator('html').get_attribute('lang') == ('es' if locale == 'en' else 'en')
                entry['checks'][-1]['languageSwitchWithoutStorage'] = True
            entry['translatedBodyDiffers'] = texts['en'] != texts['es']
            page.set_viewport_size({'width':390,'height':844})
            page.emulate_media(reduced_motion='reduce')
            page.goto(base_url + '/es/app')
            page.wait_for_load_state('networkidle')
            page.add_style_tag(content='nextjs-portal{display:none!important}')
            labels = page.get_by_role('button').all_text_contents()
            for index, label in enumerate(labels):
                if label == next(check['clicked'] for check in entry['checks'] if check['locale'] == 'es'):
                    page.get_by_role('button').nth(index).click()
                    break
            page.get_by_text('Traza calculada · reproducción', exact=True).wait_for()
            assert page.get_by_role('button',name='Reproducir',exact=True).last.is_disabled()
            entry['reducedMotionDisablesPlayback'] = True
            entry['mobileNoOverflow'] = page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            page.screenshot(path=str(images / 'demo.mobile.png'),full_page=True)
            assert not forbidden_requests, forbidden_requests
            entry['noExternalOrApiRequests'] = True
            page.close()
            print(repo, json.dumps(entry,ensure_ascii=False), flush=True)
        except Exception as error:
            entry['failure'] = repr(error)
            print(repo,'FAILED',str(error),flush=True)
        finally:
            process.terminate()
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: process.kill()
            log.close()
            report.append(entry)
            (root/'docs/quality/browser-acceptance.json').write_text(json.dumps(entry,indent=2,ensure_ascii=False),encoding='utf-8')
            (workspace/'portafolio-mdea/docs/quality/browser-acceptance.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    browser.close()
assert all(not entry.get('failure') and not entry['errors'] and entry.get('mobileNoOverflow') for entry in report), 'Browser acceptance failures: inspect docs/quality/browser-acceptance.json'
