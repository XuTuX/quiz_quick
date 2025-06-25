// 개별 질문과 답변의 구조
export interface QA {
    question: string;
    options?: string[]; // 객관식 보기 (주관식은 없음)
    answer: string; // 정답
    selectedOption?: string; // 사용자가 선택한 답
    isCorrect?: boolean; // 정답 여부
}

// AI가 생성할 전체 퀴즈 데이터 구조 (카테고리별로 그룹화)
export interface QuizData {
    [category: string]: QA[];
}