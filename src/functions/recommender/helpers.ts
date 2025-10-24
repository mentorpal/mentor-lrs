import {
  AnswerPlaybackData,
  FieldScore,
  AnswerPlaybackStartedStatement,
  BaseMentorpalStatement,
  answerPlaybackStartedVerb,
} from "./types";

export function isAnswerPlaybackStartedStatement(
  statement: BaseMentorpalStatement | AnswerPlaybackStartedStatement
): statement is AnswerPlaybackStartedStatement {
  return (
    typeof statement === "object" &&
    statement !== null &&
    !!(statement as AnswerPlaybackStartedStatement).result?.extensions?.[
      answerPlaybackStartedVerb
    ]
  );
}

/**
 * Builds a matrix from answer playback data where each row represents an answer
 * and columns represent subfields, topics, and degrees (1 if present, 0 if not)
 * @returns Object containing the matrix and ordered list of field names
 */
export function buildAnswerFieldMatrix(
  answerPlaybackData: AnswerPlaybackData[]
): {
  matrix: number[][];
  fieldNames: string[];
} {
  // Collect all unique fields (subfields, topics, and degrees)
  const allFieldsSet = new Set<string>();

  answerPlaybackData.forEach((answer) => {
    answer.subfields.forEach((subfield) => allFieldsSet.add(subfield));
    answer.topics.forEach((topic) => allFieldsSet.add(topic));
  });

  const fieldNames = Array.from(allFieldsSet).sort();

  const matrix: number[][] = answerPlaybackData.map((answer) => {
    const row = new Array(fieldNames.length).fill(0);
    const answerFields = new Set([...answer.subfields, ...answer.topics]);
    fieldNames.forEach((field, index) => {
      if (answerFields.has(field)) {
        row[index] = 1;
      }
    });
    return row;
  });

  return { matrix, fieldNames };
}

/**
 * Processes the matrix to get top-N fields by averaging scores across all answers
 *
 * @param matrix - The answer x field matrix
 * @param fieldNames - Ordered list of field names corresponding to matrix columns
 * @param topN - Number of top results to return (default: 5)
 * @returns Array of top-N field scores sorted by score descending
 */
export function getTopNFields(
  matrix: number[][],
  fieldNames: string[],
  topN: number = 5
): FieldScore[] {
  if (matrix.length === 0) {
    return [];
  }

  const numFields = fieldNames.length;
  const fieldScores: FieldScore[] = [];

  // Calculate average score for each field across all answers
  for (let fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
    let sum = 0;

    for (let answerIndex = 0; answerIndex < matrix.length; answerIndex++) {
      sum += matrix[answerIndex][fieldIndex];
    }

    const averageScore = sum / matrix.length;

    fieldScores.push({
      field: fieldNames[fieldIndex],
      score: averageScore,
    });
  }

  // descending order
  fieldScores.sort((a, b) => b.score - a.score);

  return fieldScores.slice(0, topN);
}
