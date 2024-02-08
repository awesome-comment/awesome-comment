USE arealme;

UPDATE ac_comment 
SET content=${content}
WHERE id=${id} 
  AND user_id=${user_id} 
  AND created_at > NOW() - INTERVAL 1 HOUR
LIMIT 1;
