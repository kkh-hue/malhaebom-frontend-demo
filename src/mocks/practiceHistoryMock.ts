export type PracticeHistoryItem = {
  id: string;
  question: string;
  practicedAt: string;
  status: string;
  resultType: "comparison" | "result";
  attempt1Transcript: string;
  attempt2Transcript?: string;
  attempt1Metrics: { speakingRate: number; longSilence: number; repeatedExpressions: number };
  attempt2Metrics?: { speakingRate: number; longSilence: number; repeatedExpressions: number };
  feedback: string[];
  changes?: string[];
};

export const MOCK_PRACTICE_HISTORY: PracticeHistoryItem[] = [
  {
    id: "history-1", question: "자기소개를 해주세요.", practicedAt: "2026.08.19 11:20", status: "2차 연습 완료", resultType: "comparison",
    attempt1Transcript: "저는 새로운 업무를 맡았을 때 먼저 해야 할 일을 정리하고, 우선순위를 세워 하나씩 해결하는 편입니다. 이전 업무에서도 이런 방식으로 문제를 해결한 경험이 있습니다.",
    attempt2Transcript: "저는 새로운 업무를 맡으면 해야 할 일을 정리하고 우선순위를 세워 해결합니다. 이전 업무에서도 이 방식으로 문제를 해결한 경험이 있습니다.",
    attempt1Metrics: { speakingRate: 345, longSilence: 3, repeatedExpressions: 4 }, attempt2Metrics: { speakingRate: 330, longSilence: 1, repeatedExpressions: 2 },
    feedback: ["문장 사이의 긴 멈춤을 조금 줄여보세요.", "답변 후반부의 말하기 속도를 조금만 천천히 유지해 보세요."],
    changes: ["긴 침묵이 3회에서 1회로 줄었어요.", "반복 표현이 4회에서 2회로 줄었어요.", "말하기 속도가 345에서 330 음절/분으로 변화했어요."],
  },
  {
    id: "history-2", question: "지원한 이유를 말씀해 주세요.", practicedAt: "2026.08.19 10:45", status: "1차 분석 완료", resultType: "result",
    attempt1Transcript: "저는 사용자의 문제를 해결하는 제품을 만드는 일에 관심이 있어 지원했습니다. 협업하며 배우고 성장할 수 있는 환경이라고 생각했습니다.",
    attempt1Metrics: { speakingRate: 338, longSilence: 2, repeatedExpressions: 3 },
    feedback: ["답변의 문장 사이 호흡을 일정하게 유지해 보세요."],
  },
  {
    id: "history-3", question: "본인의 강점은 무엇인가요?", practicedAt: "2026.08.18 16:30", status: "2차 연습 완료", resultType: "comparison",
    attempt1Transcript: "저의 강점은 맡은 일을 끝까지 정리하고 주변과 공유하는 습관입니다.",
    attempt2Transcript: "저의 강점은 맡은 일을 끝까지 정리하고, 진행 상황을 주변과 공유하는 습관입니다.",
    attempt1Metrics: { speakingRate: 352, longSilence: 2, repeatedExpressions: 3 }, attempt2Metrics: { speakingRate: 341, longSilence: 1, repeatedExpressions: 2 },
    feedback: ["핵심 문장을 조금 더 또렷하게 말해보세요."],
    changes: ["긴 침묵이 2회에서 1회로 줄었어요.", "반복 표현이 3회에서 2회로 줄었어요.", "말하기 속도가 352에서 341 음절/분으로 변화했어요."],
  },
];
