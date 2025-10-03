USE `arealme`;

SELECT `id`,`content`,`post_id`
FROM `ac_comment`
WHERE deleted_at IS NULL
  AND `status`!=2
  AND `is_translated` IS NULL
ORDER BY `id` DESC
LIMIT 10;