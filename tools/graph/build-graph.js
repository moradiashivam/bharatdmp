#!/usr/bin/env node
/**
 * Project file-connection graph (graphify-style, fully local, no services).
 *
 * Scans the project source and records how files are connected:
 *   - JavaScript  require('./x') / import ... from './x'      -> "requires"
 *   - EJS         include('partials/x')                        -> "includes"
 *   - Controllers res.render('funder/projects/builder')        -> "renders"
 *   - Routes      app.use('/admin', require('./routes/admin')) -> "requires"
 *   - Database    FOREIGN KEY ... REFERENCES other_table       -> "references"
 *
 * Every edge is tagged:
 *   EXTRACTED - the path was resolved to a real file on disk
 *   INFERRED  - the reference was found but the target could not be resolved
 *
 * Output (written to graphify-out/):
 *   graph.json        machine readable nodes + edges
 *   graph.html        interactive force-directed map, open it in a browser
 *   GRAPH_REPORT.md   plain summary: biggest hubs, orphan files, broken links
 *
 * Usage:  npm run graph
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'graphify-out');
const SKIP_DIRS = new Set(['node_modules', '.git', 'graphify-out', 'uploads', 'coverage', 'dist']);
const EXTS = new Set(['.js', '.ejs', '.sql']);

/* ------------------------------------------------------------------ scan */
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, files);
    } else if (EXTS.has(path.extname(entry.name))) {
      files.push(rel(full));
    }
  }
  return files;
}
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

function groupOf(file) {
  if (file.startsWith('src/controllers/')) return 'controller';
  if (file.startsWith('src/routes/')) return 'route';
  if (file.startsWith('src/services/')) return 'service';
  if (file.startsWith('src/middleware/')) return 'middleware';
  if (file.startsWith('src/models/')) return 'model';
  if (file.startsWith('src/validators/') || file.startsWith('src/utils/') || file.startsWith('src/config/')) return 'support';
  if (file.startsWith('views/')) return 'view';
  if (file.startsWith('public/js/')) return 'browser script';
  if (file.startsWith('db/')) return file.endsWith('.sql') ? 'database' : 'support';
  if (file.startsWith('tests/')) return 'test';
  return 'other';
}

/* --------------------------------------------------------------- resolve */
function resolveJs(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // npm package - not a project file
  const base = path.join(path.dirname(path.join(ROOT, fromFile)), spec);
  const tries = [base, base + '.js', base + '.json', path.join(base, 'index.js')];
  for (const t of tries) {
    if (fs.existsSync(t) && fs.statSync(t).isFile()) return rel(t);
  }
  return null;
}
function resolveView(spec, fromFile) {
  const clean = spec.replace(/^\/+/, '').replace(/\.ejs$/, '');
  const tries = [path.join(ROOT, 'views', clean + '.ejs')];
  if (fromFile && fromFile.startsWith('views/')) {
    tries.push(path.join(path.dirname(path.join(ROOT, fromFile)), clean + '.ejs'));
  }
  for (const t of tries) if (fs.existsSync(t)) return rel(t);
  return null;
}

/* ----------------------------------------------------------------- parse */
const SELF = rel(__filename);
const files = walk(ROOT).sort().filter((f) => f !== SELF);
const nodes = new Map();
const edges = [];
const unresolved = [];

function node(id, extra = {}) {
  if (!nodes.has(id)) {
    nodes.set(id, { id, group: groupOf(id), size: 0, inbound: 0, outbound: 0, missing: false, ...extra });
  }
  return nodes.get(id);
}
function edge(from, to, kind, resolved) {
  edges.push({ source: from, target: to, kind, confidence: resolved ? 'EXTRACTED' : 'INFERRED' });
  node(from).outbound += 1;
  node(to).inbound += 1;
  if (!resolved) { node(to).missing = true; unresolved.push({ from, to, kind }); }
}

