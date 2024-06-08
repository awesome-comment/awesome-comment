USE arealme;

SELECT *
FROM ac_comment_daily_stat_by_user
WHERE stat_date >= ${start}
  AND stat_date <= ${end};