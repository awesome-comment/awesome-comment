USE `arealme`;

SELECT `id`, `content`
FROM `ac_comment`
WHERE deleted_at IS NULL
  AND `tags` IS NULL
  AND IF(${after_id} > 0, `id` > ${after_id}, 1)
ORDER BY `id` DESC
LIMIT 10;