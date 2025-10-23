export interface BaseMentorpalStatement{
    actor: {
        objectType: "Agent",
        mbox: string,
        name: string
    },
    context: {
        extensions: {
            ["tag:adlnet.gov,2013:expapi:0.9:extensions:sessionId"]: string
        }
    },
}

export interface AnswerPlaybackStartedStatement extends BaseMentorpalStatement{
    result: {
        extensions: {
            ["https://mentorpal.org/xapi/verb/answer-playback-started"]: {
                answerId: string,
                mentorCur: string,
                timestampAnswered: number, // EPOCH timestamp
                answerDuration: number, // in seconds
                answerConfidence: number, // 0-1 float
            }
        }
    }
}

export function isAnswerPlaybackStartedStatement(
    statement: BaseMentorpalStatement | AnswerPlaybackStartedStatement
  ): statement is AnswerPlaybackStartedStatement {
    return (
      typeof statement === "object" &&
      statement !== null &&
      !!(
        (statement as AnswerPlaybackStartedStatement).result?.extensions?.[
          "https://mentorpal.org/xapi/verb/answer-playback-started"
        ]
      )
    );
  }

export interface MentorToSubfield{
    mentorId: string,
    mentorName: string,
    subfields: string[],
    degree: string
}

export interface QuestionToTopicsAndSubfields{
    questionId: string,
    questionText: string,
    topicIds: string[],
    topicNames: string[],
    subfields: string[],
    degree: string
}

export interface MentorAnswersToQuestionIds{
    answerId: string,
    mentorId: string,
    questionId: string
}

export interface AnswerPlaybackData{
    mentorId: string,
    questionId: string,
    answerId: string,
    subfields: string[],
    topics: string[],
    startTimestamp: number,
    duration: number,
    confidence: number
}

export interface FieldScore {
    field: string;
    score: number;
}