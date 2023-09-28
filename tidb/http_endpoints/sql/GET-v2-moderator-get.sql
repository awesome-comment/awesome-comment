USE arealme;

SELECT *
FROM ac_comment
WHERE
  id IN(
    SELECT id
    FROM ac_comment
    WHERE status = ${status}
      AND deleted_at is NULL
      AND user_id != ${user_id}
      AND IF(LENGTH(${post_id}) > 0, post_id = ${post_id}, 1)
    ORDER BY id DESC
    LIMIT ${start}, 20
  )
  OR (parent_id IN (
    SELECT id
    FROM ac_comment
	  WHERE status = ${status}
      AND deleted_at is NULL
      AND user_id != ${user_id}
      AND IF(LENGTH(${post_id}) > 0, post_id = ${post_id}, 1)
    ORDER BY id DESC
    LIMIT ${start}, 20
  ) AND user_id=${user_id})
ORDER BY id DESC;
