type QuizByCategory = {
  [key: string]: {
    [sub: string]: unknown[]
  }
}

export const quizByCategory: QuizByCategory = {
  placeholder: {
    sub1: [],
    sub2: [],
  },
}
