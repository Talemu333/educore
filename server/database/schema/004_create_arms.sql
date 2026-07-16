CREATE TABLE arms (
    id SERIAL PRIMARY KEY,

    class_id INTEGER;

    arm_name VARCHAR(10) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_arm_name
        UNIQUE (arm_name),
    
    CONSTRAINT fk_arm_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE;
);