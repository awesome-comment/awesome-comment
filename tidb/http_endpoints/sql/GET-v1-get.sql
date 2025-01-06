USE arealme;

WITH CTE AS (
    SELECT id
    FROM ac_comment
    WHERE post_id=${post_id}
        AND status=1
        AND ancestor_id=0
        AND deleted_at IS NULL
    ORDER BY id DESC
    LIMIT ${start}, 21
)
SELECT *
FROM ac_comment
WHERE id IN (SELECT * FROM CTE)
    OR (ancestor_id IN (SELECT * FROM CTE)
        AND status=1
        AND deleted_at IS NULL
    );
