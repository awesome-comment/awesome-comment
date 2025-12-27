USE arealme;

UPDATE ai_prompts
SET title = ${title}, content = ${content}, allowed_emails = ${allowed_emails}, updated_at = NOW()
WHERE id = ${id};
