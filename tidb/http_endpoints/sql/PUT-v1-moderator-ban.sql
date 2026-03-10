USE arealme;

UPDATE ac_comment
SET is_shadow_banned=${banned}, updated_at=now()
WHERE id=${id};
