CREATE TABLE students (

    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE,

    admission_number VARCHAR(30) NOT NULL UNIQUE,

    admission_sequence INTEGER NOT NULL,

    surname VARCHAR(100) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    middle_name VARCHAR(100),

    gender VARCHAR(10) NOT NULL,

    date_of_birth DATE NOT NULL,

    state_id INTEGER,

    nationality_id INTEGER,

    religion VARCHAR(50),

    blood_group VARCHAR(5),

    genotype VARCHAR(5),

    residential_address TEXT,

    class_id INTEGER NOT NULL,

    arm_id INTEGER NOT NULL,

    admission_date DATE NOT NULL,

    status VARCHAR(20) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_student_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_student_arm
        FOREIGN KEY (arm_id)
        REFERENCES arms(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_student_state
        FOREIGN KEY (state_id)
        REFERENCES states(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_student_nationality
        FOREIGN KEY (nationality_id)
        REFERENCES nationalities(id)
        ON DELETE SET NULL
);