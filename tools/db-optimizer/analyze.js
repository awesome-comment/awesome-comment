import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_DIR = join(__dirname, '../../tidb/http_endpoints/sql');
const OUTPUT_FILE = join(__dirname, 'db-context.md');

async function getConnection() {
  return mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '4000'),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: true },
  });
}

async function getTableSchema(conn) {
  const [tables] = await conn.query(`
    SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ?
  `, [process.env.DATABASE_NAME]);

  const schemas = {};
  for (const table of tables) {
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.DATABASE_NAME, table.TABLE_NAME]);

    const [indexes] = await conn.query(`
      SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `, [process.env.DATABASE_NAME, table.TABLE_NAME]);

    schemas[table.TABLE_NAME] = {
      rows: table.TABLE_ROWS,
      dataSize: table.DATA_LENGTH,
      indexSize: table.INDEX_LENGTH,
      columns,
      indexes,
    };
  }
  return schemas;
}

async function loadSqlFiles() {
  const files = await readdir(SQL_DIR);
  const sqls = {};
  for (const file of files.filter(f => f.endsWith('.sql'))) {
    const content = await readFile(join(SQL_DIR, file), 'utf-8');
    sqls[file] = content;
  }
  return sqls;
}

function formatBytes(bytes) {
  if (!bytes) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function generateMarkdown(schemas, sqls) {
  let md = `# Database Context for Optimization Analysis

Generated: ${new Date().toISOString()}
Database: ${process.env.DATABASE_NAME}

---

## Table Schemas

`;

  for (const [tableName, schema] of Object.entries(schemas)) {
    md += `### ${tableName}

- Rows: ${schema.rows?.toLocaleString() || 'N/A'}
- Data Size: ${formatBytes(schema.dataSize)}
- Index Size: ${formatBytes(schema.indexSize)}

**Columns:**

| Column | Type | Nullable | Key |
|--------|------|----------|-----|
`;
    for (const col of schema.columns) {
      md += `| ${col.COLUMN_NAME} | ${col.DATA_TYPE} | ${col.IS_NULLABLE} | ${col.COLUMN_KEY || '-'} |\n`;
    }

    md += `\n**Indexes:**\n\n`;
    const indexGroups = {};
    for (const idx of schema.indexes) {
      if (!indexGroups[idx.INDEX_NAME]) {
        indexGroups[idx.INDEX_NAME] = [];
      }
      indexGroups[idx.INDEX_NAME].push(idx.COLUMN_NAME);
    }
    for (const [name, cols] of Object.entries(indexGroups)) {
      md += `- \`${name}\`: (${cols.join(', ')})\n`;
    }
    md += '\n---\n\n';
  }

  md += `## SQL Queries

`;

  for (const [filename, content] of Object.entries(sqls)) {
    md += `### ${filename}

\`\`\`sql
${content.trim()}
\`\`\`

`;
  }

  return md;
}

async function main() {
  console.log('🔍 连接数据库...');
  const conn = await getConnection();

  try {
    console.log('📊 获取表结构...');
    const schemas = await getTableSchema(conn);
    console.log(`   找到 ${Object.keys(schemas).length} 个表`);

    console.log('📝 加载 SQL 文件...');
    const sqls = await loadSqlFiles();
    console.log(`   找到 ${Object.keys(sqls).length} 个 SQL 文件`);

    console.log('📄 生成文档...');
    const markdown = generateMarkdown(schemas, sqls);

    await writeFile(OUTPUT_FILE, markdown);
    console.log(`✅ 已保存到: ${OUTPUT_FILE}`);

  } finally {
    await conn.end();
  }
}

main().catch(console.error);
