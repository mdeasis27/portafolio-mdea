// Prime Next's installed environment-loader cache from an empty generated directory.
// Local verification must never load existing secret-bearing .env files.
/* eslint-disable @typescript-eslint/no-require-imports -- Node --require preloads must be CommonJS. */
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const nextRequire = createRequire(fs.realpathSync(path.join(process.cwd(), 'node_modules/next/package.json')));
const emptyDirectory = path.join(__dirname, '../docs/quality/.component-labs/no-env');
fs.mkdirSync(emptyDirectory, {recursive: true});
const env = nextRequire('@next/env');
const loaded = env.loadEnvConfig(emptyDirectory, false);
if (loaded.loadedEnvFiles.length) throw new Error('Verification environment directory must be empty.');
