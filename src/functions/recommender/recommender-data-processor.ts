import * as fs from 'fs';
import * as path from 'path';

const MENTORS_TO_SUBFIELDS_CSV_LOCATION = "../../../data/mentor_to_subfields.csv"
const QUESTIONS_TO_TOPICS_AND_SUBFIELDS_CSV_LOCATION = "../../../data/question_to_subfields_and_topics.csv"
const ANSWERS_TO_MENTOR_AND_QUESTION_CSV_LOCATION = "../../../data/answers_to_mentor_questions.csv"

import { MentorToSubfield, QuestionToTopicsAndSubfields, MentorAnswersToQuestionIds } from "./types";

export class RecommenderDataProcessor {
    private static instance: RecommenderDataProcessor;
    
    public mentors: MentorToSubfield[] = [];
    public questions: QuestionToTopicsAndSubfields[] = [];
    public answers: MentorAnswersToQuestionIds[] = [];
    
    private constructor() {
        this.loadAllData();
    }
    
    public static getInstance(): RecommenderDataProcessor {
        if (!RecommenderDataProcessor.instance) {
            RecommenderDataProcessor.instance = new RecommenderDataProcessor();
        }
        return RecommenderDataProcessor.instance;
    }
    
    private loadAllData(): void {
        this.loadMentorsData();
        this.loadQuestionsData();
        this.loadAnswersData();
    }
    
    private loadMentorsData(): void {
        try {
            const filePath = path.join(__dirname, '..', MENTORS_TO_SUBFIELDS_CSV_LOCATION);
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const lines = csvContent.trim().split('\n');
            
            // Skip header row
            for (let i = 1; i < lines.length; i++) {
                const [mentorId, mentorName, subfieldsStr, degree] = lines[i].split(',');
                
                // split subfields (comma-separated values within quotes)
                const subfields = subfieldsStr.replace(/"/g, '').split(',').map(s => s.trim());
                
                this.mentors.push({
                    mentorId: mentorId.trim(),
                    mentorName: mentorName.trim(),
                    subfields,
                    degree: degree.trim()
                });
            }
            
        } catch (error) {
            console.error('Error loading mentors data:', error);
            throw error;
        }
    }
    
    private loadQuestionsData(): void {
        try {
            const filePath = path.join(__dirname, '..', QUESTIONS_TO_TOPICS_AND_SUBFIELDS_CSV_LOCATION);
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const lines = csvContent.trim().split('\n');
            
            for (let i = 1; i < lines.length; i++) {
                const [questionId, questionText, topicIdsStr, topicNamesStr, subfieldsStr, degree] = lines[i].split(',');
                
                // split topicIds, topicNames, subfields (comma-separated values within quotes)
                const topicIds = topicIdsStr ? topicIdsStr.replace(/"/g, '').split(',').map(s => s.trim()).filter(s => s) : [];
                const topicNames = topicNamesStr ? topicNamesStr.replace(/"/g, '').split(',').map(s => s.trim()).filter(s => s) : [];
                const subfields = subfieldsStr ? subfieldsStr.replace(/"/g, '').split(',').map(s => s.trim()).filter(s => s) : [];
                
                this.questions.push({
                    questionId: questionId.trim(),
                    questionText: questionText.trim(),
                    topicIds,
                    topicNames,
                    subfields,
                    degree: degree.trim()
                });
            }
            
        } catch (error) {
            console.error('Error loading questions data:', error);
            throw error;
        }
    }
    
    private loadAnswersData(): void {
        try {
            const filePath = path.join(__dirname, '..', ANSWERS_TO_MENTOR_AND_QUESTION_CSV_LOCATION);
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const lines = csvContent.trim().split('\n');
            
            for (let i = 1; i < lines.length; i++) {
                const [answerId, mentorId, questionId] = lines[i].split(',');
                
                this.answers.push({
                    answerId: answerId.trim(),
                    mentorId: mentorId.trim(),
                    questionId: questionId.trim()
                });
            }
            
        } catch (error) {
            console.error('Error loading answers data:', error);
            throw error;
        }
    }
    
    public getMentorById(mentorId: string): MentorToSubfield | undefined {
        return this.mentors.find(mentor => mentor.mentorId === mentorId);
    }
    
    public getQuestionById(questionId: string): QuestionToTopicsAndSubfields | undefined {
        return this.questions.find(question => question.questionId === questionId);
    }
    
    public getAnswersByMentorId(mentorId: string): MentorAnswersToQuestionIds[] {
        return this.answers.filter(answer => answer.mentorId === mentorId);
    }
    
    public getAnswersByQuestionId(questionId: string): MentorAnswersToQuestionIds[] {
        return this.answers.filter(answer => answer.questionId === questionId);
    }

    public getQuestionIdByAnswerId(answerId: string): string | undefined {
        return this.answers.find(answer => answer.answerId === answerId)?.questionId;
    }
}

