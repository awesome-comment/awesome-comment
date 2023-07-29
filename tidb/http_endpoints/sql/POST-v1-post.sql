/* Getting Started:
Enter "USE {database};" before entering your SQL statements.
Type "--your question" + Enter to try out AI-generated SQL queries
Declare a parameter like "Where id = ${arg}".
*/
USE arealme;

INSERT INTO ac_comment
(post_id, user_id, content, user, status)
VALUES (${post_id}, ${user_id}, ${content}, ${user}, 0);

SELECT
  LAST_INSERT_ID() AS last_insert_id;