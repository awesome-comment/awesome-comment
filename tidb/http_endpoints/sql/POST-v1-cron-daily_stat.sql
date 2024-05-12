USE arealme;

INSERT INTO ac_comment_daily_stat (date, total, lang)
SELECT
    CURDATE(),
    COUNT(*) AS total,
    language
FROM
    (SELECT
        SUBSTRING_INDEX(TRIM(TRAILING '/' FROM post_id), '/', -1) AS language
    FROM
        ac_comment
    WHERE
        deleted_at IS NULL
        AND DATE(created_at) = CURDATE()
    ) AS subquery
WHERE LENGTH(language) < 3
GROUP BY
    language;