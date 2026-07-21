CREATE TABLE timetables (

    id SERIAL PRIMARY KEY,

    teacher_assignment_id INTEGER NOT NULL,

    day_of_week VARCHAR(10) NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    room VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_timetable_assignment
        FOREIGN KEY (teacher_assignment_id)
        REFERENCES teacher_assignments(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_day
        CHECK (
            day_of_week IN
            (
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            )
        ),

    CONSTRAINT chk_time
        CHECK (end_time > start_time)
);