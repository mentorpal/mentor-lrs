import {
  AnswerPlaybackData,
  FieldScore,
  AnswerPlaybackStartedStatement,
  BaseMentorpalStatement,
  answerPlaybackStartedVerb,
} from "./types";
import { PAGE_FIELD_NAMES } from "./recommender-data-processor";

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

export function getAllPageFieldNames(
  matrix: number[][],
  fieldNames: string[]
): FieldScore[] {
  if (matrix.length === 0) {
    return PAGE_FIELD_NAMES.map((field) => ({ field, score: 0 }));
  }

  return PAGE_FIELD_NAMES.map((pageField) => {
    const fieldIndex = fieldNames.indexOf(pageField);

    if (fieldIndex === -1) {
      return { field: pageField, score: 0 };
    }

    // Calculate average score for this page field
    let sum = 0;
    for (let answerIndex = 0; answerIndex < matrix.length; answerIndex++) {
      sum += matrix[answerIndex][fieldIndex];
    }
    const averageScore = sum / matrix.length;

    return { field: pageField, score: averageScore };
  });
}

/**
 * Processes the matrix to get top-N fields by averaging scores across all answers
 * Excludes PAGE_FIELD_NAMES from the results
 *
 * @param matrix - The answer x field matrix
 * @param fieldNames - Ordered list of field names corresponding to matrix columns
 * @param topN - Number of top results to return (default: 5)
 * @returns Array of top-N field scores sorted by score descending
 */
export function getTopNFields(
  matrix: number[][],
  fieldNames: string[],
  topN = 5
): FieldScore[] {
  if (matrix.length === 0) {
    return [];
  }

  const numFields = fieldNames.length;
  const fieldScores: FieldScore[] = [];
  const pageFieldSet = new Set(PAGE_FIELD_NAMES);

  // Calculate average score for each field across all answers
  for (let fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
    const fieldName = fieldNames[fieldIndex];

    // Skip page fields
    if (pageFieldSet.has(fieldName)) {
      continue;
    }

    let sum = 0;

    for (let answerIndex = 0; answerIndex < matrix.length; answerIndex++) {
      sum += matrix[answerIndex][fieldIndex];
    }

    const averageScore = sum / matrix.length;

    fieldScores.push({
      field: fieldName,
      score: averageScore,
    });
  }

  // descending order
  fieldScores.sort((a, b) => b.score - a.score);

  return fieldScores.slice(0, topN);
}
