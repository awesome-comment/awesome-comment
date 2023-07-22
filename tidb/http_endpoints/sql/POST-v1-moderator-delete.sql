/* Getting Started:
Enter "USE {database};" before entering your SQL statements.
Type "--your question" + Enter to try out AI-generated SQL queries
Declare a parameter like "Where id = ${arg}".
*/
USE ac_comment;

UPDATE ac_comment
SET deleted_at=now()
WHERE id=${id};