for (const file of files) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const n = node(file);
  n.size = src.length;
  n.lines = src.split('\n').length;

  if (file.endsWith('.js')) {
    const re = /require\(\s*['"]([^'"]+)['"]\s*\)|from\s+['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) {
      const spec = m[1] || m[2];
      if (!spec.startsWith('.')) continue;
      const target = resolveJs(file, spec);
      edge(file, target || spec, 'requires', !!target);
    }
    const rr = /res\.render\(\s*['"]([^'"]+)['"]/g;
    while ((m = rr.exec(src))) {
      const target = resolveView(m[1]);
      edge(file, target || `views/${m[1]}.ejs`, 'renders', !!target);
    }
  }

  if (file.endsWith('.ejs')) {
    const re = /include\(\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) {
      const target = resolveView(m[1], file);
      edge(file, target || `views/${m[1]}.ejs`, 'includes', !!target);
    }
    const sc = /(?:src|href)=["']\/(js|css)\/([^"']+)["']/g;
    while ((m = sc.exec(src))) {
      const target = `public/${m[1]}/${m[2]}`;
      if (exists(target)) { node(target); edge(file, target, 'loads', true); }
    }
  }

  if (file.endsWith('.sql')) {
    const tables = [];
    const ct = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+`?(\w+)`?/gi;
    let m;
    while ((m = ct.exec(src))) tables.push(m[1]);
    const fk = /REFERENCES\s+`?(\w+)`?/gi;
    const seen = new Set();
    while ((m = fk.exec(src))) {
      const t = m[1];
      if (seen.has(t)) continue;
      seen.add(t);
      const id = `table:${t}`;
      node(id, { group: 'table' });
      edge(file, id, 'references', true);
    }
  }
}

/* ------------------------------------------------------------ report/out */
fs.mkdirSync(OUT_DIR, { recursive: true });
const nodeList = [...nodes.values()];
const graph = {
  generated_at: new Date().toISOString(),
  root: path.basename(ROOT),
  counts: {
    files: files.length,
    nodes: nodeList.length,
    edges: edges.length,
    extracted: edges.filter((e) => e.confidence === 'EXTRACTED').length,
    inferred: edges.filter((e) => e.confidence === 'INFERRED').length,
  },
  nodes: nodeList,
  edges,
};
fs.writeFileSync(path.join(OUT_DIR, 'graph.json'), JSON.stringify(graph, null, 2));

const hubs = [...nodeList].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound)).slice(0, 20);
const orphans = nodeList.filter((n) => !n.missing && n.inbound === 0 && n.outbound === 0);
const byGroup = nodeList.reduce((acc, n) => { acc[n.group] = (acc[n.group] || 0) + 1; return acc; }, {});

const md = [
  '# Project connection report',
  '',
  `Generated: ${graph.generated_at}`,
  '',
  `- Files scanned: **${graph.counts.files}**`,
  `- Connections found: **${graph.counts.edges}** (${graph.counts.extracted} confirmed, ${graph.counts.inferred} unresolved)`,
  '',
  '## Files by kind',
  '',
  ...Object.entries(byGroup).sort((a, b) => b[1] - a[1]).map(([g, c]) => `- ${g}: ${c}`),
  '',
  '## Most connected files',
  '',
  '| File | Kind | Used by | Uses |',
  '| --- | --- | --- | --- |',
  ...hubs.map((n) => `| \`${n.id}\` | ${n.group} | ${n.inbound} | ${n.outbound} |`),
  '',
  '## Unresolved references (INFERRED)',
  '',
  unresolved.length
    ? unresolved.map((u) => `- \`${u.from}\` ${u.kind} \`${u.to}\` - target not found on disk`).join('\n')
    : 'None - every reference resolves to a real file.',
  '',
  '## Files nothing links to',
  '',
  orphans.length ? orphans.map((n) => `- \`${n.id}\``).join('\n') : 'None.',
  '',
].join('\n');
fs.writeFileSync(path.join(OUT_DIR, 'GRAPH_REPORT.md'), md);

const html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8')
  .replace('/*__GRAPH_DATA__*/null', JSON.stringify(graph));
fs.writeFileSync(path.join(OUT_DIR, 'graph.html'), html);

console.log(`Graph built: ${graph.counts.nodes} nodes, ${graph.counts.edges} connections.`);
console.log(`  graphify-out/graph.html      (open in a browser)`);
console.log(`  graphify-out/graph.json`);
console.log(`  graphify-out/GRAPH_REPORT.md`);
