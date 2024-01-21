USE arealme;

SELECT a.*, b.id, b.content, b.ancestor_id
FROM ac_comment a
    LEFT JOIN ac_comment b on a.parent_id = b.id # b is Admin
    LEFT JOIN ac_comment c on c.parent_id = a.id # c is Users
WHERE COALESCE(JSON_UNQUOTE(JSON_EXTRACT(b.user, '$.email')), '') IN (${emails})
    AND (
        c.id IS NULL
        OR COALESCE(JSON_UNQUOTE(JSON_EXTRACT(c.user, '$.email')), '') NOT IN (${emails})
    )
    AND a.status IN (0, 1)
    AND a.deleted_at IS NULL
    AND IF(LENGTH(${post_id}) > 0, a.post_id = ${post_id}, 1)
ORDER BY a.id DESC
LIMIT ${start}, 20;