import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';

// Service worker: precache every built file; the cache name changes whenever any of them does.
function serviceWorker() {
  let outDir;
  return {
    name: 'kalendarik-sw',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir; },
    writeBundle(_, bundle) {
      const files = {};
      for (const f of readdirSync('public')) if (!f.startsWith('.')) files[f] = readFileSync(join('public', f));
      for (const f of Object.values(bundle)) files[f.fileName] = f.type === 'chunk' ? f.code : f.source;
      const names = Object.keys(files).sort(), hash = createHash('sha256');
      for (const n of names) hash.update(n).update(files[n]);
      const sw = readFileSync('src/sw.js', 'utf8')
        .replace('__VERSION__', hash.digest('hex').slice(0, 10))
        .replace('__ASSETS__', JSON.stringify(['./', ...names.map(n => './' + n)]));
      writeFileSync(join(outDir, 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [serviceWorker()],
});
