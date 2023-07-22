/* Getting Started:
Enter "USE {database};" before entering your SQL statements.
Type "--your question" + Enter to try out AI-generated SQL queries
Declare a parameter like "Where id = ${arg}".
*/
USE arealme;

SELECT *
FROM ac_comment
WHERE status in (${status})
  AND deleted_at is NULL
ORDER BY id DESC
LIMIT ${start}, 20;
