/**
 * Seeds roles, permissions, field types, domains, master fields, settings,
 * public pages and the Super Admin account (values taken from .env).
 * Safe to run multiple times.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const slugify = require('slugify');

const ROLES = [
  ['super_admin', 'Super Admin', 'system', 'Full platform access', 1],
  ['funder_admin', 'Funder Admin', 'funder', 'Manages own funder account', 1],
  ['funder_reviewer', 'Funder Reviewer', 'funder', 'Reviews DMP submissions', 1],
  ['institution_admin', 'Institution Admin', 'institution', 'Manages institution projects', 1],
  ['institution_reviewer', 'Institution Reviewer', 'institution', 'Reviews DMP submissions', 1],
  ['reviewer', 'Panel Reviewer', 'funder', 'External reviewer invited by, or approved by, a funder', 1],
  ['researcher', 'Researcher', 'researcher', 'Creates and submits DMPs', 1],
];

const MODULES = ['funders', 'institutions', 'domains', 'master_fields', 'projects', 'submissions', 'reports', 'pdf', 'notifications', 'public_site'];

const PERMISSIONS = [];
MODULES.forEach((m) => {
  ['view', 'create', 'edit', 'delete'].forEach((a) => {
    PERMISSIONS.push([`${m}.${a}`, `${a} ${m.replace('_', ' ')}`, m]);
  });
});

const FIELD_TYPES = [
  ['short_text', 'Short Text', 'text', 0],
  ['long_text', 'Long Text', 'textarea', 0],
  ['number', 'Number', 'number', 0],
  ['decimal', 'Decimal', 'number', 0],
  ['date', 'Date', 'date', 0],
  ['datetime', 'Date and Time', 'datetime-local', 0],
  ['email', 'Email', 'email', 0],
  ['mobile', 'Mobile Number', 'tel', 0],
  ['url', 'URL', 'url', 0],
  ['single_select', 'Single Select', 'select', 1],
  ['multi_select', 'Multi Select', 'multiselect', 1],
  ['radio', 'Radio Button', 'radio', 1],
  ['checkbox', 'Checkbox', 'checkbox', 1],
  ['yes_no', 'Yes / No', 'radio', 1],
  ['file', 'File Upload', 'file', 0],
  ['rich_text', 'Rich Text', 'richtext', 0],
  ['information', 'Information / Instruction', 'static', 0],
  ['section_heading', 'Section Heading', 'static', 0],
  ['table', 'Table', 'table', 1],
  ['repeating', 'Repeating Field', 'repeater', 1],
  ['person', 'Researcher / Person Selector', 'person', 0],
  ['licence_picker', 'Licence Picker', 'select', 0],
  ['repository_picker', 'Repository Picker', 'select', 0],
  ['storage_size', 'Storage Size (GB/TB)', 'storage', 0],
  ['ror_affiliation', 'Organization / Affiliation (ROR lookup)', 'lookup', 0],
  ['funder_lookup', 'Funder (Crossref Funder Registry)', 'lookup', 0],
];

const DOMAINS = [
  ['Social Sciences', 'SOC'], ['Sciences', 'SCI'], ['Law', 'LAW'],
  ['Agriculture', 'AGR'], ['Engineering', 'ENG'], ['Medical Sciences', 'MED'],
  ['Humanities', 'HUM'], ['Management', 'MGT'], ['Computer Science', 'CS'],
  ['Interdisciplinary Research', 'IDR'],
];

const FIELD_GROUPS = [
  ['Researcher Information', 1],
  ['Project Information', 2],
  ['Research Data', 3],
  ['Data Storage & Security', 4],
  ['Data Sharing & Preservation', 5],
];

// [group index, field_name, label, field type code, required]
const MASTER_FIELDS = [
  [1, 'researcher_name', 'Researcher Name', 'short_text', 1],
  [1, 'researcher_email', 'Email', 'email', 1],
  [1, 'researcher_mobile', 'Mobile Number', 'mobile', 0],
  [1, 'orcid', 'ORCID', 'short_text', 0],
  [1, 'department', 'Department', 'short_text', 0],
  [1, 'designation', 'Designation', 'short_text', 0],
  [1, 'institution_name', 'Institution', 'short_text', 0],
  [1, 'research_area', 'Research Area', 'short_text', 0],
  [2, 'project_title', 'Project Title', 'short_text', 1],
  [2, 'project_id', 'Project ID', 'short_text', 0],
  [2, 'project_description', 'Project Description', 'long_text', 1],
  [2, 'principal_investigator', 'Principal Investigator', 'short_text', 1],
  [2, 'co_investigator', 'Co-Investigator', 'short_text', 0],
  [2, 'funding_amount', 'Funding Amount', 'decimal', 0],
  [2, 'project_start_date', 'Project Start Date', 'date', 0],
  [2, 'project_end_date', 'Project End Date', 'date', 0],
  [3, 'data_type', 'Type of Data', 'multi_select', 1],
  [3, 'data_format', 'Data Format', 'short_text', 1],
  [3, 'data_volume', 'Estimated Data Volume', 'short_text', 0],
  [3, 'data_collection_method', 'Data Collection Method', 'long_text', 1],
  [4, 'data_storage', 'Data Storage', 'long_text', 1],
  [4, 'data_security', 'Data Security', 'long_text', 1],
  [4, 'backup_strategy', 'Backup Strategy', 'long_text', 0],
  [5, 'data_sharing', 'Data Sharing', 'long_text', 1],
  [5, 'data_preservation', 'Data Preservation', 'long_text', 1],
  [5, 'data_access', 'Data Access', 'long_text', 0],
  [5, 'data_license', 'Data License', 'single_select', 0],
  [5, 'metadata_standard', 'Metadata', 'long_text', 0],
  [5, 'ethical_considerations', 'Ethical Considerations', 'long_text', 0],
];

const PAGES = [
  ['home', 'Home'], ['about', 'About'], ['features', 'Features'],
  ['resources', 'Resources'], ['faq', 'FAQ'], ['contact', 'Contact'],
  ['privacy-policy', 'Privacy Policy'], ['terms-conditions', 'Terms & Conditions'],
];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dmp_system',
  });

  for (const r of ROLES) {
    await conn.query(
      'INSERT INTO roles (code,name,scope,description,is_system) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      r
    );
  }
  console.log('> Roles seeded.');

  for (const p of PERMISSIONS) {
    await conn.query(
      'INSERT INTO permissions (code,name,module) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      p
    );
  }
  const [[superRole]] = await conn.query("SELECT id FROM roles WHERE code='super_admin'");
  const [perms] = await conn.query('SELECT id FROM permissions');
  for (const p of perms) {
    await conn.query('INSERT IGNORE INTO role_permissions (role_id,permission_id) VALUES (?,?)', [superRole.id, p.id]);
  }
  console.log('> Permissions seeded.');

  let i = 0;
  for (const ft of FIELD_TYPES) {
    i += 1;
    await conn.query(
      'INSERT INTO field_types (code,name,input_kind,has_options,display_order) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      [...ft, i]
    );
  }
  console.log('> Field types seeded.');

  i = 0;
  for (const [name, code] of DOMAINS) {
    i += 1;
    await conn.query(
      'INSERT INTO domains (name,short_code,slug,display_order) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      [name, code, slugify(name, { lower: true, strict: true }), i]
    );
  }
  console.log('> Domains seeded.');

  for (const [name, order] of FIELD_GROUPS) {
    const [exists] = await conn.query('SELECT id FROM master_field_groups WHERE name=?', [name]);
    if (!exists.length) {
      await conn.query('INSERT INTO master_field_groups (name,display_order) VALUES (?,?)', [name, order]);
    }
  }
  const [groups] = await conn.query('SELECT id,display_order FROM master_field_groups');
  const groupByOrder = Object.fromEntries(groups.map((g) => [g.display_order, g.id]));
  const [types] = await conn.query('SELECT id,code FROM field_types');
  const typeByCode = Object.fromEntries(types.map((t) => [t.code, t.id]));

  i = 0;
  for (const [g, fname, label, typeCode, req] of MASTER_FIELDS) {
    i += 1;
    await conn.query(
      `INSERT INTO master_fields (group_id,field_type_id,field_name,field_label,is_required,display_order)
       VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE field_label=VALUES(field_label)`,
      [groupByOrder[g], typeByCode[typeCode], fname, label, req, i]
    );
  }
  console.log('> Master fields seeded.');

  const settings = [
    ['general', 'app_name', process.env.APP_NAME || 'DMP System'],
    ['general', 'contact_email', process.env.MAIL_FROM_EMAIL || ''],
    ['general', 'timezone', process.env.TIMEZONE || 'Asia/Kolkata'],
    ['general', 'date_format', process.env.DATE_FORMAT || 'DD-MM-YYYY'],
    ['security', 'session_timeout_minutes', process.env.SESSION_TIMEOUT_MINUTES || '60'],
    ['security', 'max_login_attempts', process.env.MAX_LOGIN_ATTEMPTS || '5'],
    ['registration', 'email_verification', process.env.ENABLE_EMAIL_VERIFICATION || 'false'],
    ['registration', 'researcher_registration', process.env.ENABLE_RESEARCHER_REGISTRATION || 'true'],
    ['storage', 'max_file_size_mb', process.env.MAX_FILE_SIZE_MB || '10'],
    ['storage', 'allowed_extensions', process.env.ALLOWED_EXTENSIONS || 'pdf,doc,docx'],
  ];
  for (const s of settings) {
    await conn.query(
      'INSERT INTO system_settings (setting_group,setting_key,setting_value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
      s
    );
  }

  for (const m of MODULES) {
    await conn.query('INSERT IGNORE INTO modules (code,name,enabled) VALUES (?,?,1)', [m, m.replace('_', ' ')]);
  }

  let order = 0;
  for (const [slug, title] of PAGES) {
    order += 1;
    await conn.query(
      'INSERT INTO public_pages (slug,title,content,display_order) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
      [slug, title, `<p>${title} content. Edit this from Super Admin &rarr; Public Website.</p>`, order]
    );
  }

  await conn.query(
    `INSERT INTO pdf_templates (name,is_default,header_text,footer_text)
     SELECT 'Default DMP Template',1,'Data Management Plan','Generated by ${process.env.APP_NAME || 'DMP System'}'
     WHERE NOT EXISTS (SELECT 1 FROM pdf_templates WHERE is_default=1)`
  );
  console.log('> Settings, modules, pages and PDF template seeded.');

  // ---- Super Admin from .env ----
  const email = (process.env.SUPER_ADMIN_EMAIL || 'admin@dmp.local').toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';
  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
  const [existing] = await conn.query('SELECT id FROM users WHERE email=?', [email]);
  if (existing.length) {
    await conn.query('UPDATE users SET password_hash=?, name=?, status="active", role_id=? WHERE id=?', [
      hash, process.env.SUPER_ADMIN_NAME || 'Super Administrator', superRole.id, existing[0].id,
    ]);
    console.log(`> Super Admin updated: ${email}`);
  } else {
    await conn.query(
      'INSERT INTO users (role_id,name,email,mobile,password_hash,status,email_verified_at) VALUES (?,?,?,?,?,"active",NOW())',
      [superRole.id, process.env.SUPER_ADMIN_NAME || 'Super Administrator', email, process.env.SUPER_ADMIN_MOBILE || null, hash]
    );
    console.log(`> Super Admin created: ${email}`);
  }

  await conn.end();
  console.log('\nSeeding complete. Login with the SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD from your .env file.');
})().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
