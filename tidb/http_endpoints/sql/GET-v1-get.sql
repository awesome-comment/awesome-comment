/* Getting Started:
Enter "USE {database};" before entering your SQL statements.
Type "--your question" + Enter to try out AI-generated SQL queries
Declare a parameter like "Where id = ${arg}".
*/
USE arealme;

SELECT *
FROM ac_comment
WHERE post_id=${post_id}
  AND (
    status=1
    OR user_id=${user_id}
  )
ORDER BY id DESC
LIMIT ${start}, 20;
