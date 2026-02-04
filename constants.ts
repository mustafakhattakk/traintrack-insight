
import { Session, Participant, Feedback, QuestionFeedback } from './types';

const createMockScores = (val: number): QuestionFeedback[] => {
  const scores: QuestionFeedback[] = [];
  // Sections B, C, D, E are standard 1-5 ratings
  const standardCats: ('presenter' | 'engagement' | 'outcomes' | 'logistics')[] = ['presenter', 'engagement', 'outcomes', 'logistics'];
  standardCats.forEach(cat => {
    const qCount = cat === 'logistics' ? 2 : (cat === 'presenter' ? 4 : 3);
    for (let i = 0; i < qCount; i++) scores.push({ category: cat, questionId: i, score: val });
  });

  // Section A: 3 ratings + 1 special
  for (let i = 0; i < 3; i++) scores.push({ category: 'material', questionId: i, score: val });
  scores.push({ category: 'material', questionId: 3, score: 2, textValue: 'Appropriate' });

  // Section F: 1 rating + 1 special
  scores.push({ category: 'overall', questionId: 0, score: val });
  scores.push({ category: 'overall', questionId: 1, score: 1, textValue: 'Yes' });

  return scores;
};

export const MOCK_SESSIONS: Session[] = [
  { id: 's1', title: 'Opening Keynote: Strategy 2025', date: '2024-11-12', startTime: '09:00', endTime: '10:00', presenterName: 'Dr. Sarah Miller', presenterEmail: 's.miller@train.io', presenterPhone: '+1234567890', location: 'Grand Ballroom A' },
  { id: 's2', title: 'Advanced Workflow Optimization', date: '2024-11-12', startTime: '10:30', endTime: '12:00', presenterName: 'Johnathan Wick', presenterEmail: 'j.wick@train.io', presenterPhone: '+1987654321', location: 'Tech Hub Room 4' },
  { id: 's3', title: 'Leadership in Crisis Workshop', date: '2024-11-13', startTime: '09:00', endTime: '11:00', presenterName: 'Marcus Aurelius', presenterEmail: 'm.aurelius@train.io', presenterPhone: '+1122334455', location: 'Executive Suite 2' }
];

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'James Gordon', email: 'gordon@example.com', phone: '+1000111222' },
  { id: 'p2', name: 'Harvey Dent', email: 'dent@example.com', phone: '+1000333444' },
  { id: 'p3', name: 'Selina Kyle', email: 'kyle@example.com', phone: '+1000555666' }
];

export const MOCK_FEEDBACK: Feedback[] = [
  { id: 'f1', sessionId: 's1', participantId: 'p1', scores: createMockScores(5), comments: 'Excellent start to the training. Very clear vision.', submittedAt: '2024-11-12T10:15' },
  { id: 'f2', sessionId: 's2', participantId: 'p2', scores: createMockScores(4), comments: 'Technical aspects were handled well, pace was a bit fast.', submittedAt: '2024-11-12T12:30' }
];
