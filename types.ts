
export interface Session {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  presenterName: string;
  presenterEmail: string;
  presenterPhone?: string; // Optional telephone
  location: string;
  materialUrl?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional telephone
}

export type FeedbackCategory = 'material' | 'presenter' | 'engagement' | 'outcomes' | 'logistics' | 'overall';

export interface QuestionFeedback {
  category: FeedbackCategory;
  questionId: number;
  score: number; // For non-rating questions, this maps to selected index
  textValue?: string; // For the technical depth or recommendation text
}

export interface Feedback {
  id: string;
  sessionId: string;
  participantId: string;
  scores: QuestionFeedback[]; 
  comments: string;
  submittedAt: string;
}

export interface CategoryInsight {
  category: string;
  score: string;
  analysis: string;
  detailedRecommendation: string;
}

export interface AIInsight {
  sessionId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallSummary: string;
  categoryAnalysis: CategoryInsight[];
  futureImprovements: {
    material: string;
    delivery: string;
    engagement: string;
  };
}

export type ViewState = 'dashboard' | 'sessions' | 'participants' | 'feedback-entry' | 'reports';

export const EVALUATION_QUESTIONS = {
  material: [
    "The training material was well-structured and organized.",
    "The content was relevant to my job / role.",
    "The material matched the stated learning objectives.",
    "The technical depth of the material was appropriate." // Special: Basic, Appropriate, Advanced
  ],
  presenter: [
    "The resource person demonstrated strong subject knowledge.",
    "Concepts were explained clearly and effectively.",
    "The presenter encouraged interaction and questions.",
    "Time was managed effectively during the session."
  ],
  engagement: [
    "The session was engaging and maintained my interest.",
    "Teaching methods (examples, discussion, activities) were effective.",
    "The pace of the session was appropriate."
  ],
  outcomes: [
    "I gained new knowledge or skills from this session.",
    "I can apply what I learned in my work.",
    "The session met my expectations."
  ],
  logistics: [
    "Session timing and duration were appropriate.",
    "Technical and organizational arrangements were satisfactory."
  ],
  overall: [
    "Overall rating of this session",
    "Would you recommend this session to others?" // Special: Yes, No, Maybe
  ]
};
