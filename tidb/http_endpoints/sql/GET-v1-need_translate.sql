USE `arealme`;

SELECT `id`,`content`,`post_id`
FROM `ac_comment`
WHERE deleted_at IS NULL
  AND `status`!=2
  AND `is_translated` IS NULL
  AND IF(${after_id} > 0, `id` > ${after_id}, 1)
ORDER BY `id` DESC
LIMIT 10;