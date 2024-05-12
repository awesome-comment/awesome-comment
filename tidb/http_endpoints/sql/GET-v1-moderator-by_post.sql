USE arealme;

SELECT
  post_id,
  COUNT('x') AS comment_count
FROM
  ac_comment
WHERE
  deleted_at IS NULL
  AND status=1
GROUP BY
  post_id
ORDER BY comment_count DESC
LIMIT ${start}, 20;
