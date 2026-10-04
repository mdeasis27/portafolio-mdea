"""Verify the generated file-based review gallery, without starting a server."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

hub = Path(__file__).resolve().parents[1]
index = hub / 'docs/quality/.component-labs/index.html'
reports = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors, external = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    def guard(route):
        if route.request.url.startswith(('file:', 'data:')):
            route.continue_()
        else:
            external.append(route.request.url)
            route.abort()
    page.route('**/*', guard)
    page.goto(index.as_uri())
    expect(page.locator('a.card')).to_have_count(21)
    page.screenshot(path=str(hub/'docs/quality/decision-lab-gallery.en.png'), full_page=True)
    page.screenshot(path=str(hub/'docs/quality/decision-lab-gallery.cover.png'))
    page.get_by_role('button', name='Español', exact=True).click()
    expect(page.locator('html')).to_have_attribute('lang', 'es')
    assert 'Decisiones que puedes explorar.' in page.locator('h1').inner_text()
    page.screenshot(path=str(hub/'docs/quality/decision-lab-gallery.png'), full_page=True)
    links = page.locator('a.card').evaluate_all('(items)=>items.map(item=>item.href)')
    for link in links:
        page.goto(link)
        page.locator('[data-scenario-picker]').wait_for()
        for locale in ['en', 'es']:
            page.get_by_role('button', name=locale.upper(), exact=True).click()
            page.locator('[data-scenario-picker] button').nth(1).click()
            page.locator('button.bg-foreground, button.bg-accent').first.click()
            page.locator('[data-decision-journey] ol li').first.wait_for()
            page.get_by_role('button', name='Show all' if locale=='en' else 'Ver todo', exact=True).click()
            page.locator('[data-business-outcome]').wait_for()
        reports.append({'preview': link, 'localFileNavigation': True, 'computedBothLocales': True})
        print(Path(link).parent.name, 'local preview passed', flush=True)
    assert not errors, errors
    assert not external, external
    browser.close()
(hub/'docs/quality/decision-lab-local-preview.json').write_text(json.dumps({'previews': reports, 'errors': errors, 'externalRequests': external}, indent=2), encoding='utf-8')
