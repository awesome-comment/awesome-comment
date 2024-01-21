USE arealme;

SELECT a.*
FROM ac_comment a
  LEFT JOIN ac_comment b ON a.id = b.parent_id
WHERE b.id IS NULL
  AND (a.parent_id = 0 OR a.parent_id IS NULL)
  AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.user, '$.email'))) NOT IN (${emails})
  AND a.status IN (0, 1)
  AND a.deleted_at IS NULL
  AND IF(LENGTH(${post_id}) > 0, a.post_id = ${post_id}, 1)
ORDER BY a.id DESC
LIMIT ${start}, 20;
