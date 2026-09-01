-- EduCore platform-level administrator role.
-- Super Admin accounts must have users.school_id = NULL.

INSERT INTO roles (role_name, description)
SELECT
    'Super Admin',
    'Platform-level administrator with access to manage EduCore schools.'
WHERE NOT EXISTS (
    SELECT 1
    FROM roles
    WHERE role_name = 'Super Admin'
);

-- Do not automatically promote an existing user.
-- After reviewing the account that should manage EduCore, promote it explicitly:
--
-- UPDATE users
-- SET role_id = (SELECT id FROM roles WHERE role_name = 'Super Admin'),
--     school_id = NULL,
--     admin_type = NULL,
--     updated_at = CURRENT_TIMESTAMP
-- WHERE username = 'YOUR_SUPER_ADMIN_USERNAME';
