USE arealme;

SELECT *
FROM ac_comment_daily_stat_by_user
WHERE stat_date = ${date}
ORDER by total DESC
LIMIT ${start}, 50;