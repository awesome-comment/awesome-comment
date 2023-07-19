/* Getting Started:
Enter "USE {database};" before entering your SQL statements.
Type "--your question" + Enter to try out AI-generated SQL queries
Declare a parameter like "Where id = ${arg}".
*/

USE arealme;

UPDATE ac_comment
SET status=${status}
WHERE id=${id};