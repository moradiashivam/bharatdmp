/**
 * Removes the native bcrypt dependency left by older DMP System packages.
 * bcryptjs reads existing bcrypt hashes, so no password data needs migration.
 * This script uses only Node.js built-ins and is safe to run before npm install.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const sourceFiles = [
  path.join(root, 'db', 'seed.js'),
  path.join(root, 'src', 'controllers', 'auth.controller.js'),
  path.join(root, 'src', 'controllers', 'organization.controller.js'),
  path.join(root, 'src', 'controllers', 'password.controller.js'),
];

let changed = false;
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.dependencies = pkg.dependencies || {};

if (Object.prototype.hasOwnProperty.call(pkg.dependencies, 'bcrypt')) {
  delete pkg.dependencies.bcrypt;
  changed = true;
}
if (!pkg.dependencies.bcryptjs) {
  pkg.dependencies.bcryptjs = '^2.4.3';
  changed = true;
}
if (changed) {
  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

for (const file of sourceFiles) {
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/require\((['"])bcrypt\1\)/g, "require('bcryptjs')");
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed = true;
  }
}

const nativeModule = path.join(root, 'node_modules', 'bcrypt');
if (fs.existsSync(nativeModule)) {
  fs.rmSync(nativeModule, { recursive: true, force: true });
  changed = true;
}

if (changed) {
  const lockPath = path.join(root, 'package-lock.json');
  if (fs.existsSync(lockPath)) fs.rmSync(lockPath, { force: true });
  console.log('      Replaced incompatible native bcrypt with bcryptjs.');
} else {
  console.log('      Password library is already Windows-compatible.');
}