USE arealme;

WITH CTE AS (
    SELECT id
    FROM ac_comment
    WHERE post_id=${post_id} AND status=1 AND ancestor_id=0 AND deleted_at IS NULL
    ORDER BY id DESC LIMIT ${start}, 21
)
-- Part 1: id IN CTE
SELECT main_ac.*
FROM ac_comment AS main_ac
JOIN CTE ON main_ac.id = CTE.id -- 这里用 INNER JOIN，因为 EXISTS 隐含了匹配

UNION -- 使用 UNION 来自动去重，如果一个 comment 同时满足两个条件

-- Part 2: ancestor_id IN CTE AND status=1 AND deleted_at IS NULL
SELECT main_ac.*
FROM ac_comment AS main_ac
JOIN CTE ON main_ac.ancestor_id = CTE.id -- 这里用 INNER JOIN
WHERE main_ac.status = 1 AND main_ac.deleted_at IS NULL;
