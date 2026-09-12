CREATE TABLE relationships (

    id SERIAL PRIMARY KEY,

    relationship_name VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO relationships (id, relationship_name)
VALUES
    (1, 'Father'),
    (2, 'Mother'),
    (3, 'Guardian'),
    (4, 'Uncle'),
    (5, 'Aunt')
ON CONFLICT (id) DO UPDATE SET
    relationship_name = EXCLUDED.relationship_name;

SELECT setval(
    pg_get_serial_sequence('relationships', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM relationships), 1),
    true
);
