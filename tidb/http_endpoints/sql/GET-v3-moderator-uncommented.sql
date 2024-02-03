USE arealme;

SELECT a.*
FROM ac_comment a
WHERE (a.parent_id = 0 OR a.parent_id IS NULL)
  AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.user, '$.email')), '') NOT IN (${emails})
  AND a.status IN (0, 1)
  AND a.deleted_at IS NULL
  AND IF(LENGTH(${post_id}) > 0, a.post_id = ${post_id}, 1)
  AND IF(LENGTH(${user_id}) > 0, a.user_id = ${user_id}, 1)
  AND NOT EXISTS (
    SELECT 1
    FROM ac_comment b
    WHERE a.id=b.parent_id
      AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(b.user, '$.email')), '') IN (${emails})
  )
ORDER BY a.id DESC
LIMIT ${start}, 20;
