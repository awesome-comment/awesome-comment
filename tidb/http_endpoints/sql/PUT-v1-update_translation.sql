USE arealme;

UPDATE `ac_comment`
SET `translation`=${translation},
  `is_translated`=1
WHERE id=${id}
  AND `updated_at`=CURRENT_TIMESTAMP;
