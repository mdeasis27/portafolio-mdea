"""Exercise real React demo components without launching a web server.

Navigation is a controlled fixture. These checks do not certify Next routes.
"""
import json
import re
import subprocess
import sys
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

hub = Path(__file__).resolve().parents[1]
workspace = hub.parent
repositories = sorted(path.stem for path in (hub/'content/projects/en').glob('*.mdx'))
if len(sys.argv) > 1:
    repositories = [name for name in repositories if name in sys.argv[1:]]
reports = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for name in repositories:
        root = workspace/name
        report = {'repository':name,'scope':'Real React component with controlled locale; Next routes not tested.','checks':[],'errors':[]}
        try:
            result = subprocess.run(['node','scripts/build-component-lab.mjs',name],cwd=hub,capture_output=True,text=True)
            assert result.returncode == 0, result.stderr+result.stdout
            bundle = (hub/'docs/quality/.component-labs'/name/'bundle.js').read_text(encoding='utf-8')
            css = '\n'.join(path.read_text(encoding='utf-8') for path in (root/'.next/static').rglob('*.css'))
            assert css, 'Production CSS missing; build this project first.'
            # Embedded fonts avoid remote requests in the component environment.
            import base64
            font = base64.b64encode((hub/'design-system/fonts/Geist.woff2').read_bytes()).decode()
            mono = base64.b64encode((hub/'design-system/fonts/GeistMono.woff2').read_bytes()).decode()
            css = re.sub(r'@font-face\s*\{[^}]*\}', '', css)
            css += f'@font-face{{font-family:Portfolio;src:url(data:font/woff2;base64,{font})}}@font-face{{font-family:PortfolioMono;src:url(data:font/woff2;base64,{mono})}}:root{{--font-sans:Portfolio;--font-mono:PortfolioMono;--font-geist-sans:Portfolio;--font-geist-mono:PortfolioMono}}body{{font-family:Portfolio,sans-serif}}'
            preview = hub/'docs/quality/.component-labs'/name/'preview.html'
            embedded = re.sub(r'</script', r'<\\/script', bundle, flags=re.I)
            preview.write_text('<!doctype html><html class="dark" lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+name+' · Decision lab</title><style>'+css+'</style><body><nav style="padding:12px 24px;border-bottom:1px solid var(--border);font:12px Portfolio"><a href="../index.html">← All labs / Todos los laboratorios</a> · <button onclick="mountPortfolioDemo(\'en\')">EN</button> · <button onclick="mountPortfolioDemo(\'es\')">ES</button><span style="margin-left:16px;color:var(--muted)">Local component preview · Controlled navigation / Vista local · Navegación controlada</span></nav><div id="root"></div><script>window.__portfolioLocale="en";</script><script>'+embedded+'</script><script>document.addEventListener("click",event=>{const anchor=event.target.closest("a");if(!anchor)return;const match=(anchor.getAttribute("href")||"").match(/^\\/(en|es)(?:\\/app)?(?:[?#].*)?$/);if(match){event.preventDefault();event.stopPropagation();mountPortfolioDemo(match[1]);}},true);</script></body></html>',encoding='utf-8')
            texts = {}
            for locale in ['en','es']:
                page = browser.new_page(viewport={'width':1440,'height':1100})
                page.on('pageerror',lambda error:report['errors'].append(str(error)))
                requests = []
                def guard(route):
                    requests.append(route.request.url)
                    route.abort()
                page.route('**/*',guard)
                page.set_content('<html class="dark"><body><div id="root"></div></body></html>')
                page.add_style_tag(content=css)
                page.evaluate("locale=>{window.__portfolioLocale=locale;Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable')}})}",locale)
                page.add_script_tag(content=bundle)
                page.locator('[data-scenario-picker]').wait_for()
                assert page.locator('h1').count() >= 1, 'Missing project h1'
                assert page.locator('[data-business-story]').count() == 1
                presets = page.locator('[data-scenario-picker] button')
                assert presets.count() >= 2
                signature="()=>JSON.stringify([...document.querySelectorAll('textarea,input,select')].filter(item=>!item.closest('[data-decision-journey]')).map(item=>[item.tagName,item.type,item.type==='checkbox'?item.checked:item.value]))"
                initial_inputs=page.evaluate(signature)
                check = {'locale':locale,'scenarios':[]}
                canvases = []
                for index in [0,1]:
                    presets.nth(index).click()
                    expect(presets.nth(index)).to_have_attribute('aria-pressed','true')
                    run = page.get_by_role('button',name=re.compile(r'^(Run|Execute|Assess|Retrieve|Evaluate|Replay|Simulate|Guard|Scan|Extract|Generate|Analyze|Check|Compare|Route|Build|Calculate|Traverse|Inspect|Prioritize|Segment|Screen|Arbitrate|Assemble|Resolve|Synthesize|Translate|Detect|Preview|Interpret|Ejecutar|Evaluar|Recuperar|Reproducir|Simular|Extraer|Generar|Analizar|Comprobar|Comparar|Validar|Inspeccionar|Revisar|Escanear|Probar|Calcular|Recorrer|Priorizar|Clasificar|Segmentar|Arbitrar|Ensamblar|Resolver|Sintetizar|Traducir|Detectar|Enrutar|Construir|Vista previa|Interpretar)',re.I))
                    if page.locator('[data-run-experiment]').count():run=page.locator('[data-run-experiment]')
                    choices = [run.nth(i) for i in range(run.count()) if run.nth(i).locator('xpath=ancestor::*[@data-scenario-picker]').count() == 0 and run.nth(i).locator('xpath=ancestor::*[@data-story-stage]').count() == 0 and run.nth(i).locator('xpath=ancestor::*[@data-decision-journey]').count() == 0]
                    assert choices, 'No execution button found'
                    choices[0].click()
                    page.wait_for_function("document.querySelector('[data-story-stage]') && document.querySelector('[data-decision-journey] ol li')")
                    initial = page.locator('[data-stage-canvas]').inner_html()
                    next_step = page.get_by_role('button',name='Next step' if locale=='en' else 'Siguiente paso',exact=True)
                    if next_step.is_enabled():
                        assert page.locator('[data-business-outcome]').count() == 0, 'Final decision exposed before playback completes'
                        next_step.click()
                        assert initial != page.locator('[data-stage-canvas]').inner_html(), 'Scene does not follow trace progression'
                    page.get_by_role('button',name='Show all' if locale=='en' else 'Ver todo',exact=True).click()
                    page.locator('[data-business-outcome]').wait_for()
                    canvases.append(page.locator('[data-stage-canvas]').inner_text())
                    check['scenarios'].append({'preset':presets.nth(index).inner_text(),'outcome':page.locator('[data-business-outcome]').inner_text()})
                    if index==0:
                        page.screenshot(path=str(root/'docs/images'/('lab.demo.png' if locale=='en' else 'lab.demo.es.png')),full_page=True)
                        page.locator('[data-story-stage]').screenshot(path=str(root/'docs/images'/('lab.stage.png' if locale=='en' else 'lab.stage.es.png')))
                        if locale=='en':page.screenshot(path=str(root/'docs/images/lab.cover.png'))
                    else:
                        page.locator('[data-story-stage]').screenshot(path=str(root/'docs/images'/('lab.stage.b.png' if locale=='en' else 'lab.stage.b.es.png')))
                assert canvases[0] != canvases[1], 'Contrast scenarios produce identical scene text'
                texts[locale] = page.locator('body').inner_text()
                editor = page.locator('textarea').first
                if editor.count():
                    editor.fill(editor.input_value()+'\nextra sample')
                else:
                    editor=page.locator('input[type="range"],input[type="number"],input[type="text"],input:not([type])').first
                    if editor.count():
                        kind=editor.get_attribute('type')
                        if kind=='range':
                            editor.focus()
                            editor.press('ArrowLeft')
                        elif kind=='number':editor.fill(str(float(editor.input_value() or '0')+1))
                        else:editor.fill(editor.input_value()+' sample')
                    else:
                        selects=page.locator('select').all()
                        editor=next((item for item in selects if item.locator('xpath=ancestor::*[@data-decision-journey]').count()==0), None)
                        if editor is not None:
                            values=editor.locator('option').evaluate_all('(items)=>items.map(item=>item.value)')
                            editor.select_option(next(value for value in values if value!=editor.input_value()))
                        else:
                            page.locator('input[type=checkbox]').first.click()
                expect(page.locator('[data-scenario-picker] button[aria-pressed="true"]')).to_have_count(0)
                assert page.locator('[data-decision-journey] ol li').count()==0, 'Changed inputs retained obsolete trace'
                presets.nth(0).click()
                expect(presets.nth(0)).to_have_attribute('aria-pressed','true')
                assert page.evaluate(signature)==initial_inputs, 'Preset did not restore its full inputs'
                presets.nth(1).click()
                page.get_by_role('button',name=re.compile(r'^(Reset|Reiniciar|Restaurar)$',re.I)).click()
                expect(presets.nth(0)).to_have_attribute('aria-pressed','true')
                assert page.get_by_role('button',name=re.compile(r'^(Cancel|Cancelar)$',re.I)).count()==1
                choices[0].click()
                page.wait_for_function("document.querySelector('[data-decision-journey] ol li')")
                page.get_by_role('button',name='Show all' if locale=='en' else 'Ver todo',exact=True).click()
                page.set_viewport_size({'width':390,'height':844})
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile horizontal overflow'
                page.emulate_media(reduced_motion='reduce')
                expect(page.locator('[data-decision-journey]').get_by_role('button',name='Play' if locale=='en' else 'Reproducir',exact=True)).to_be_disabled()
                page.keyboard.press('Tab')
                assert page.evaluate('document.activeElement.tagName') != 'BODY'
                if locale=='es':page.screenshot(path=str(root/'docs/images/lab.demo.mobile.png'),full_page=True)
                if name in ['destilacion','escaneo','traductor','ensayo','fabrica','vigia']:
                    if name=='fabrica':page.locator('input[type=number]').first.fill('0')
                    else:page.locator('textarea').first.fill('')
                    choices[0].click()
                    alert=page.get_by_role('alert')
                    alert.wait_for()
                    message=alert.inner_text()
                    assert message and ('Introduce' in message or 'Usa un umbral' in message) if locale=='es' else bool(message)
                    assert page.locator('[data-decision-journey] ol li').count()==0, 'Invalid input retained a trace'
                    check['localizedValidationError']=message
                assert not requests, requests
                check.update({'mobileNoOverflow':True,'reducedMotion':True,'keyboard':True,'noRequests':True,'sceneChangesWithScenario':True,'editingClearsPresetAndTrace':True,'resetRestoresFirstPreset':True,'cancelControlPresent':True,'presetRestoresAllInputs':True})
                report['checks'].append(check)
                page.close()
            assert texts['en'] != texts['es']
            assert not report['errors'],report['errors']
            print(name,'component browser checks passed',flush=True)
        except Exception as error:
            report['failure'] = repr(error)
            report['failureTraceback'] = traceback.format_exc()
            if 'page' in locals() and not page.is_closed():
                report['failureBody'] = page.locator('body').inner_text()
                report['failureDiagnostics'] = page.evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,motion:matchMedia('(prefers-reduced-motion: reduce)').matches,locale:window.__portfolioLocale,focus:document.activeElement.tagName})")
                report['requests'] = requests
                page.screenshot(path=str(root/'docs/images/lab.failure.png'),full_page=True)
            print(name,'FAILED',repr(error),flush=True)
        (root/'docs/quality/decision-lab-browser.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
        reports.append(report)
    browser.close()
(hub/'docs/quality/decision-lab-browser.json').write_text(json.dumps(reports,indent=2,ensure_ascii=False),encoding='utf-8')
assert all(not report.get('failure') and not report['errors'] for report in reports)
