USE arealme;

UPDATE ac_comment
SET updated_at=now(),
    original_content=COALESCE(original_content, content),
    content=${content}
WHERE id=${id}
  AND IF(LENGTH(${post_id}) > 0, post_id = ${post_id}, 1);
