"""Real component checks; controlled navigation, no Next server or deployment claims."""
import base64
import json
import re
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

hub=Path(__file__).resolve().parents[1]
reports=[]

def mount(browser,name,locale):
    result=subprocess.run(['node','scripts/build-component-lab.mjs',name],cwd=hub,capture_output=True,text=True)
    assert result.returncode==0,result.stderr+result.stdout
    root=hub if name=='recruiter-journey' else hub.parent/name
    css='\n'.join(path.read_text(encoding='utf-8') for path in (root/'.next/static').rglob('*.css'))
    assert css,'Missing production CSS'
    css=re.sub(r'@font-face\s*\{[^}]*\}','',css)
    for family,file in [('Portfolio','Geist.woff2'),('PortfolioMono','GeistMono.woff2')]:
        data=base64.b64encode((hub/'design-system/fonts'/file).read_bytes()).decode()
        css+=f'@font-face{{font-family:{family};src:url(data:font/woff2;base64,{data})}}'
    css+=':root{--font-sans:Portfolio;--font-mono:PortfolioMono}body{font-family:Portfolio,sans-serif;margin:0}'
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]; requests=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.route('**/*',lambda route:(requests.append(route.request.url),route.abort()))
    page.set_content('<html class="dark"><body><div id="root"'+(' style="max-width:1152px;margin:auto;padding:24px"' if name=='recruiter-journey' else '')+'></div></body></html>')
    page.add_style_tag(content=css)
    page.evaluate('locale=>window.__portfolioLocale=locale',locale)
    bundle=(hub/'docs/quality/.component-labs'/name/'bundle.js').read_text(encoding='utf-8')
    page.add_script_tag(content=bundle)
    if name=='recruiter-journey':
        embedded=re.sub(r'</script',r'<\\/script',bundle,flags=re.I)
        (hub/'docs/quality/.component-labs'/name/'preview.html').write_text('<!doctype html><html class="dark" lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recruiter route · Local component review</title><style>'+css+'</style><body style="padding:24px"><nav style="margin-bottom:24px;font:14px Portfolio">Local component review / Revisión local · <button onclick="mountPortfolioDemo(\'en\')">EN</button> <button onclick="mountPortfolioDemo(\'es\')">ES</button> · <a href="../evidencia/preview.html">Evidencia</a> · <a href="../compuerta/preview.html">Compuerta</a> · <a href="../destilacion/preview.html">Destilación</a> · <a href="../index.html">All 21 labs / Los 21 laboratorios</a></nav><div id="root" style="max-width:1152px;margin:auto"></div><script>'+embedded+'</script><script>document.addEventListener("click",event=>{const link=event.target.closest("[data-journey-demo]");if(!link)return;event.preventDefault();const steps=[...document.querySelectorAll("[data-journey-step]")];const index=steps.findIndex(step=>step.getAttribute("aria-pressed")==="true");location.href="../"+["evidencia","compuerta","destilacion"][index]+"/preview.html#"+document.documentElement.lang;});</script></body></html>',encoding='utf-8')
    return page,errors,requests

