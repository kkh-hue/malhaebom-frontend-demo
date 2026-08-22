import { useEffect, useRef, useState } from "react";
import type { PracticeQuestion } from "./PracticePage";
import type { AnalysisResult, CoachAudioState, ContentFeedback } from "../mocks/analysisMock";
import { MOCK_COACH_AUDIO_SRC, MOCK_CONTENT_FEEDBACK_BY_QUESTION } from "../mocks/analysisMock";
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
  // TODO: mock에는 answerDurationSec가 없어 회/분 비교가 불가합니다.
  // 실제 API 연결 시 delivery.metrics.answer_duration_sec를 AnalysisResult.answerDurationSec로 전달해 longSilence / answerDurationSec * 60으로 정규화하고 2.48회/분과 비교합니다.
  const longSilencesPerMinute = perMinute(result.longSilence, result.answerDurationSec);
  const repetitionsPer100Words = per100Words(result.repeatedExpressions, result.transcript);
  const longSilenceValue = longSilencesPerMinute ?? safeCount(result.longSilence);
  const repetitionValue = repetitionsPer100Words ?? 0;
  return (
    <div className="flow-page">
      <AppHeader />
      <main className="flow-main result-main">
        <section className="flow-card result-card">
          <p className="flow-eyebrow">1차 분석 결과</p>
          <h1>답변의 전달 방식을 확인해 봤어요.</h1>
          <div className="flow-question"><span>선택한 질문</span><strong>{question.question}</strong></div>
          <section className="result-section"><h2>내 답변</h2><p className="transcript">{result.transcript}</p></section>
          <section className="result-section analysis-results-section"><h2>분석 결과</h2><div className="analysis-metrics-grid">
            <VerticalBarCard label="말하기 속도" value={result.speakingRate} reference={result.referenceMetrics.pace.value} valueUnit=" CPM" />
            <VerticalBarCard label="긴 침묵" value={longSilenceValue} reference={longSilencesPerMinute === null ? undefined : result.referenceMetrics.longSilenceCount.value} valueUnit={longSilencesPerMinute === null ? "회" : "회/분"} referenceUnit="회/분" referenceUnavailableLabel="비교 불가" />
            <VerticalBarCard label="반복 표현" value={repetitionValue} reference={result.referenceMetrics.repetitionCount.value} valueUnit="회/100어절" referenceUnit="회/100어절" />
          </div></section>
          <section className="result-section"><h2>다음 연습에서 바꿔볼 점</h2><div className="action-feedback-list">{result.feedback.slice(0, 2).map((item) => <article className="action-feedback" key={item.title}><h3>{item.title}</h3><div className="feedback-part"><strong>측정 결과</strong><p>{item.measurement}</p></div><div className="feedback-part"><strong>연습 목표</strong><p>{item.nextPractice}</p></div></article>)}</div></section>
          <ContentFeedbackSection feedback={question.questionType === "preset" ? MOCK_CONTENT_FEEDBACK_BY_QUESTION[question.question] ?? result.contentFeedback : result.contentFeedback} />
          <CoachAudioSection state={effectiveCoachAudioState} />
          <button className="flow-primary-button" type="button" onClick={onRerecord}>재녹음 하기</button>
        </section>
      </main>
    </div>
  );
}

function perMinute(count: number | undefined, answerDurationSec?: number): number | null {
  if (typeof count !== "number" || typeof answerDurationSec !== "number" || !Number.isFinite(count) || !Number.isFinite(answerDurationSec) || answerDurationSec <= 0) return null;
  return roundToTwoDecimals((count / answerDurationSec) * 60);
}

function per100Words(count: number | undefined, transcript: string | undefined): number | null {
  const wordCount = transcript?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  if (typeof count !== "number" || !Number.isFinite(count) || wordCount === 0) return null;
  return roundToTwoDecimals((count / wordCount) * 100);
}

function safeCount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function VerticalBarCard({ label, value, reference, valueUnit, referenceUnit = valueUnit, referenceUnavailableLabel = "-" }: { label: string; value: number; reference?: number; valueUnit: string; referenceUnit?: string; referenceUnavailableLabel?: string }) {
  const hasReference = typeof reference === "number" && Number.isFinite(reference);
  const max = Math.max(value, hasReference ? reference : 0, 1);
  const isSplitUnit = valueUnit.includes("/");
  return <article className="metric-visual-card vertical-bar-card">
    <div className="metric-card-heading"><h3>{label}</h3></div>
    <div className="vertical-bars"><div className="vertical-bar-column"><div className="vertical-bar-track"><i className="vertical-bar" style={{ height: `${Math.max((value / max) * 100, 10)}%` }} /></div><strong className={isSplitUnit ? "metric-value metric-value--split" : "metric-value"}>{isSplitUnit ? <><b>{value}{valueUnit.charAt(0)}</b><small>{valueUnit.slice(1)}</small></> : `${value}${valueUnit}`}</strong><span>나의 결과</span></div><div className="vertical-bar-column"><div className="vertical-bar-track">{hasReference && <i className="vertical-bar is-reference" style={{ height: `${Math.max((reference / max) * 100, 10)}%` }} />}</div><strong className={isSplitUnit ? "metric-value metric-value--split" : "metric-value"}>{hasReference ? isSplitUnit ? <><b>{reference}{referenceUnit.charAt(0)}</b><small>{referenceUnit.slice(1)}</small></> : `${reference}${referenceUnit}` : referenceUnavailableLabel}</strong><span>참고 기준</span></div></div>
  </article>;
}

function ContentFeedbackSection({ feedback }: { feedback: ContentFeedback }) {
  return <section className="result-section content-feedback-section"><h2>답변에 더해볼 내용</h2><p className="content-feedback-text">{feedback.text}</p></section>;
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

export default ResultPage;
