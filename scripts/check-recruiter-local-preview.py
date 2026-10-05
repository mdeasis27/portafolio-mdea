"""Exercise the file-based guide-to-demo review links; not Next HTTP routes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

hub=Path(__file__).resolve().parents[1]
preview=hub/'docs/quality/.component-labs/recruiter-journey/preview.html'
errors=[]
external=[]
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda error:errors.append(str(error)))
    def guard(route):
        if route.request.url.startswith(('file:','data:')):route.continue_()
        else:external.append(route.request.url);route.abort()
    page.route('**/*',guard)
    for locale in ['en','es']:
        for index,name in enumerate(['evidencia','compuerta','destilacion']):
            page.goto(preview.as_uri())
            page.get_by_role('button',name=locale.upper(),exact=True).click()
            page.locator('[data-journey-step]').nth(index).click()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.locator('[data-journey-demo]').click()
            expect(page.locator('html')).to_have_attribute('lang',locale)
            assert f'/{name}/preview.html' in page.url,page.url
            page.locator('[data-mission-challenge]').click()
            page.locator('[data-prediction]').first.click()
            page.locator('[data-run-experiment]').click()
            page.locator('[data-decision-journey] ol li').first.wait_for()
            page.get_by_role('button',name='Show all' if locale=='en' else 'Ver todo',exact=True).click()
            page.locator('[data-mission-comparison]').wait_for()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            checks.append({'project':name,'locale':locale,'guideOpensLocalDemo':True,'challengeComputed':True,'mobileNoOverflow':True})
    assert not errors and not external,(errors,external)
    browser.close()
(hub/'docs/quality/recruiter-missions-local-preview.json').write_text(json.dumps({'scope':'Local files: real guide opens each local demo, with locale preserved. No Next HTTP route or publication claim.','passed':True,'checks':checks,'errors':errors,'externalRequests':external},indent=2),encoding='utf-8')
print('Guide opens 3 local missions in both languages; 6 computed comparisons, no external requests')
