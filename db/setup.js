/**
 * Creates the database (if missing) and executes db/schema.sql.
 * Run with: npm run db:setup  (called automatically by setup.bat)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function explain(err, cfg) {
  const lines = [];
  switch (err.code) {
    case 'ECONNREFUSED':
      lines.push(`No MySQL server is listening on ${cfg.host}:${cfg.port}.`);
      lines.push('Fix: start MySQL/MariaDB (XAMPP -> Start MySQL), then check DB_HOST and DB_PORT in .env.');
      lines.push('XAMPP/WAMP normally use port 3306.');
      break;
    case 'ER_ACCESS_DENIED_ERROR':
      lines.push(`MySQL refused the username/password for "${cfg.user}"@${cfg.host}.`);
      lines.push('Fix: check DB_USER and DB_PASSWORD in .env. If the password contains # or spaces, wrap it in quotes:');
      lines.push('     DB_PASSWORD="my#secret pass"');
      break;
    case 'ENOTFOUND':
    case 'EAI_AGAIN':
      lines.push(`Host "${cfg.host}" could not be resolved. Use localhost or 127.0.0.1 in DB_HOST.`);
      break;
    case 'ER_NOT_SUPPORTED_AUTH_MODE':
      lines.push('MySQL 8 is using an authentication plugin the driver cannot read.');
      lines.push("Fix: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';");
      break;
    case 'ER_DBACCESS_DENIED_ERROR':
      lines.push(`User "${cfg.user}" is not allowed to create the database "${cfg.database}".`);
      lines.push('Fix: use an account with CREATE privilege, or create the database manually first.');
      break;
    case 'ETIMEDOUT':
      lines.push(`Connection to ${cfg.host}:${cfg.port} timed out (firewall or wrong host).`);
      break;
    default:
      lines.push(err.sqlMessage || err.message || String(err));
  }
  return lines;
}

const IGNORABLE = new Set([
  'ER_DUP_FIELDNAME',
  'ER_DUP_KEYNAME',
  'ER_TABLE_EXISTS_ERROR',
  'ER_DUP_ENTRY',
  'ER_CANT_DROP_FIELD_OR_KEY',
]);

/**
 * Applies an upgrade file one change at a time so that re-running setup on an
 * existing database is harmless: anything already present is simply skipped.
 */
async function applyUpgrade(conn, sql) {
  const stripped = sql
    .split('\n')
    .filter((l) => !l.trim().startsWith('--'))
    .join('\n');

  const statements = [];
  for (const raw of stripped.split(';')) {
    const stmt = raw.trim();
    if (!stmt) continue;
    const m = /^ALTER\s+TABLE\s+`?(\w+)`?\s+([\s\S]+)$/i.exec(stmt);
    if (m) {
      const clauses = m[2].split(/,\s*(?=(?:ADD|MODIFY|CHANGE|DROP|RENAME)\b)/i);
      clauses.forEach((c) => statements.push(`ALTER TABLE \`${m[1]}\` ${c.trim()}`));
    } else {
      statements.push(stmt);
    }
  }

  let done = 0;
  let skipped = 0;
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      done += 1;
    } catch (err) {
      if (IGNORABLE.has(err.code)) skipped += 1;
      else throw err;
    }
  }
  return { done, skipped };
}

(async () => {
  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dmp_system',
  };

  console.log(`> Connecting to MySQL at ${cfg.host}:${cfg.port} as ${cfg.user} ...`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      multipleStatements: true,
    });
  } catch (err) {
    console.error('\nCould not connect to MySQL.');
    console.error(`Error code: ${err.code || 'UNKNOWN'}`);
    explain(err, cfg).forEach((l) => console.error('  ' + l));
    console.error('\nSettings currently read from .env:');
    console.error(`  DB_HOST=${cfg.host}`);
    console.error(`  DB_PORT=${cfg.port}`);
    console.error(`  DB_USER=${cfg.user}`);
    console.error(`  DB_PASSWORD=${cfg.password ? '(set, ' + cfg.password.length + ' characters)' : '(empty)'}`);
    console.error(`  DB_NAME=${cfg.database}`);
    process.exit(1);
  }

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`> Database \`${cfg.database}\` ready.`);

    await conn.changeUser({ database: cfg.database });

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(sql);
    console.log('> Schema applied successfully.');

    const extras = ['phase14.sql', 'phase16.sql', 'phase18.sql', 'phase19.sql', 'phase20.sql', 'phase21.sql', 'phase22.sql', 'phase23.sql', 'phase24.sql', 'phase25.sql', 'phase26.sql', 'phase27.sql', 'phase28.sql', 'phase29.sql', 'phase30.sql', 'phase31.sql', 'phase32.sql', 'phase33.sql', 'phase34.sql'];
    for (const file of extras) {
      const p = path.join(__dirname, file);
      if (fs.existsSync(p)) {
        const applied = await applyUpgrade(conn, fs.readFileSync(p, 'utf8'));
        console.log(`> Applied ${file} (${applied.done} change(s), ${applied.skipped} already present).`);
      }
    }
  } catch (err) {
    console.error('\nDatabase setup failed while running SQL.');
    console.error(`Error code: ${err.code || 'UNKNOWN'}`);
    explain(err, cfg).forEach((l) => console.error('  ' + l));
    process.exit(1);
  } finally {
    try { await conn.end(); } catch (_) { /* ignore */ }
  }
})();
