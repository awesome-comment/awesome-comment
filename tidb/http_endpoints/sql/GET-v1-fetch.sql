USE arealme;

SELECT *
FROM ac_comment
WHERE status=1
  AND id IN(
	SELECT id 
	FROM ac_comment
	WHERE post_id=${post_id}
	  AND status=1
      AND (
		ancestor_id IS NULL
		OR ancestor_id=0
	  )
	ORDER BY id DESC
	LIMIT ${start}, 20
)
  OR (ancestor_id IN(
	SELECT id 
	FROM ac_comment
	WHERE post_id=${post_id}
	  AND status=1
      AND (
		ancestor_id IS NULL
		OR ancestor_id=0
	  )
	ORDER BY id DESC
	LIMIT ${start}, 20
  ) AND status=1)
ORDER BY id DESC;
