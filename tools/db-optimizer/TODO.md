# 数据库优化待办事项

生成时间: 2025-11-30

## 高优先级

### 2. `tags` 列查询优化

**问题：** `tags` 列用于过滤但无法有效使用索引。

**影响的查询：**
- `GET-v1-untagged_comments.sql`: `tags IS NULL`
- `GET-v3-moderator-get.sql`: `JSON_CONTAINS(tags, ${tag})`

**解决方案：**

方案 A - 添加生成列（推荐）：
```sql
ALTER TABLE ac_comment
ADD COLUMN has_tags TINYINT(1) 
GENERATED ALWAYS AS (tags IS NOT NULL) STORED;

CREATE INDEX idx_ac_comment_has_tags ON ac_comment(has_tags);
```

方案 B - 修改查询逻辑，在应用层处理 tag 过滤。

---

### 3. 重写使用 JSON 函数的 SQL

**问题：** 以下 SQL 使用 `JSON_EXTRACT(user, '$.email')` 提取邮箱，无法使用索引。但表中已有 `user_email` 列。

**影响的查询：**
- `GET-v3-moderator-reply_admin.sql`
- `GET-v3-moderator-uncommented.sql`
- `POST-cron-daily_stat_by_user.sql`

**解决方案：** 将这些 SQL 中的 JSON 函数调用改为使用 `user_email` 列。

示例修改 `GET-v3-moderator-uncommented.sql`：
```sql
-- 原来
COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.user, '$.email')), '') NOT IN (${emails})

-- 改为
a.user_email NOT IN (${emails})
```

---

## 执行清单

- [ ] 执行 `CREATE INDEX idx_ac_comment_created_at ON ac_comment(created_at);`
- [ ] 评估是否需要 `has_tags` 生成列
- [ ] 重写 `GET-v3-moderator-reply_admin.sql` 使用 `user_email`
- [ ] 重写 `GET-v3-moderator-uncommented.sql` 使用 `user_email`
- [ ] 重写 `POST-cron-daily_stat_by_user.sql` 使用 `user_email`（如适用）
