export type CoachAudioState = "available" | "unavailable" | "unreviewed" | "error";
export type AnalysisResult = {
  attemptNo: 1 | 2;
  transcript: string;
  speakingRate: number;
  longSilence: number;
  repeatedExpressions: number;
  feedback: string[];
  prosodyReferenceAvailable: boolean;
};

// 실제 backend 응답이 아닌 화면 흐름 확인용 mock 값입니다.
export const MOCK_LOGGED_IN = true;
export const MOCK_COACH_AUDIO_STATE: CoachAudioState = "available";
// 정적 검수 WAV가 추가되면 이 값에 로컬 asset 경로를 넣습니다. 현재는 자산이 없습니다.
export const MOCK_COACH_AUDIO_SRC: string | null = null;

const firstMockResult: AnalysisResult = {
  attemptNo: 1,
  transcript: "안녕하세요. 저는 새로운 기술을 배우고 문제를 해결하는 과정에 흥미를 느끼는 지원자입니다. 협업을 통해 더 나은 결과를 만들어 왔습니다.",
  speakingRate: 345,
  longSilence: 3,
  repeatedExpressions: 4,
  feedback: [
    "문장 사이의 긴 멈춤을 조금 줄여보세요.",
    "답변 후반부의 말하기 속도를 조금만 천천히 유지해 보세요.",
  ],
  prosodyReferenceAvailable: true,
};

const secondMockResult: AnalysisResult = {
  attemptNo: 2,
  transcript: "안녕하세요. 저는 새로운 기술을 배우고 문제를 해결하는 과정에 흥미를 느끼는 지원자입니다. 협업 경험을 통해 성장해 왔습니다.",
  speakingRate: 330,
  longSilence: 1,
  repeatedExpressions: 2,
  feedback: [],
  prosodyReferenceAvailable: false,
};

export function getMockAnalysisResult(attemptNo: 1 | 2): AnalysisResult {
  return attemptNo === 1 ? firstMockResult : secondMockResult;
}
