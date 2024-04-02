USE arealme;

SELECT COUNT(*) AS num
FROM ac_comment
WHERE post_id=${post_id}
  AND deleted_at IS NULL
  AND status=1;
