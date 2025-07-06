// 개별 질문과 답변의 구조
export interface QA {
    question: string;
    options?: string[]; // 객관식 보기 (주관식은 없음)
    answer: string; // 정답
    selectedOption?: string; // 사용자가 선택한 답
    isCorrect?: boolean; // 정답 여부
}

// 퀴즈 카테고리 구조
export type QuizItem = { question: string; answer: string };

export type QuizData = Record<
    string,
    ReadonlyArray<QuizItem>  // 🔄 배열 앞에 ReadonlyArray<>
     generated ?: QuizQuestion[];
manual ?: ManualQuizItem[];
>;


export interface QuizQuestion {
    question: string;
    answer: string;
}

export interface ManualQuizItem {
    category: string;
    question: string;
    answer: string;
}
