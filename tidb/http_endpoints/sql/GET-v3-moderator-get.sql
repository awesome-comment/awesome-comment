USE arealme;

WITH CTE AS (
  SELECT id
  FROM ac_comment
  WHERE deleted_at is NULL
    AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(user, '$.email')), '') NOT IN (${emails})
    AND IF(LENGTH(${post_id}) > 0, post_id = ${post_id}, 1)
    AND IF(LENGTH(${status}) > 0, status = ${status}, 1)
    AND IF(LENGTH(${user_id}) > 0, user_id = ${user_id}, 1)
    AND IF(LENGTH(${lang}) > 0, post_id LIKE ${lang}, 1)
  ORDER BY id DESC
  LIMIT ${start}, 20
)
SELECT a.*, b.content AS toContent
FROM ac_comment AS a LEFT JOIN ac_comment AS b ON a.parent_id=b.id
WHERE
  a.id IN (SELECT * FROM CTE)
  OR (
    a.parent_id IN (SELECT * FROM CTE)
    AND JSON_EXTRACT(a.user, '$.email') IN (${emails})
  )
ORDER BY a.id DESC;
