USE arealme;

SELECT * FROM (
    WITH CTE AS (
        SELECT id, parent_id
        FROM ac_comment
        WHERE deleted_at IS NULL
            AND user_email NOT IN (${emails})
            AND IF(LENGTH(${post_id}) > 0, post_id = ${post_id}, 1)
            AND IF(LENGTH(${status}) > 0, status = ${status}, 1)
            AND IF(LENGTH(${user_id}) > 0, user_id = ${user_id}, 1)
            AND IF(LENGTH(${lang}) > 0, post_id LIKE ${lang}, 1)
            AND IF(LENGTH(${tag}) > 0, JSON_CONTAINS(tags, ${tag}), 1)
        ORDER BY id DESC
        LIMIT ${start}, 20
    )
    SELECT main_ac.*
    FROM ac_comment AS main_ac
        JOIN CTE ON main_ac.id = CTE.id

    UNION

    SELECT main_ac.*
    FROM ac_comment AS main_ac
        JOIN CTE ON main_ac.parent_id = CTE.id
    WHERE main_ac.deleted_at IS NULL
    AND main_ac.user_email IN (${emails})

    UNION

    SELECT main_ac.*
    FROM ac_comment AS main_ac
        JOIN CTE ON main_ac.id = CTE.parent_id
    WHERE main_ac.deleted_at IS NULL
        AND CTE.parent_id IS NOT NULL AND CTE.parent_id > 0
) AS final_results
ORDER BY id DESC;
