const pdfParse = require("pdf-parse");

const MAX_QUESTIONS = 500;

const clean = (value) => String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeOptionText = (value) => clean(value).replace(/^[-•]\s*/, "").trim();

const parseLeadingSharedMaterial = (prefix) => {
    const marker = /(?:^|\n)\s*(Shared Material|Comprehension Passage|Passage|Instruction|Diagram|Image|Figure|Table|Graph|Chart)\s*:\s*([^\n]*)/i;
    const match = marker.exec(prefix);
    if (match) {
        const label = match[1].toLowerCase();
        const header = String(match[2] || "").trim();
        let materialType = label.includes("passage") ? "passage" : (label === "figure" ? "image" : (label === "chart" ? "graph" : label));
        let title = header;
        if (label === "shared material") {
            const typed = header.match(/^(passage|comprehension passage|instruction|diagram|image|figure|table|graph|chart)\s*(?:[-–|:]\s*)?(.*)$/i);
            if (typed) {
                const type = typed[1].toLowerCase();
                materialType = type.includes("passage") ? "passage" : (type === "figure" ? "image" : (type === "chart" ? "graph" : type));
                title = typed[2].trim();
            } else materialType = "mixed";
        }
        if (!["passage","instruction","diagram","table","graph","image","mixed"].includes(materialType)) materialType = "mixed";
        const materialText = prefix.slice(match.index + match[0].length)
            .replace(/(?:^|\n)\s*End Shared Material\s*(?:\n|$)/i, "\n").trim();
        if (!materialText) return null;
        return { title: title || (materialType === "passage" ? "Comprehension passage" : "Shared material"),
            material_type: materialType, instructions: "", material_text: materialText, start: 1, end: null };
    }

    // Recognise natural-language shared material prompts, not only formal labels.
    const prefixLines = prefix.split("\n");
    const naturalIndex = prefixLines.findIndex((line) => /(?:read\s+the\s+passage|(?:study|use|refer\s+to|observe)\s+(?:(?:the|a)\s+)?(?:following\s+)?(?:diagram|figure|image|table|graph|chart))/i.test(line));
    if (naturalIndex < 0) return null;
    const naturalInstruction = String(prefixLines[naturalIndex] || "").trim();
    const naturalRange = naturalInstruction.match(/questions?\s*(\d+)\s*(?:to|-|–)\s*(\d+)/i);
    const lowerInstruction = naturalInstruction.toLowerCase();
    const materialType = /passage/.test(lowerInstruction) ? "passage" : /table/.test(lowerInstruction) ? "table" : /graph|chart/.test(lowerInstruction) ? "graph" : /diagram/.test(lowerInstruction) ? "diagram" : "image";
    const materialText = prefixLines.slice(naturalIndex + 1).join("\n").trim();
    if (!materialText) return null;
    return {
        title: materialType === "passage" ? "Comprehension passage" : (materialType[0].toUpperCase() + materialType.slice(1) + " for questions " + (naturalRange ? naturalRange[1] + "–" + naturalRange[2] : "that follow")),
        material_type: materialType, instructions: naturalInstruction, material_text: materialText,
        start: naturalRange ? Number(naturalRange[1]) : 1,
        end: naturalRange ? Number(naturalRange[2]) : null
    };
};

const parseQuestionBlock = (number, rawBlock) => {
    const block = clean(rawBlock);
    const subjectMatch = block.match(/(?:^|\n)\s*Subject\s*:\s*([^\n]+)\s*(?=\n|$)/i);
    const subject_name = subjectMatch ? subjectMatch[1].trim() : "";
    const withoutSubject = subjectMatch ? block.replace(subjectMatch[0], "\n").trim() : block;
    const answerMatch = withoutSubject.match(/(?:^|\n)\s*(?:Answer|Correct Answer)\s*:\s*\(?([A-Da-d])\)?\s*(?:\n|$)/i);
    if (!answerMatch) return {
        number: Number(number), subject_name, question_text: "", options: [], correct_answer: null,
        explanation: "", trailing_text: "", valid: false,
        warning: "Correct answer is missing. Use: Answer: A"
    };

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
    const firstOptionIndex = beforeAnswer.search(/(?:^|\n)\s*[A-Da-d][.)]\s+/);
    const finalQuestionText = firstOptionIndex >= 0 ? beforeAnswer.slice(0, firstOptionIndex).trim() : beforeAnswer.trim();
    const isExplanation = /^Explanation\s*:/i.test(afterAnswer);
    const explanation = isExplanation ? afterAnswer.replace(/^Explanation\s*:\s*/i, "").trim() : "";
    const trailingText = isExplanation ? "" : afterAnswer;
    const valid = Boolean(finalQuestionText) && options.length === 4 &&
        options.every((option) => option.option_text) &&
        options.filter((option) => option.is_correct).length === 1;

    return {
        number: Number(number), subject_name, question_text: finalQuestionText, image_url: "",
        marks: 1, explanation, trailing_text: trailingText, is_active: true, options,
        correct_answer: answer, valid,
        warning: valid ? null : "Question must contain question text, four non-empty options (A-D), and exactly one valid answer."
    };
};

