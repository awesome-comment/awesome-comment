USE arealme;

SELECT a.*, b.id as toId, b.content as toContent, b.user as toUser
FROM ac_comment a
    LEFT JOIN ac_comment b on a.parent_id = b.id # b is Admin
WHERE COALESCE(JSON_UNQUOTE(JSON_EXTRACT(b.user, '$.email')), '') IN (${emails})
    AND a.status IN (0, 1)
    AND a.deleted_at IS NULL
    AND IF(LENGTH(${post_id}) > 0, a.post_id = ${post_id}, 1)
    AND IF(LENGTH(${user_id}) > 0, a.user_id = ${user_id}, 1)
    AND NOT EXISTS ( # not replied by Admin
        SELECT 1
        FROM ac_comment c
        WHERE a.id=c.parent_id
            AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(c.user, '$.email')), '') IN (${emails})
    )
ORDER BY a.id DESC
LIMIT ${start}, 20;