with sync_playwright() as p:
    browser=p.chromium.launch()
    for name in ['evidencia','compuerta','destilacion']:
        for locale in ['en','es']:
            page,errors,requests=mount(browser,name,locale)
            prompt=page.locator('[data-mission-prompt]')
            expect(prompt).to_have_count(1)
            if name=='destilacion':
                expect(page.get_by_role('link',name='View in Spanish' if locale=='en' else 'Ver en inglés',exact=True)).to_have_attribute('href','/es/app' if locale=='en' else '/en/app')
            expect(page.locator('[data-mission-comparison]')).to_have_count(0)
            page.locator('[data-mission-challenge]').click()
            prediction=page.locator('[data-prediction]').first
            prediction.focus()
            prediction.press("Enter")
            expect(prediction).to_have_attribute('aria-pressed','true')
            run=page.get_by_role('button',name=re.compile(r'^(Retrieve evidence|Recuperar evidencia|Simulate|Simular|Calculate costs|Calcular costos)$',re.I))
            expect(run).to_have_count(1)
            run.click()
            page.locator('[data-decision-journey] ol li').first.wait_for()
            expect(page.locator('[data-mission-comparison]')).to_have_count(0)
            page.get_by_role('button',name='Show all' if locale=='en' else 'Ver todo',exact=True).click()
            comparison=page.locator('[data-mission-comparison]')
            expect(comparison).to_have_count(1)
            text=comparison.inner_text()
            comparison.screenshot(path=str(hub/'docs/quality'/f'mission-{name}.{locale}.comparison.png'))
            if name=='evidencia':
                assert ('Answered' in text and 'Refused' in text) if locale=='en' else ('Responde' in text and 'Rechaza' in text)
            elif name=='destilacion':
                assert text.count('$1,800.00')==2,text
                assert ('equal' in text.lower()) if locale=='en' else ('iguales' in text.lower())
            else:
                values=re.findall(r'(\d+) / 30',text)
                assert len(values)==2 and int(values[0])>int(values[1]),text
            expect(page.locator('[data-prediction-feedback]')).to_have_count(1)
            expect(prediction).to_be_disabled()
            page.screenshot(path=str(hub/'docs/quality'/f'mission-{name}.{locale}.png'),full_page=True)
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Mobile document overflow'
            assert prompt.locator('h2').evaluate("item=>getComputedStyle(item).letterSpacing==='normal'||parseFloat(getComputedStyle(item).letterSpacing)>=0"),'Question heading letters overlap'
            assert comparison.locator('p').evaluate_all("items=>items.every(item=>parseFloat(getComputedStyle(item).fontSize)>=14)"),'Comparison text too small'
            page.screenshot(path=str(hub/'docs/quality'/f'mission-{name}.{locale}.mobile.png'),full_page=True)
            page.emulate_media(reduced_motion='reduce')
            expect(page.locator('[data-decision-journey]').get_by_role('button',name='Play' if locale=='en' else 'Reproducir',exact=True)).to_be_disabled()
            editor=page.locator('textarea').first
            if editor.count():editor.fill(editor.input_value()+' extra')
            else:page.locator('input[type=range]').focus();page.locator('input[type=range]').press('ArrowLeft')
            expect(comparison).to_have_count(0)
            expect(page.locator('[data-prediction][aria-pressed=true]')).to_have_count(0)
            expect(page.locator('[data-decision-journey] ol li')).to_have_count(0)
            page.locator('[data-scenario-picker] button').first.click()
            expect(page.locator('[data-prediction][aria-pressed=true]')).to_have_count(0)
            page.locator('[data-decision-notes] summary').focus()
            page.locator('[data-decision-notes] summary').press('Enter')
            assert page.locator('[data-decision-notes]').get_attribute('open') is not None
            page.locator('[data-prediction]').first.focus()
            page.keyboard.press('Tab')
            assert page.evaluate('document.activeElement.tagName')!='BODY'
            assert not errors and not requests,(errors,requests)
            reports.append({'repository':name,'locale':locale,'comparison':text,'predictionLocked':True,'editClearsResultAndPrediction':True,'mobileReadable':True,'reducedMotion':True,'keyboard':True,'errors':errors,'externalRequests':requests})
            page.close()
    for locale in ['en','es']:
        page,errors,requests=mount(browser,'recruiter-journey',locale)
        expect(page.locator('[data-recruiter-journey]')).to_have_count(1)
        steps=page.locator('[data-journey-step]')
        expect(steps).to_have_count(3)
        for index in range(3):
            steps.nth(index).click()
            expect(steps.nth(index)).to_have_attribute('aria-pressed','true')
            expect(page.locator('[data-journey-case]')).to_have_attribute('href',f'/{locale}/projects/'+['evidencia','compuerta','destilacion'][index])
            demo=page.locator('[data-journey-demo]').get_attribute('href')
            assert demo.endswith(f'/{locale}/app#mission'),demo
            page.locator('[data-journey-reviewed]').click()
        expect(page.locator('[data-journey-progress]')).to_contain_text('3 / 3')
        page.locator('[data-journey-reset]').click()
        expect(page.locator('[data-journey-progress]')).to_contain_text('0 / 3')
        expect(steps.first).to_have_attribute('aria-pressed','true')
        page.screenshot(path=str(hub/'docs/quality'/f'recruiter-journey.{locale}.png'),full_page=True)
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.screenshot(path=str(hub/'docs/quality'/f'recruiter-journey.{locale}.mobile.png'),full_page=True)
        assert not errors and not requests,(errors,requests)
        reports.append({'repository':'portafolio-mdea','locale':locale,'threeSteps':True,'caseAndDemoLinks':True,'reviewedProgressAndReset':True,'mobileNoOverflow':True,'errors':errors,'externalRequests':requests})
        page.close()
    browser.close()
(hub/'docs/quality/recruiter-missions-browser.json').write_text(json.dumps({'scope':'Real components with controlled navigation; Next routes and publication not verified.','checks':reports},indent=2,ensure_ascii=False),encoding='utf-8')
print('3 missions and recruiter journey: both locales, real comparisons, predictions, mobile and reset passed')
