export interface SummaryData {
  narrator_intro: string;
  background: string;
  core_concepts: string;
  one_sentence: string;
}

export interface Keynote {
  title: string;
  detail: string;
  importance: number; // 1 to 3
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LectureRPGData {
  title: string;
  summary: SummaryData;
  keynotes: Keynote[];
  quiz: QuizQuestion[];
}

export interface UserProfile {
  uid: string;
  email: string;
  level: number;
  xp: number;
  totalQuizzes: number;
  correctAnswers: number;
  winRate: number;
  updatedAt?: string;
  lastCheckIn?: string;
  selectedAvatar?: string;
  selectedBorder?: string;
}

export interface SaveSlot {
  id: string;
  user_id: string; // database schema compliant
  title: string;
  created_at: string; // database schema compliant
  text_summary: string; // database schema compliant
  keynotes_json: string; // database schema compliant
  quiz_json: string; // database schema compliant
  win_rate: number; // database schema compliant
}

export interface WrongQuiz {
  id: string;
  user_id: string;
  save_id?: string;
  save_title?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  created_at: string;
}