const makeGroup = (start, end, material, suffix) => ({
    group_key: "pdf-group-" + start + "-" + (end || "end") + suffix,
    group_title: material.title || ("Shared material for questions " + start + (end ? "–" + end : " onward")),
    group_material_type: material.material_type || "instruction",
    group_instructions: material.instructions || "",
    group_material_text: material.material_text || "",
    group_image_url: ""
});

exports.parsePdf = async (buffer) => {
    if (!Buffer.isBuffer(buffer) || !buffer.length) {
        const error = new Error("The uploaded PDF is empty."); error.statusCode = 400; throw error;
    }
    let parsed;
    try { parsed = await pdfParse(buffer); }
    catch (error) {
        const parseError = new Error("Unable to read this PDF. Please upload a text-based PDF using the EduProw CBT format.");
        parseError.statusCode = 400; throw parseError;
    }
    const text = clean(parsed.text);
    if (!text) {
        const error = new Error("No readable text was found in the PDF. Scanned/image-only PDFs are not supported by this importer yet.");
        error.statusCode = 400; throw error;
    }

    const matches = [...text.matchAll(/(?:^|\n)\s*(\d+)[.)]\s+([\s\S]*?)(?=(?:\n\s*\d+[.)]\s+)|$)/g)];
    if (!matches.length) {
        const error = new Error("No numbered questions were found. Use question numbers such as 1. or 1)");
        error.statusCode = 400; throw error;
    }

    const prefix = text.slice(0, matches[0].index);
    const leadingMaterial = parseLeadingSharedMaterial(prefix);
    const parsedQuestions = matches.slice(0, MAX_QUESTIONS).map((match) => parseQuestionBlock(match[1], match[2]));
    const boundaries = [];

    if (leadingMaterial) {
        boundaries.push({
            start: Math.max(1, leadingMaterial.start || 1),
            end: leadingMaterial.end && leadingMaterial.end >= leadingMaterial.start ? leadingMaterial.end : null,
            material: leadingMaterial,
            suffix: "-passage"
        });
    }

    // An instruction found after one answer belongs to the following question
    // and remains active until the next section instruction is encountered.
    for (let index = 1; index < parsedQuestions.length; index += 1) {
        const instruction = String(parsedQuestions[index - 1].trailing_text || "").trim();
        if (!instruction) continue;
        const questionNumber = Number(parsedQuestions[index].number);
        const range = instruction.match(/questions?\s*(\d+)\s*(?:to|-|–)\s*(\d+)/i);
        boundaries.push({
            start: range ? Number(range[1]) : questionNumber,
            end: range ? Number(range[2]) : null,
            material: {
                title: "Instructions for questions " + (range ? range[1] + "–" + range[2] : questionNumber),
                material_type: "instruction", instructions: "", material_text: instruction
            },
            suffix: "-instruction-" + questionNumber
        });
    }

    const questions = parsedQuestions.map((question) => {
        const number = Number(question.number);
        const applicable = boundaries.filter((group) =>
            number >= group.start && (group.end === null || number <= group.end)
        ).slice(-1)[0];
        const cleanQuestion = { ...question };
        delete cleanQuestion.trailing_text;
        return { ...cleanQuestion, ...(applicable ? makeGroup(applicable.start, applicable.end, applicable.material, applicable.suffix) : {}) };
    });

    return {
        questions, total_found: matches.length, returned: questions.length,
        valid_count: questions.filter((question) => question.valid).length,
        invalid_count: questions.length - questions.filter((question) => question.valid).length,
        truncated: matches.length > MAX_QUESTIONS, pages: parsed.numpages || null
    };
};
