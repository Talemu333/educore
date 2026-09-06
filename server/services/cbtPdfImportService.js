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

const parseQuestionBlock = (number, rawBlock) => {
    const block = clean(rawBlock);
    const answerMatch = block.match(/(?:^|\n)\s*(?:Answer|Correct Answer)\s*:\s*\(?([A-Da-d])\)?\s*(?:\n|$)/i);
    if (!answerMatch) {
        return {
            number: Number(number),
            question_text: "",
            options: [],
            correct_answer: null,
            explanation: "",
            valid: false,
            warning: "Correct answer is missing. Use: Answer: A"
        };
    }

    const answer = answerMatch[1].toUpperCase();
    const beforeAnswer = block.slice(0, answerMatch.index).trim();
    const afterAnswer = block.slice(answerMatch.index + answerMatch[0].length).trim();

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

    const questions = matches.slice(0, MAX_QUESTIONS).map((match) => parseQuestionBlock(match[1], match[2]));
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
