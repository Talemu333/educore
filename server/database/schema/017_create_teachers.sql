CREATE TABLE teachers (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    staff_number VARCHAR(50) NOT NULL UNIQUE,

    surname VARCHAR(100) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    middle_name VARCHAR(100),

    gender VARCHAR(20) NOT NULL,

    date_of_birth DATE,

    phone_number VARCHAR(20),

    email VARCHAR(100),

    address TEXT,

    marital_status VARCHAR(20),

    next_of_kin_name VARCHAR(150),

    next_of_kin_phone VARCHAR(20),

    emergency_contact_name VARCHAR(150),

    emergency_contact_phone VARCHAR(20),

    qualification_id INTEGER,

    department_id INTEGER,

    employment_date DATE,

    state_id INTEGER,

    nationality_id INTEGER,

    passport_url TEXT,

    status BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_teacher_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_teacher_qualification
        FOREIGN KEY(qualification_id)
        REFERENCES qualifications(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_teacher_department
        FOREIGN KEY(department_id)
        REFERENCES departments(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_teacher_state
        FOREIGN KEY(state_id)
        REFERENCES states(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_teacher_nationality
        FOREIGN KEY(nationality_id)
        REFERENCES nationalities(id)
        ON DELETE RESTRICT
);