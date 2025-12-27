USE arealme;

INSERT INTO ai_prompts (title, content, owner, allowed_emails)
VALUES (${title}, ${content}, ${owner}, ${allowed_emails});

SELECT LAST_INSERT_ID() AS last_insert_id;