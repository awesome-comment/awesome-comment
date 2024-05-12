USE arealme;

SELECT COUNT(DISTINCT(post_id)) AS comment_count
FROM
  ac_comment
WHERE
  deleted_at IS NULL
  AND status=1;