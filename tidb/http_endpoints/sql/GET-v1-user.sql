USE arealme;

SELECT post_id, status
FROM ac_comment
WHERE user_id=${user_id}
  AND deleted_at IS NULL
ORDER BY id DESC
LIMIT ${start}, 100;