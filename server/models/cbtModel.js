const pool = require("../config/database");

const getExams = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const conditions = ["e.school_id = $1"];
    let i = 2;
    if (filters.classId) { conditions.push(`e.class_id = $${i++}`); values.push(filters.classId); }
    if (filters.subjectId) { conditions.push(`e.subject_id = $${i++}`); values.push(filters.subjectId); }
    if (filters.status) { conditions.push(`e.status = $${i++}`); values.push(filters.status); }
    const result = await pool.query(`
        SELECT e.*, s.subject_name, c.class_name, a.arm_name, u.username AS creator_name
        FROM cbt_exams e
        JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id
        JOIN classes c ON c.id=e.class_id AND c.school_id=e.school_id
        LEFT JOIN arms a ON a.id=e.arm_id AND a.school_id=e.school_id
        JOIN users u ON u.id=e.created_by AND u.school_id=e.school_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.created_at DESC,e.id DESC;
    `, values);
    return result.rows;
};

const getAvailableStudentExams = async (studentId, schoolId) => {
    const result = await pool.query(`
        SELECT e.id,e.title,e.description,e.duration_minutes,e.total_marks,e.pass_mark,e.max_attempts,
               e.question_selection_count,e.randomize_questions,e.randomize_options,e.show_result_immediately,e.starts_at,e.ends_at,
               s.subject_name,c.class_name,a.arm_name,COALESCE(att.attempt_count,0) AS attempt_count
        FROM cbt_exams e
        JOIN students st ON st.id=$1 AND st.school_id=$2 AND st.class_id=e.class_id AND (e.arm_id IS NULL OR e.arm_id=st.arm_id)
        JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id
        JOIN classes c ON c.id=e.class_id AND c.school_id=e.school_id
        LEFT JOIN arms a ON a.id=e.arm_id AND a.school_id=e.school_id
        LEFT JOIN (SELECT exam_id,COUNT(*)::int AS attempt_count FROM cbt_attempts WHERE student_id=$1 AND school_id=$2 GROUP BY exam_id) att ON att.exam_id=e.id
        WHERE e.school_id=$2 AND e.status='published'
          AND (e.starts_at IS NULL OR e.starts_at<=CURRENT_TIMESTAMP)
          AND (e.ends_at IS NULL OR e.ends_at>=CURRENT_TIMESTAMP)
        ORDER BY e.starts_at NULLS FIRST,e.created_at DESC,e.id DESC;
    `, [studentId, schoolId]);
    return result.rows;
};

const getExamById = async (examId, schoolId) => {
    const result = await pool.query(`
        SELECT e.*,s.subject_name,c.class_name,a.arm_name
        FROM cbt_exams e
        JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id
        JOIN classes c ON c.id=e.class_id AND c.school_id=e.school_id
        LEFT JOIN arms a ON a.id=e.arm_id AND a.school_id=e.school_id
        WHERE e.id=$1 AND e.school_id=$2;
    `, [examId, schoolId]);
    return result.rows[0];
};

const getQuestionTotalMarks = async (examId, schoolId, client=pool) => {
    const result = await client.query(`SELECT COALESCE(SUM(marks),0)::numeric AS total_marks,COUNT(*)::int AS question_count FROM cbt_questions WHERE exam_id=$1 AND school_id=$2`, [examId,schoolId]);
    return { totalMarks:Number(result.rows[0]?.total_marks||0), questionCount:Number(result.rows[0]?.question_count||0) };
};

const syncExamTotalMarks = async (examId, schoolId, client=pool) => {
    const totals=await getQuestionTotalMarks(examId,schoolId,client);
    const result=await client.query(`UPDATE cbt_exams SET total_marks=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2 RETURNING *`,[examId,schoolId,totals.totalMarks]);
    return result.rows[0];
};

