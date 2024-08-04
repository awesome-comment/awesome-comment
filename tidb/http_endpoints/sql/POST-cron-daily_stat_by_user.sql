USE arealme;

INSERT INTO ac_comment_daily_stat_by_user 
    (stat_date, total, posts, user_id, user_info)
SELECT
    CURDATE() as stat_date,
    COUNT(*) AS total,
    COUNT(DISTINCT post_id) as posts,
    user_id,
    JSON_OBJECT(
        'avatar', JSON_UNQUOTE(JSON_EXTRACT(MAX(user), '$.avatar')),
        'email', JSON_UNQUOTE(JSON_EXTRACT(MAX(user), '$.email')),
        'name', JSON_UNQUOTE(JSON_EXTRACT(MAX(user), '$.name')),
        'window', JSON_UNQUOTE(JSON_EXTRACT(MAX(user), '$.window')),
        'agent', JSON_UNQUOTE(JSON_EXTRACT(MAX(user), '$.agent')),
        'ip', JSON_UNQUOTE(JSON_EXTRACT(MAX(user), '$.ip'))
    ) AS user_info
FROM ac_comment
WHERE
    deleted_at IS NULL
    AND status=1
    AND created_at >= CURDATE() - INTERVAL 30 DAY
GROUP BY
    user_id;