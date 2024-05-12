USE arealme;

SELECT *
FROM ac_comment_daily_stat
WHERE date >= ${start}
  and date <= ${end};