const pdfParse = require("pdf-parse");

const MAX_QUESTIONS = 500;

const clean = (value) => String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeOptionText = (value) => clean(value)
    .replace(/^[-•]\s*/, "")
    .trim();


const parseLeadingSharedMaterial = (prefix) => {
    const marker = /(?:^|\n)\s*(Shared Material|Comprehension Passage|Passage|Instruction|Diagram|Table|Graph)\s*:\s*([^\n]*)/i;
    const match = marker.exec(prefix);
    if (!match) return null;
    const label = match[1].toLowerCase();
    const header = String(match[2] || "").trim();
    let materialType = label.includes("passage") ? "passage" : label;
    let title = header;
    if (label === "shared material") {
        const typed = header.match(/^(passage|comprehension passage|instruction|diagram|image|table|graph)\s*(?:[-–|:]\s*)?(.*)$/i);
        if (typed) {
            const type = typed[1].toLowerCase();
            materialType = type.includes("passage") ? "passage" : type;
            title = typed[2].trim();
        } else {
            materialType = "mixed";
        }
    }
    if (!["passage","instruction","diagram","table","graph","image","mixed"].includes(materialType)) materialType = "mixed";
    const bodyStart = match.index + match[0].length;
    let materialText = prefix.slice(bodyStart).trim();
    materialText = materialText.replace(/(?:^|\n)\s*End Shared Material\s*(?:\n|$)/i, "\n").trim();
    if (!materialText) return null;
    return {
        group_key: "pdf-shared-1",
        group_title: title || (materialType === "passage" ? "PDF comprehension passage" : "PDF shared material"),
        group_material_type: materialType,
        group_instructions: "",
        group_material_text: materialText,
        group_image_url: ""
    };
};

const parseQuestionBlock = (number, rawBlock) => {
    const block = clean(rawBlock);
    const subjectMatch = block.match(/(?:^|\n)\s*Subject\s*:\s*([^\n]+)\s*(?=\n|$)/i);
    const subject_name = subjectMatch ? subjectMatch[1].trim() : "";
    const withoutSubject = subjectMatch ? block.replace(subjectMatch[0], "\n").trim() : block;
    const answerMatch = withoutSubject.match(/(?:^|\n)\s*(?:Answer|Correct Answer)\s*:\s*\(?([A-Da-d])\)?\s*(?:\n|$)/i);
    if (!answerMatch) {
        return {
            number: Number(number),
            subject_name,
            question_text: "",
            options: [],
            correct_answer: null,
            explanation: "",
            valid: false,
            warning: "Correct answer is missing. Use: Answer: A"
        };
    }

    const answer = answerMatch[1].toUpperCase();
    const beforeAnswer = withoutSubject.slice(0, answerMatch.index).trim();
    const afterAnswer = withoutSubject.slice(answerMatch.index + answerMatch[0].length).trim();

    const optionMatches = [...beforeAnswer.matchAll(/(?:^|\n)\s*([A-Da-d])[.)]\s+([\s\S]*?)(?=\n\s*[A-Da-d][.)]\s+|$)/g)];
    const options = optionMatches.map((match) => ({
        option_order: match[1].toUpperCase().charCodeAt(0) - 64,
        option_text: normalizeOptionText(match[2]),
        is_correct: match[1].toUpperCase() === answer,
        option_image_url: ""
    }));

    const questionText = beforeAnswer
        .replace(/(?:^|\n)\s*[A-Da-d][.)]\s+[\s\S]*$/m, (match, offset) => offset === 0 ? "" : match)
        .trim();

    const firstOptionIndex = beforeAnswer.search(/(?:^|\n)\s*[A-Da-d][.)]\s+/);
    const finalQuestionText = firstOptionIndex >= 0
        ? beforeAnswer.slice(0, firstOptionIndex).trim()
        : questionText;

    const explanation = afterAnswer
        .replace(/^Explanation\s*:\s*/i, "")
        .trim();

    const valid = Boolean(finalQuestionText) && options.length === 4 && options.every((option) => option.option_text) && options.filter((option) => option.is_correct).length === 1;

    return {
        number: Number(number),
        subject_name,
        question_text: finalQuestionText,
        image_url: "",
        marks: 1,
        explanation,
        is_active: true,
        options,
        correct_answer: answer,
        valid,
        warning: valid ? null : "Question must contain question text, four non-empty options (A-D), and exactly one valid answer."
    };
};

exports.parsePdf = async (buffer) => {
    if (!Buffer.isBuffer(buffer) || !buffer.length) {
        const error = new Error("The uploaded PDF is empty.");
        error.statusCode = 400;
        throw error;
    }

    let parsed;
    try {
        parsed = await pdfParse(buffer);
    } catch (error) {
        const parseError = new Error("Unable to read this PDF. Please upload a text-based PDF using the EduCore CBT format.");
        parseError.statusCode = 400;
        throw parseError;
    }

    const text = clean(parsed.text);
    if (!text) {
        const error = new Error("No readable text was found in the PDF. Scanned/image-only PDFs are not supported by this importer yet.");
        error.statusCode = 400;
        throw error;
    }

    const matches = [...text.matchAll(/(?:^|\n)\s*(\d+)[.)]\s+([\s\S]*?)(?=(?:\n\s*\d+[.)]\s+)|$)/g)];
    if (!matches.length) {
        const error = new Error("No numbered questions were found. Use question numbers such as 1. or 1)");
        error.statusCode = 400;
        throw error;
    }

    const firstQuestionIndex = matches[0].index;
    const sharedMaterial = parseLeadingSharedMaterial(text.slice(0, firstQuestionIndex));
    const questions = matches.slice(0, MAX_QUESTIONS).map((match) => ({
        ...parseQuestionBlock(match[1], match[2]),
        ...(sharedMaterial ? { ...sharedMaterial } : {})
    }));
    const truncated = matches.length > MAX_QUESTIONS;
    const validCount = questions.filter((question) => question.valid).length;

    return {
        questions,
        total_found: matches.length,
        returned: questions.length,
        valid_count: validCount,
        invalid_count: questions.length - validCount,
        truncated,
        pages: parsed.numpages || null
    };
};
