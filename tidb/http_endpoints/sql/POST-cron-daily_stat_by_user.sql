USE arealme;

INSERT INTO ac_comment_daily_stat_by_user (stat_date, total, user_id)
SELECT
    CURDATE(),
    COUNT(*) AS total,
    user_id
FROM ac_comment
WHERE
    deleted_at IS NULL
GROUP BY
    user_id;