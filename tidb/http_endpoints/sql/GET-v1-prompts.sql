USE arealme;

SELECT id, title, content, owner, allowed_emails, created_at, updated_at
FROM ai_prompts
ORDER BY title ASC
LIMIT 100;
