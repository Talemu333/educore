CREATE TABLE classes (
    id SERIAL PRIMARY KEY,

    class_name VARCHAR(20) NOT NULL,

    class_level VARCHAR(10) NOT NULL,

    sort_order INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_class_name
        UNIQUE (class_name),

    CONSTRAINT chk_class_level
        CHECK (
            class_level IN (
                'Junior',
                'Senior'
            )
        ),

    CONSTRAINT uq_sort_order
        UNIQUE (sort_order)
);