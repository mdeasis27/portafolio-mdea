// Server-render actual initial components. This is not a browser or route check.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const hub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const {webpack, LimitChunkCountPlugin} = require('next/dist/compiled/webpack/webpack');
const batch = process.argv.includes('--batch');
const names = batch ? ['veredicto', 'mesa', 'doorman'] : ['evidencia', 'compuerta', 'destilacion', 'agente-riesgo', 'ensayo', 'warmstart', 'recruiter-journey'];
const checks = [];
const sceneChecks = [];
const output = path.join(hub, 'docs/quality/.component-labs/markup');
fs.mkdirSync(output, {recursive: true});

for (const name of names) {
  const journey = name === 'recruiter-journey';
  const root = journey ? hub : path.resolve(hub, '..', name);
  const experience = path.join(root, 'components/experience/experience.tsx');
  const source = journey ? path.join(hub, 'src/components/recruiter-journey.tsx') : fs.existsSync(experience) ? experience : path.join(root, 'app/[lang]/app/page.tsx');
  const entry = path.join(output, name + '.entry.jsx');
  const policyImports = name === 'doorman' ? "import {DoormanScene} from '@/lib/experience/doorman-scene';import {runGuard} from '@/lib/guard/guard';" : '';
  const policyRender = name === 'doorman' ? "export function renderPolicyBeforeDecision(locale){const input={document:'send an email',hardened:true};return renderToStaticMarkup(<DoormanScene input={input} result={runGuard(input.document,true)} frame={{visible:2,total:3,event:undefined,complete:false}} locale={locale}/>);}" : '';
  const riskImports = name === 'agente-riesgo' ? "import {Visualization} from '@/components/experience/visualization';import {simulatePolicy} from '@/lib/experience/policy';" : '';
  const riskRender = name === 'agente-riesgo' ? "export function renderPartialEvidence(){const input={verification:'confirmed',sanctions:false,evidenceCoverage:40,reviewThreshold:50};return renderToStaticMarkup(<Visualization input={input} result={simulatePolicy(input)} visible={3} lang='en'/>);}" : '';
  fs.writeFileSync(entry, `import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as demo from 'portfolio-experience';
import {LocaleProvider} from 'portfolio-locale';
${riskImports}
${policyImports}
const Component=demo.RecruiterJourney||demo.Experience||demo.default;
export function render(locale){return renderToStaticMarkup(<LocaleProvider locale={locale}><Component lang={locale} locale={locale} demos={{evidencia:'https://example.invalid',compuerta:'https://example.invalid',destilacion:'https://example.invalid'}}/></LocaleProvider>);}
${riskRender}
${policyRender}
`);
  await new Promise((resolve, reject) => webpack({
    mode: 'development', devtool: false, target: 'node', entry,
    output: {path: output, filename: name + '.cjs', library: {type: 'commonjs2'}},
    resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], alias: {
      '@': root, '@/design-system': path.join(root, 'design-system'), 'portfolio-experience': source,
      'portfolio-locale': path.join(root, 'design-system/i18n/context.tsx'),
      'react$': require.resolve('react'), 'react/jsx-runtime$': require.resolve('react/jsx-runtime'),
      'react-dom/server$': require.resolve('react-dom/server'),
    }, modules: [path.join(root, 'node_modules'), path.join(hub, 'node_modules'), 'node_modules']},
    module: {rules: [{test: /\.[tj]sx?$/, exclude: /node_modules/, use: path.join(hub, 'scripts/component-loader.mjs')}]},
    plugins: [new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}), new LimitChunkCountPlugin({maxChunks: 1})],
    optimization: {minimize: false},
  }, (error, stats) => error ? reject(error) : stats.hasErrors() ? reject(new Error(stats.toString({all: false, errors: true}))) : resolve()));
  const {render, renderPartialEvidence, renderPolicyBeforeDecision} = require(path.join(output, name + '.cjs'));
  if (renderPartialEvidence) {
    const html = renderPartialEvidence();
    assert.match(html, /40%/);
    assert.match(html, /Proceed → standard queue/);
    assert.doesNotMatch(html, /Coverage insufficient/);
  }
  if (renderPolicyBeforeDecision) {
    for (const locale of ['en', 'es']) {
      const before = renderPolicyBeforeDecision(locale);
      assert.doesNotMatch(before, />RULES<|>REGLAS</);
      assert.doesNotMatch(before, /data-business-outcome=/);
      sceneChecks.push({repository:name,locale,check:"classification before tool authorization",passed:true});
    }
  }
  const locales = {};
  for (const locale of ['en', 'es']) {
    const html = render(locale);
    locales[locale] = html;
    if (batch && name === 'veredicto' && locale === 'en') {
      assert.match(html, /What is the late-payment interest rate for consumer loans/);
      assert.doesNotMatch(html, /¿Cuál es la tasa/);
    }
    if (batch && locale === 'es' && name === 'mesa') assert.match(html, /Evaluar controles de riesgo de identidad/);
    if (batch && locale === 'es' && name === 'doorman') assert.match(html, /Ignora las instrucciones anteriores/);
    fs.writeFileSync(path.join(output, name + '.' + locale + '.html'), html);
    assert.ok(!/\bTruora\b|\bAcme Corp\b|\bNorthwind\b|\bContoso\b|\bGlobex\b/i.test(html), name + ': public initial markup naming');
    if (journey) {
      assert.equal((html.match(/data-journey-step=/g) || []).length, 3);
      assert.match(html, /<details data-journey-capture=/);
      assert.doesNotMatch(html, /<details data-journey-capture=""[^>]*\bopen\b/);
      assert.match(html, new RegExp(`href="/${locale}/projects/evidencia"`));
      assert.match(html, new RegExp(`/${locale}/app#mission`));
    } else {
      assert.equal((html.match(/data-mission-prompt=/g) || []).length, 1);
      const prediction = html.indexOf('data-mission-prompt');
      const execute = html.indexOf('data-run-experiment');
      assert.ok(html.indexOf('data-mission-challenge') < prediction && prediction < execute, name + ': challenge/prediction/run order');
      // Inputs occur before prediction; the playback-speed selector is separate.
      const controls = html.slice(0, prediction);
      assert.ok(/<(?:input|textarea|select)\b/.test(controls), name + ': inspect inputs before predicting');
      assert.doesNotMatch(html, /data-mission-comparison=/);
      assert.doesNotMatch(html, /data-business-outcome=/);
      assert.equal((html.match(/data-decision-notes=/g) || []).length, 1);
      assert.match(html, locale === 'en' ? /without predicting/ : /sin predecir/);
    }
    checks.push({repository: journey ? 'portafolio-mdea' : name, locale, initialMarkup: true, scope: 'Static React render only; no browser interaction, layout or HTTP-route claim.'});
  }
  assert.notEqual(locales.en, locales.es, name + ': bilingual initial markup');
  console.log(name + ': bilingual initial markup passed');
}
fs.writeFileSync(path.join(hub, 'docs/quality/' + (batch ? 'mission-batch' : 'mission-pilot') + '-markup.json'), JSON.stringify({scope: 'Actual server-rendered initial React components, not browser checks.', checks, sceneChecks}, null, 2) + '\n');
