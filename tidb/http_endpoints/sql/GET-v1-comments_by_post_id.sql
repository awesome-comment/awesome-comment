USE arealme;

SELECT id, user, content, created_at
FROM ac_comment
WHERE post_id=${post_id}
    AND status=1
    AND (
        ancestor_id IS NULL
            OR ancestor_id=0
    )
    AND deleted_at IS NULL
ORDER BY id DESC
LIMIT 1000;