-- Teacher registration depends on these shared reference values being present
-- in every isolated school database. Keep this migration idempotent so it can
-- safely repair existing school databases as well as provision new ones.

INSERT INTO nationalities (nationality_name)
SELECT v.nationality_name
FROM (VALUES ('Nigerian')) AS v(nationality_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM nationalities n
    WHERE LOWER(TRIM(n.nationality_name)) = LOWER(TRIM(v.nationality_name))
);

INSERT INTO states (state_name)
SELECT v.state_name
FROM (VALUES
    ('Lagos'),
    ('Oyo'),
    ('Ogun'),
    ('Abuja')
) AS v(state_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM states s
    WHERE LOWER(TRIM(s.state_name)) = LOWER(TRIM(v.state_name))
);

INSERT INTO qualifications (qualification_name)
SELECT v.qualification_name
FROM (VALUES
    ('NCE'),
    ('OND'),
    ('HND'),
    ('B.Ed'),
    ('B.Sc'),
    ('B.Sc (Ed)'),
    ('B.A'),
    ('M.Ed'),
    ('M.Sc'),
    ('MBA'),
    ('PhD')
) AS v(qualification_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM qualifications q
    WHERE LOWER(TRIM(q.qualification_name)) = LOWER(TRIM(v.qualification_name))
);

-- Departments are school-scoped in the isolated-school schema. Existing
-- school databases already contain their school row, so use that row instead
-- of inserting a NULL school_id.
INSERT INTO departments (school_id, department_name)
SELECT s.id, v.department_name
FROM (SELECT id FROM schools ORDER BY id LIMIT 1) AS s
CROSS JOIN (VALUES
    ('Administration'),
    ('Nursery'),
    ('Primary'),
    ('Junior Secondary'),
    ('Senior Secondary'),
    ('Sciences'),
    ('Arts'),
    ('Commercial'),
    ('ICT'),
    ('Accounts')
) AS v(department_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.school_id = s.id
      AND LOWER(TRIM(d.department_name)) = LOWER(TRIM(v.department_name))
);
