import { useEffect, useRef, useState } from "react";
import type { PracticeQuestion } from "./PracticePage";
import type { AnalysisResult, CoachAudioState } from "../mocks/analysisMock";
import { MOCK_COACH_AUDIO_SRC } from "../mocks/analysisMock";
import { MOCK_ERROR_STATE } from "../mocks/errorStateMock";
import "../styles/flow-pages.css";
import { AppHeader } from "../navigation";

type ResultPageProps = {
  question: PracticeQuestion;
  result: AnalysisResult;
  coachAudioState: CoachAudioState;
  onRerecord: () => void;
};

function ResultPage({ question, result, coachAudioState, onRerecord }: ResultPageProps) {
  const effectiveCoachAudioState = MOCK_ERROR_STATE === "coach-audio-unavailable" ? "unavailable" : MOCK_ERROR_STATE === "coach-audio-error" ? "error" : coachAudioState;
  return (
    <div className="flow-page">
      <AppHeader />
      <main className="flow-main result-main">
        <section className="flow-card result-card">
          <p className="flow-eyebrow">1차 분석 결과</p>
          <h1>답변의 전달 방식을 확인해 봤어요.</h1>
          <div className="flow-question"><span>선택한 질문</span><strong>{question.question}</strong></div>
          <section className="result-section"><h2>내 답변</h2><p className="transcript">{result.transcript}</p></section>
          <section className="result-section"><h2>분석 결과</h2><div className="metric-grid"><Metric label="말하기 속도" value={`${result.speakingRate} 음절/분`} /><Metric label="긴 침묵" value={`${result.longSilence}회`} /><Metric label="반복 표현" value={`${result.repeatedExpressions}회`} /></div></section>
          <section className="result-section"><h2>다음 연습에서 바꿔볼 점</h2><ul className="feedback-list">{result.feedback.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></section>
          {question.questionType === "preset" && <section className="result-section neutral-section"><h2>답변 구성 점검</h2><p>답변이 자연스럽게 이어지는지 흐름을 확인해요.</p><small>정답이나 답변의 좋고 나쁨을 판단하지 않아요.</small></section>}
          {result.prosodyReferenceAvailable && <section className="result-section subtle-section"><h2>참고 피드백</h2><p>답변 중 일부 구간에서 목소리 크기 변화가 적게 나타났어요.</p></section>}
          <CoachAudioSection state={effectiveCoachAudioState} />
          <button className="flow-primary-button" type="button" onClick={onRerecord}>재녹음 하기</button>
        </section>
      </main>
    </div>
  );
}

function CoachAudioSection({ state }: { state: CoachAudioState }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mockTimerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(state === "error");

  useEffect(() => () => {
    audioRef.current?.pause();
    if (mockTimerRef.current !== null) window.clearTimeout(mockTimerRef.current);
  }, []);

  const stopPlayback = () => {
    audioRef.current?.pause();
    if (mockTimerRef.current !== null) window.clearTimeout(mockTimerRef.current);
    mockTimerRef.current = null;
    setIsPlaying(false);
  };

  const playAudio = () => {
    setHasPlaybackError(false);
    if (MOCK_COACH_AUDIO_SRC) {
      const audio = audioRef.current ?? new Audio(MOCK_COACH_AUDIO_SRC);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error("[말해봄 mock] 말하기 예시 재생 실패");
        setHasPlaybackError(true);
        setIsPlaying(false);
      };
      audio.play().then(() => setIsPlaying(true)).catch((error) => {
        console.error("[말해봄 mock] 말하기 예시 재생 실패", error);
        setHasPlaybackError(true);
        setIsPlaying(false);
      });
      return;
    }

    // 현재 정적 asset이 없어 실제 음성 대신 UI 재생 상태만 mock합니다.
    console.warn("[말해봄 mock] 재생할 정적 coach audio asset이 없습니다.");
    setIsPlaying(true);
    mockTimerRef.current = window.setTimeout(() => setIsPlaying(false), 2000);
  };

  if (state === "unavailable" || state === "unreviewed") {
    return <section className="result-section coach-section"><h2>말하기 예시</h2><p>{state === "unavailable" ? "이번에는 말하기 예시 없이 텍스트 안내를 참고해 다시 연습해 주세요." : "이번에는 텍스트 안내를 참고해 다시 연습해 주세요."}</p></section>;
  }

  if (hasPlaybackError) {
    return <section className="result-section coach-section"><h2>말하기 예시</h2><p>말하기 예시를 재생할 수 없어요.</p><p>잠시 후 다시 재생하거나 텍스트 안내를 참고해 주세요.</p><button className="flow-secondary-button" type="button" onClick={playAudio}>다시 재생</button></section>;
  }

  return <section className="result-section coach-section"><h2>말하기 예시</h2><p>다음 연습 전에 말하기 예시를 들어보세요.</p><button className="flow-secondary-button" type="button" onClick={isPlaying ? stopPlayback : playAudio}>{isPlaying ? "■ 멈춤" : "▶ 재생"}</button></section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

export default ResultPage;
