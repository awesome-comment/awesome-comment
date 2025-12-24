USE arealme;

SELECT post_id, status
FROM ac_comment
WHERE user_id=${user_id}
  AND deleted_at IS NULL
  AND IF(LENGTH(${post_id_prefix}) > 0, post_id LIKE ${post_id_prefix}, 1)
ORDER BY id DESC
LIMIT ${start}, 100;
