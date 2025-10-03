USE arealme;

UPDATE `ac_comment`
SET `translation`=${translation},
  `is_translated`=TRUE,
  `updated_at`=CURRENT_TIMESTAMP
WHERE id=${id};
