USE arealme;

UPDATE ac_comment
SET `like`=${like}
WHERE id=${id}
  AND IF(LENGTH(${post_id}) > 0, post_id = ${post_id}, 1);
