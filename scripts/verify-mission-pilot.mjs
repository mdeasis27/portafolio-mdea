import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const hub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositories = process.argv.slice(2);
const phase = process.env.MISSION_PHASE || "mission-pilot";
if (!["mission-pilot", "mission-batch"].includes(phase)) throw new Error("Unknown verification phase");
const names = repositories.length ? repositories : ['portafolio-mdea', 'evidencia', 'compuerta', 'destilacion', 'agente-riesgo', 'ensayo', 'warmstart'];
const env = {...process.env};
for (const key of ['DATABASE_URL', 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'OPENROUTER_API_KEY', 'TRUORA_API_KEY', 'EXA_API_KEY', 'TAVILY_API_KEY']) env[key] = '';
env.NODE_OPTIONS = `--require=${path.join(hub, 'scripts/local-verification-env.cjs')}`;
const reports = [];

async function verify(name) {
  if (!['portafolio-mdea', 'evidencia', 'compuerta', 'destilacion', 'agente-riesgo', 'ensayo', 'warmstart', 'veredicto', 'mesa', 'doorman'].includes(name)) throw new Error('Repository outside the approved pilot.');
  const root = path.resolve(hub, '..', name);
  const quality = path.join(root, 'docs/quality');
  fs.mkdirSync(quality, {recursive: true});
  const tests = name === 'portafolio-mdea'
    ? ['--test', ...fs.readdirSync(path.join(root, 'scripts')).filter(file => file.endsWith('.test.mjs')).map(file => 'scripts/' + file), 'design-system/demo/foundation.node-test.mjs']
    : name === 'agente-riesgo'
      ? ['node_modules/tsx/dist/cli.mjs', '--test', 'lib/experience/adapter.test.ts', 'lib/experience/mission.test.ts', 'lib/experience/story.test.ts']
      : ['node_modules/vitest/vitest.mjs', 'run'];
  const commands = [
    ['test', tests], ['lint', ['node_modules/eslint/bin/eslint.js', '--no-error-on-unmatched-pattern', ...['ai-kit','app','components','design-system','lib','scripts','src'].filter(directory => fs.existsSync(path.join(root, directory))), ...fs.readdirSync(root).filter(file => /\.(?:[cm]?[jt]s|tsx)$/.test(file) && !file.endsWith('.d.ts'))]],
    ['types', ['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false']],
    ['build', ['node_modules/next/dist/bin/next', 'build']],
  ];
  const report = {repository: name, scope: 'Local mission pilot; source/config lint excludes unchanged backend caches; secret files are not loaded; no route or deployment claim.', commands: []};
  for (const [label, args] of commands) {
    const log = `${phase}-${label}.log`;
    const output = fs.openSync(path.join(quality, log), 'w');
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {cwd: root, env: {...env, NODE_ENV: label === 'build' ? 'production' : 'test'}, stdio: ['ignore', output, output]});
      child.on('error', reject);
      child.on('exit', resolve);
    });
    fs.closeSync(output);
    report.commands.push({command: 'node ' + args.join(' '), exitCode, log});
    fs.writeFileSync(path.join(quality, phase + '-verification.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(name, label, exitCode);
  }
  return report;
}

// Limit heavy builds to two independent repositories at a time.
for (let index = 0; index < names.length; index += 2) reports.push(...await Promise.all(names.slice(index, index + 2).map(verify)));
fs.writeFileSync(path.join(hub, 'docs/quality/' + phase + '-commands.json'), JSON.stringify(reports, null, 2) + '\n');
if (reports.some(report => report.commands.some(command => command.exitCode !== 0))) process.exitCode = 1;