const createExam = async (data, schoolId, userId) => {
    if(data.status==="published") throw new Error("Create the examination as a draft, add its questions, then publish it.");
    const result=await pool.query(`INSERT INTO cbt_exams (school_id,subject_id,class_id,arm_id,title,description,duration_minutes,total_marks,pass_mark,max_attempts,question_selection_count,randomize_questions,randomize_options,show_result_immediately,starts_at,ends_at,status,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,[schoolId,data.subject_id,data.class_id,data.arm_id||null,data.title,data.description||null,data.duration_minutes,data.pass_mark||0,data.max_attempts||1,Math.max(0,Number(data.question_selection_count)||0),Boolean(data.randomize_questions),Boolean(data.randomize_options),data.show_result_immediately!==false,data.starts_at||null,data.ends_at||null,data.status||"draft",userId]);
    return result.rows[0];
};

const updateExam = async (examId,data,schoolId) => {
    const client=await pool.connect();
    try{
        await client.query("BEGIN");
        const totals=await getQuestionTotalMarks(examId,schoolId,client);
        const selectionCount=Math.max(0,Number(data.question_selection_count)||0);
        if(data.status==="published"&&totals.questionCount===0) throw new Error("Add at least one question before publishing this examination.");
        if(selectionCount>0&&selectionCount>totals.questionCount) throw new Error(`This examination requests ${selectionCount} questions, but only ${totals.questionCount} question(s) are available.`);
        const result=await client.query(`UPDATE cbt_exams SET subject_id=$3,class_id=$4,arm_id=$5,title=$6,description=$7,duration_minutes=$8,total_marks=$9,pass_mark=$10,max_attempts=$11,question_selection_count=$12,randomize_questions=$13,randomize_options=$14,show_result_immediately=$15,starts_at=$16,ends_at=$17,status=$18,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2 RETURNING *`,[examId,schoolId,data.subject_id,data.class_id,data.arm_id||null,data.title,data.description||null,data.duration_minutes,totals.totalMarks,data.pass_mark||0,data.max_attempts||1,selectionCount,Boolean(data.randomize_questions),Boolean(data.randomize_options),data.show_result_immediately!==false,data.starts_at||null,data.ends_at||null,data.status||"draft"]);
        if(!result.rows[0]){await client.query("ROLLBACK");return null;}
        await client.query("COMMIT");return result.rows[0];
    }catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
};

const deleteExam=async(examId,schoolId)=>{const result=await pool.query("DELETE FROM cbt_exams WHERE id=$1 AND school_id=$2 RETURNING id",[examId,schoolId]);return result.rows[0];};

const getQuestions=async(examId,schoolId,randomSeed=null)=>{
    const randomQuestions=randomSeed!==null;
    const questionOrder=randomQuestions?"md5(q.id::text || $3::text)":"q.question_order";
    const optionOrder=randomQuestions?"md5(o.id::text || $3::text)":"o.option_order";
    const values=randomQuestions?[examId,schoolId,String(randomSeed)]:[examId,schoolId];
    const result=await pool.query(`SELECT q.id,q.question_text,q.image_url,q.marks,q.question_order,q.explanation,COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY ${optionOrder}) FILTER(WHERE o.id IS NOT NULL),'[]') AS options FROM cbt_questions q JOIN cbt_exams e ON e.id=q.exam_id AND e.school_id=$2 LEFT JOIN cbt_question_options o ON o.question_id=q.id WHERE q.exam_id=$1 AND q.school_id=$2 GROUP BY q.id ORDER BY ${questionOrder}` ,values);return result.rows;
};

const getAttemptQuestions=async(attemptId,schoolId,randomizeOptions=false,client=pool)=>{
    const optionOrder=randomizeOptions?"md5(o.id::text || $3::text)":"o.option_order";
    const result=await client.query(`SELECT q.id,q.question_text,q.image_url,q.marks,q.question_order,q.explanation,aq.question_order AS attempt_question_order,COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY ${optionOrder}) FILTER(WHERE o.id IS NOT NULL),'[]') AS options FROM cbt_attempt_questions aq JOIN cbt_questions q ON q.id=aq.question_id AND q.school_id=$2 LEFT JOIN cbt_question_options o ON o.question_id=q.id WHERE aq.attempt_id=$1 AND aq.school_id=$2 GROUP BY q.id,aq.question_order ORDER BY aq.question_order`,randomizeOptions?[attemptId,schoolId,String(attemptId)]:[attemptId,schoolId]);
    return result.rows;
};

const createAttemptQuestionSet=async(attemptId,examId,schoolId,selectionCount,randomizeQuestions,client)=>{
    const limit=Number(selectionCount)||0;
    const order=limit>0?"md5(q.id::text || $4::text)":(randomizeQuestions?"md5(q.id::text || $4::text)":"q.question_order");
    const result=await client.query(`INSERT INTO cbt_attempt_questions(school_id,attempt_id,question_id,question_order) SELECT $1,$2,q.id,ROW_NUMBER() OVER (ORDER BY ${order})::int FROM cbt_questions q WHERE q.exam_id=$3 AND q.school_id=$1 ORDER BY ${order} ${limit>0?`LIMIT ${limit}`:""} RETURNING *`,[schoolId,attemptId,examId,String(attemptId)]);
    return result.rows;
};

const createQuestion=async(data,schoolId)=>{
    const client=await pool.connect();try{await client.query("BEGIN");const question=await client.query(`INSERT INTO cbt_questions(school_id,exam_id,question_text,image_url,marks,question_order,explanation) SELECT $1,$2,$3,$4,$5,$6,$7 WHERE EXISTS(SELECT 1 FROM cbt_exams WHERE id=$2 AND school_id=$1) RETURNING *`,[schoolId,data.exam_id,data.question_text,data.image_url||null,data.marks||1,data.question_order,data.explanation||null]);if(!question.rows[0])throw new Error("Exam not found for this school.");for(const option of data.options||[])await client.query(`INSERT INTO cbt_question_options(question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`,[question.rows[0].id,option.option_text,option.option_image_url||null,option.option_order,Boolean(option.is_correct)]);await syncExamTotalMarks(data.exam_id,schoolId,client);await client.query("COMMIT");return question.rows[0];}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
};

const updateQuestion=async(questionId,data,schoolId)=>{
    const client=await pool.connect();try{await client.query("BEGIN");const question=await client.query(`UPDATE cbt_questions q SET question_text=$3,image_url=$4,marks=$5,question_order=$6,explanation=$7,updated_at=CURRENT_TIMESTAMP FROM cbt_exams e WHERE q.id=$1 AND q.school_id=$2 AND e.id=q.exam_id AND e.school_id=$2 RETURNING q.*`,[questionId,schoolId,data.question_text,data.image_url||null,data.marks||1,data.question_order,data.explanation||null]);if(!question.rows[0]){await client.query("ROLLBACK");return null;}if(Array.isArray(data.options)){await client.query("DELETE FROM cbt_question_options WHERE question_id=$1",[questionId]);for(const option of data.options)await client.query(`INSERT INTO cbt_question_options(question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`,[questionId,option.option_text,option.option_image_url||null,option.option_order,Boolean(option.is_correct)]);}await syncExamTotalMarks(question.rows[0].exam_id,schoolId,client);await client.query("COMMIT");return question.rows[0];}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
};

const deleteQuestion=async(questionId,schoolId)=>{const client=await pool.connect();try{await client.query("BEGIN");const deleted=await client.query(`DELETE FROM cbt_questions q USING cbt_exams e WHERE q.id=$1 AND q.school_id=$2 AND e.id=q.exam_id AND e.school_id=$2 RETURNING q.id,q.exam_id`,[questionId,schoolId]);if(!deleted.rows[0]){await client.query("ROLLBACK");return null;}await syncExamTotalMarks(deleted.rows[0].exam_id,schoolId,client);await client.query("COMMIT");return{id:deleted.rows[0].id};}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}};

const startAttempt=async(examId,studentId,schoolId)=>{
    const client=await pool.connect();
    try{
        await client.query("BEGIN");
        const examResult=await client.query(`SELECT * FROM cbt_exams WHERE id=$1 AND school_id=$2 FOR UPDATE`,[examId,schoolId]);
        const exam=examResult.rows[0];
        if(!exam) throw new Error("Examination not found.");
        if(exam.status!=="published") throw new Error("This examination is not available.");
        const now=new Date();
        if(exam.starts_at&&new Date(exam.starts_at)>now) throw new Error("This examination has not started yet.");
        if(exam.ends_at&&new Date(exam.ends_at)<=now) throw new Error("This examination has ended.");

        const questionTotals=await getQuestionTotalMarks(examId,schoolId,client);
        if(questionTotals.questionCount===0||questionTotals.totalMarks<=0) throw new Error("This examination has no valid questions yet.");
        const selectionCount=Math.max(0,Number(exam.question_selection_count)||0);
        if(selectionCount>questionTotals.questionCount) throw new Error(`This examination requests ${selectionCount} questions, but only ${questionTotals.questionCount} question(s) are available.`);
        const student=await client.query("SELECT id,class_id,arm_id FROM students WHERE id=$1 AND school_id=$2 FOR UPDATE",[studentId,schoolId]);
        if(!student.rows[0]) throw new Error("Student not found for this school.");
        if(Number(student.rows[0].class_id)!==Number(exam.class_id)||(exam.arm_id&&Number(student.rows[0].arm_id)!==Number(exam.arm_id))) throw new Error("This examination is not assigned to your class.");

        const active=await client.query(`SELECT * FROM cbt_attempts WHERE exam_id=$1 AND student_id=$2 AND school_id=$3 AND status='in_progress' ORDER BY created_at DESC,id DESC LIMIT 1 FOR UPDATE`,[examId,studentId,schoolId]);
        if(active.rows[0]){
            const attempt=active.rows[0];
            const attemptExpiry=new Date(attempt.expires_at);
            if(attemptExpiry<=now){
                await client.query("COMMIT");
                return await submitAttempt(attempt.id,studentId,schoolId);
            }
            const selected=await client.query("SELECT COUNT(*)::int AS count FROM cbt_attempt_questions WHERE attempt_id=$1 AND school_id=$2",[attempt.id,schoolId]);
            if(Number(selected.rows[0]?.count||0)===0) await createAttemptQuestionSet(attempt.id,examId,schoolId,selectionCount,Boolean(exam.randomize_questions),client);
            await client.query("COMMIT");
            return attempt;
        }

        const count=await client.query("SELECT COUNT(*)::int AS count FROM cbt_attempts WHERE exam_id=$1 AND student_id=$2 AND school_id=$3",[examId,studentId,schoolId]);
        const attemptNumber=count.rows[0].count+1;
        if(attemptNumber>exam.max_attempts) throw new Error("Maximum attempts reached.");
        const result=await client.query(`INSERT INTO cbt_attempts(school_id,exam_id,student_id,attempt_number,expires_at) VALUES($1,$2,$3,$4,LEAST(CURRENT_TIMESTAMP+($5||' minutes')::interval,COALESCE($6::timestamptz,'infinity'::timestamptz))) RETURNING *`,[schoolId,examId,studentId,attemptNumber,exam.duration_minutes,exam.ends_at||null]);
        const attempt=result.rows[0];
        const selected=await createAttemptQuestionSet(attempt.id,examId,schoolId,selectionCount,Boolean(exam.randomize_questions),client);
        if(selected.length===0) throw new Error("This examination has no selectable questions.");
        const attemptTotalMarks=selected.reduce((sum,row)=>sum+Number(row.marks||0),0);
        await client.query("COMMIT");
        return attempt;
    }catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
};

const saveAnswer=async(attemptId,questionId,selectedOptionId,schoolId)=>{
    const result=await pool.query(`
        INSERT INTO cbt_answers(attempt_id,question_id,selected_option_id,answered_at)
        SELECT a.id,aq.question_id,$3,CURRENT_TIMESTAMP
        FROM cbt_attempts a
        JOIN cbt_attempt_questions aq ON aq.attempt_id=a.id AND aq.question_id=$2 AND aq.school_id=$4
        JOIN cbt_questions q ON q.id=aq.question_id AND q.exam_id=a.exam_id AND q.school_id=$4
        WHERE a.id=$1 AND a.school_id=$4 AND a.status='in_progress'
          AND ($3::bigint IS NULL OR EXISTS(
              SELECT 1 FROM cbt_question_options o
              WHERE o.id=$3 AND o.question_id=q.id
          ))
        ON CONFLICT(attempt_id,question_id) DO UPDATE SET selected_option_id=EXCLUDED.selected_option_id,answered_at=CURRENT_TIMESTAMP
        RETURNING *;
    `,[attemptId,questionId,selectedOptionId||null,schoolId]);
    return result.rows[0];
};

const submitAttempt=async(attemptId,studentId,schoolId)=>{const client=await pool.connect();try{await client.query("BEGIN");const attemptResult=await client.query(`SELECT * FROM cbt_attempts WHERE id=$1 AND student_id=$2 AND school_id=$3 FOR UPDATE`,[attemptId,studentId,schoolId]);const attempt=attemptResult.rows[0];if(!attempt){await client.query("ROLLBACK");return null;}if(attempt.status!=="in_progress"){await client.query("COMMIT");return attempt;}const scored=await client.query(`SELECT a.id AS answer_id,q.marks,CASE WHEN o.is_correct THEN true ELSE false END AS correct FROM cbt_answers a JOIN cbt_attempt_questions aq ON aq.attempt_id=a.attempt_id AND aq.question_id=a.question_id JOIN cbt_questions q ON q.id=a.question_id LEFT JOIN cbt_question_options o ON o.id=a.selected_option_id AND o.question_id=q.id WHERE a.attempt_id=$1`,[attemptId]);let score=0,correct=0,wrong=0;for(const answer of scored.rows){const isCorrect=Boolean(answer.correct);if(isCorrect){score+=Number(answer.marks)||0;correct+=1;}else wrong+=1;await client.query(`UPDATE cbt_answers SET is_correct=$1,marks_awarded=$2 WHERE id=$3`,[isCorrect,isCorrect?Number(answer.marks)||0:0,answer.answer_id]);}const qcount=await client.query(`SELECT COUNT(*)::int AS total FROM cbt_attempt_questions WHERE attempt_id=$1 AND school_id=$2`,[attemptId,schoolId]);const totalQuestions=Number(qcount.rows[0]?.total||0);const totalMarksResult=await client.query(`SELECT COALESCE(SUM(q.marks),0)::numeric AS total FROM cbt_attempt_questions aq JOIN cbt_questions q ON q.id=aq.question_id WHERE aq.attempt_id=$1 AND aq.school_id=$2`,[attemptId,schoolId]);const totalMarks=Number(totalMarksResult.rows[0]?.total||0);const unanswered=Math.max(totalQuestions-correct-wrong,0);const finalScore=Number(score.toFixed(2));const percentage=totalMarks>0?Number(((finalScore/totalMarks)*100).toFixed(2)):0;const status=attempt.expires_at&&new Date(attempt.expires_at)<=new Date()?"expired":"submitted";const updated=await client.query(`UPDATE cbt_attempts SET status=$4,submitted_at=CURRENT_TIMESTAMP,score=$5,percentage=$6,correct_answers=$7,wrong_answers=$8,unanswered=$9,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND student_id=$2 AND school_id=$3 AND status='in_progress' RETURNING *`,[attemptId,studentId,schoolId,status,finalScore,percentage,correct,wrong,unanswered]);await client.query("COMMIT");return updated.rows[0]||attempt;}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}};

const getStudentAttempts=async(studentId,schoolId)=>{const result=await pool.query(`SELECT a.*,e.title,e.total_marks,e.pass_mark,e.question_selection_count,s.subject_name FROM cbt_attempts a JOIN cbt_exams e ON e.id=a.exam_id AND e.school_id=a.school_id JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id WHERE a.student_id=$1 AND a.school_id=$2 ORDER BY a.created_at DESC`,[studentId,schoolId]);return result.rows;};
const getAttemptForStudent=async(attemptId,studentId,schoolId)=>{const result=await pool.query(`SELECT a.* FROM cbt_attempts a WHERE a.id=$1 AND a.student_id=$2 AND a.school_id=$3`,[attemptId,studentId,schoolId]);return result.rows[0];};

module.exports={getExams,getAvailableStudentExams,getExamById,getQuestions,getAttemptQuestions,getQuestionTotalMarks,createExam,updateExam,deleteExam,createQuestion,updateQuestion,deleteQuestion,startAttempt,saveAnswer,submitAttempt,getStudentAttempts,getAttemptForStudent};