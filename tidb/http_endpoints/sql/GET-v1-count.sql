USE arealme;

WITH CTE AS (
    SELECT id
    FROM ac_comment
    WHERE post_id=${post_id}
        AND status=1
        AND ancestor_id=0
        AND deleted_at IS NULL
)
SELECT COUNT(1) AS num
FROM ac_comment AS main_ac
WHERE
  EXISTS (
    SELECT 1 FROM CTE WHERE CTE.id = main_ac.id
  )
  OR (
    EXISTS (
      SELECT 1 FROM CTE WHERE CTE.id = main_ac.ancestor_id
    )
    AND main_ac.status = 1
    AND main_ac.deleted_at IS NULL
  );
