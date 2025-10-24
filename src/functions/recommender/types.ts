export const sessionIdExtensionKey =
  "tag:adlnet.gov,2013:expapi:0.9:extensions:sessionId";
export const answerPlaybackStartedVerb =
  "https://mentorpal.org/xapi/verb/answer-playback-started";

export interface BaseMentorpalStatement {
  actor: {
    objectType: "Agent";
    mbox: string;
    name: string;
  };
  context: {
    extensions: {
      [sessionIdExtensionKey]: string;
    };
  };
}

export interface AnswerPlaybackStartedStatement extends BaseMentorpalStatement {
  result: {
    extensions: {
      [answerPlaybackStartedVerb]: {
        answerId: string;
        answerQuestionId: string;
        mentorCur: string;
        timestampAnswered: number; // EPOCH timestamp
        answerDuration: number; // in seconds
        answerConfidence: number; // 0-1 float
      };
    };
  };
}

export interface MentorToSubfield {
  mentorId: string;
  mentorName: string;
  subfields: string[];
  degree: string;
}

export interface QuestionToTopicsAndSubfields {
  questionId: string;
  questionText: string;
  topicIds: string[];
  topicNames: string[];
  subfields: string[];
  degree: string;
}

export interface MentorAnswersToQuestionIds {
  answerId: string;
  mentorId: string;
  questionId: string;
}

export interface AnswerPlaybackData {
  mentorId: string;
  questionId: string;
  answerId: string;
  subfields: string[];
  topics: string[];
  startTimestamp: number;
  duration: number;
  confidence: number;
}

export interface FieldScore {
  field: string;
  score: number;
}
