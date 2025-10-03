USE arealme;

WITH CTE AS (
    SELECT id
    FROM ac_comment
    WHERE post_id=${post_id}
        AND status=1
        AND ancestor_id=0
        AND deleted_at IS NULL
)
SELECT COUNT(*) AS num
FROM (
    SELECT main_ac.id
    FROM ac_comment AS main_ac
        JOIN CTE ON main_ac.id = CTE.id

    UNION

    SELECT main_ac.id
    FROM ac_comment AS main_ac
        JOIN CTE ON main_ac.ancestor_id = CTE.id
    WHERE main_ac.status = 1 AND main_ac.deleted_at IS NULL
) AS distinct_comment_ids;
