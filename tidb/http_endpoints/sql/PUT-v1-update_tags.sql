USE arealme;

UPDATE `ac_comment`
SET `tags`=${tags},
  `updated_at`=CURRENT_TIMESTAMP
WHERE id=${id};