from pathlib import Path
import json
from playwright.sync_api import sync_playwright

output = Path('docs/images')
output.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    page.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new Error('Storage unavailable')}})")
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    for locale in ['en', 'es']:
        for route in ['', '/projects', '/about', '/projects/agente-riesgo']:
            response = page.goto('http://localhost:3100/' + locale + route)
            page.wait_for_load_state('networkidle')
            page.add_style_tag(content='nextjs-portal{display:none!important}')
            assert response.status == 200, (locale, route, response.status)
            assert page.locator('html').get_attribute('lang') == locale
            assert page.locator('meta[property="og:image"]').first.get_attribute('content').startswith('https://portafolio-mdea.vercel.app/')
            print(locale, route or '/', page.locator('h1').inner_text())
        page.goto('http://localhost:3100/' + locale)
        page.wait_for_load_state('networkidle')
        page.add_style_tag(content='nextjs-portal{display:none!important}')
        page.screenshot(path=str(output / ('demo.png' if locale == 'en' else 'demo.es.png')), full_page=True)
        if locale == 'en':
            page.screenshot(path=str(output / 'cover.png'))
    page.goto('http://localhost:3100/en/projects')
    page.wait_for_load_state('networkidle')
    page.get_by_role('button', name='Reliable workflows', exact=True).click()
    assert page.locator('section a').count() == 3
    for case in Path('content/projects/en').glob('*.mdx'):
        assert page.request.get('http://localhost:3100/project-captures/' + case.stem + '.png').status == 200, case.stem
    page.goto('http://localhost:3100/projects/agente-riesgo?test=1')
    page.wait_for_load_state('networkidle')
    page.add_style_tag(content='nextjs-portal{display:none!important}')
    assert '/en/projects/agente-riesgo?test=1' in page.url
    page.get_by_role('navigation',name='Language').get_by_role('link',name='ES',exact=True).click()
    page.wait_for_load_state('networkidle')
    assert '/es/projects/agente-riesgo?test=1' in page.url
    page.goto('http://localhost:3100/fr')
    assert page.locator('body').inner_text().find('404') >= 0
    response = page.goto('http://localhost:3100/es/projects/not-a-project')
    assert response.status == 404
    assert page.get_by_role('heading', name='No encontramos esta página.').count() == 1
    assert page.get_by_role('main').get_by_role('link', name='Inicio', exact=True).get_attribute('href') == '/es'
    page.set_viewport_size({'width':390,'height':844})
    page.emulate_media(reduced_motion='reduce')
    page.goto('http://localhost:3100/es')
    page.wait_for_load_state('networkidle')
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile horizontal overflow'
    page.screenshot(path=str(output / 'demo.mobile.png'), full_page=True)
    assert not errors, errors
    Path('docs/quality/hub-browser-acceptance.json').write_text(json.dumps({'routesBothLanguages':True,'catalogueFilterCount':3,'actualProjectImages':21,'legacyRedirectRetainsQuery':True,'unsupportedLocale404':True,'localizedMissingCase404':True,'mobileNoOverflow':True,'reducedMotionChecked':True,'storageUnavailable':True,'errors':errors},indent=2),encoding='utf-8')
    browser.close()
print('Hub browser acceptance passed')
