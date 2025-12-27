USE arealme;

SELECT id, title, content, owner, allowed_emails, created_at, updated_at
FROM ai_prompts
WHERE id = ${id};
