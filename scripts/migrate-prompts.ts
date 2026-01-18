/**
 * 数据迁移脚本：从 Vercel Postgres 迁移 prompts 数据到 TiDB
 *
 * 使用方式：
 * 1. 先从 arealme-ai-admin 项目导出数据为 prompts.json
 * 2. 将 prompts.json 放到当前目录
 * 3. 配置 TiDB 连接信息
 * 4. 运行: node --import tsx scripts/migrate-prompts.ts
 */

import { createConnection, Connection, RowDataPacket } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Prompt {
  id: number;
  title: string;
  content: string;
  owner: string;
  allowed_emails: string[];
  created_at?: string;
  updated_at?: string;
}

async function main(): Promise<void> {
  // 读取导出的 prompts 数据
  const dataPath = join(import.meta.dirname, 'prompts.json');
  let prompts: Prompt[];

  try {
    const rawData = readFileSync(dataPath, 'utf-8');
    prompts = JSON.parse(rawData);
    console.log(`读取到 ${prompts.length} 条 prompts 数据`);
  } catch (error) {
    console.error('读取 prompts.json 失败，请先导出数据');
    console.error('提示：访问 arealme-ai-admin，运行以下 SQL 导出数据：');
    console.error('SELECT * FROM arealme_ai_prompts;');
    process.exit(1);
  }

  // 连接 TiDB
  const connection: Connection = await createConnection({
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'arealme',
    ssl: {
      rejectUnauthorized: true,
    },
  });

  console.log('已连接到 TiDB');

  // 检查表是否存在
  const [tables] = await connection.query<RowDataPacket[]>("SHOW TABLES LIKE 'ai_prompts'");
  if (tables.length === 0) {
    console.log('表 ai_prompts 不存在，正在创建...');
    const schemaPath = join(import.meta.dirname, '../tidb/schema/create_ai_prompts.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    await connection.query(schema);
    console.log('表 ai_prompts 创建成功');
  }

  // 插入数据
  let successCount = 0;
  let skipCount = 0;

  for (const prompt of prompts) {
    try {
      // 检查是否已存在
      const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM ai_prompts WHERE id = ?', [prompt.id]);

      if (existing.length > 0) {
        console.log(`跳过已存在的 prompt: ${prompt.title} (id: ${prompt.id})`);
        skipCount++;
        continue;
      }

      await connection.query(
        `INSERT INTO ai_prompts (id, title, content, owner, allowed_emails, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          prompt.id,
          prompt.title,
          prompt.content,
          prompt.owner,
          JSON.stringify(prompt.allowed_emails || []),
          prompt.created_at || new Date().toISOString(),
          prompt.updated_at || new Date().toISOString(),
        ],
      );
      console.log(`已导入: ${prompt.title}`);
      successCount++;
    } catch (error) {
      console.error(`导入失败: ${prompt.title}`, error);
    }
  }

  await connection.end();
  console.log(`\n迁移完成！成功: ${successCount}, 跳过: ${skipCount}`);
}

main().catch(console.error);
