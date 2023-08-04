/* Getting Started:
Enter "USE {database};" before entering your SQL statements.
Type "--your question" + Enter to try out AI-generated SQL queries
Declare a parameter like "Where id = ${arg}".
*/
USE arealme;

SELECT *
FROM ac_comment
WHERE user_id=${user_id}
ORDER BY created_at DESC
LIMIT ${start}, 20;