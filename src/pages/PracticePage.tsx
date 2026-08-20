import { useMemo, useState } from "react";
import "../styles/practice-page.css";
import { AppHeader } from "../navigation";
import { MOCK_ERROR_STATE } from "../mocks/errorStateMock";

const presetQuestions = [
  "자기소개를 해주세요.",
  "지원한 이유를 말씀해주세요.",
  "본인의 장점을 말씀해주세요.",
  "어려운 문제를 해결했던 경험을 말씀해주세요.",
  "협업 중 갈등을 해결했던 경험을 말씀해주세요.",
  "실패 경험과 배운 점을 말씀해주세요.",
  "가장 기억에 남는 프로젝트를 소개해주세요.",
  "본인이 맡았던 역할을 설명해주세요.",
  "입사 후 어떤 개발자가 되고 싶은가요?",
  "마지막으로 하고 싶은 말을 말씀해주세요.",
];

type QuestionType = "preset" | "custom";
export type PracticeQuestion = {
  questionType: QuestionType;
  question: string;
  questionId: string | null;
};

type MicrophoneState = "idle" | "checking" | "granted" | "denied" | "error";
type PracticeView = "intro" | "question-select";

type PracticePageProps = {
  onRecordingReady: (question: PracticeQuestion) => void;
};

function PracticePage({ onRecordingReady }: PracticePageProps) {
  const [view, setView] = useState<PracticeView>("intro");
  const [questionType, setQuestionType] = useState<QuestionType>("preset");
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>("idle");

  const customError = useMemo(() => {
    if (questionType !== "custom" || customQuestion.length === 0) return "";
    if (customQuestion.trim().length === 0) return "질문을 입력해 주세요.";
    if (customQuestion.length > 200) return "질문은 200자 이내로 입력해 주세요.";
    return "";
  }, [customQuestion, questionType]);

  const selectedText =
    questionType === "preset" && selectedQuestion !== null
      ? presetQuestions[selectedQuestion]
      : customQuestion.trim();
  const isCustomValid =
    questionType === "custom" &&
    customQuestion.trim().length >= 1 &&
    customQuestion.length <= 200;
  const canStart =
    (questionType === "preset" && selectedQuestion !== null) || isCustomValid;

  const changeQuestionType = (type: QuestionType) => {
    setQuestionType(type);
    setSelectedQuestion(null);
    setCustomQuestion("");
    setMicrophoneState("idle");
  };

  const openQuestionSelect = () => {
    setView("question-select");
    setMicrophoneState("idle");
  };

  const returnToIntro = () => {
    setView("intro");
    setMicrophoneState("idle");
  };

  const selectedQuestionInfo: PracticeQuestion = {
    questionType,
    question: selectedText,
    questionId: questionType === "preset" && selectedQuestion !== null
      ? String(selectedQuestion + 1)
      : null,
  };

  const checkMicrophone = async () => {
    setMicrophoneState("checking");

    if (MOCK_ERROR_STATE === "mic-permission-denied") {
      setMicrophoneState("denied");
      return;
    }
    if (MOCK_ERROR_STATE === "mic-unavailable") {
      setMicrophoneState("error");
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicrophoneState("granted");
    } catch (error) {
      console.error("[말해봄 mock] 마이크 확인 실패", error);
      const errorName = error instanceof DOMException ? error.name : "UnknownError";
      setMicrophoneState(errorName === "NotAllowedError" || errorName === "PermissionDeniedError" ? "denied" : "error");
    }
  };

  const handleStart = () => {
    if (!canStart) return;
    void checkMicrophone();
  };

  const handleRecordingStart = () => {
    console.log("[말해봄 mock] 녹음 준비 화면에서 시작", selectedQuestionInfo);
    onRecordingReady(selectedQuestionInfo);
  };

  return (
    <div className="practice-page">
      <AppHeader />

      <main className={`practice-main ${view === "intro" ? "is-intro" : "is-question-select"}`} id="practice">
        {view === "intro" && <section className="intro-card card" aria-labelledby="intro-title">
          <div className="intro-topline">✨ AI 면접 전달력 코치</div>
          <h1 id="intro-title">답변은 준비됐어요.<br />이제 말하는 방식을 다듬어볼까요?</h1>
          <p className="intro-description">
            최대 60초 동안 답변해 보세요.<br />
            말하기 속도와 긴 침묵, 반복 표현을 살펴보고<br />
            말하기 예시를 들려드려요.
          </p>
          <div className="notice-group">
            <div className="notice"><span aria-hidden="true">💡</span> 답변을 대신 작성해드리지는 않아요.</div>
            <div className="notice"><span aria-hidden="true">🕒</span> 녹음 및 연습 기록은 최대 24시간 동안 보관 후 자동 삭제돼요.</div>
          </div>

          <div className="steps" aria-label="연습 진행 단계">
            <div className="step"><span className="step-number">01</span><span>답변 녹음</span></div>
            <span className="step-line" aria-hidden="true" />
            <div className="step"><span className="step-number">02</span><span>전달력 분석</span></div>
            <span className="step-line" aria-hidden="true" />
            <div className="step"><span className="step-number">03</span><span>듣고 재연습</span></div>
          </div>
          <button className="start-button intro-cta" type="button" onClick={openQuestionSelect}>연습 시작하기 <span aria-hidden="true">→</span></button>
        </section>}

        {view === "question-select" && <section className={`question-card question-select-card card${microphoneState !== "idle" ? " is-microphone-check" : ""}`} aria-labelledby={microphoneState === "idle" ? "question-title" : undefined} aria-label={microphoneState !== "idle" ? "마이크 확인" : undefined}>
          <button className="practice-back-button" type="button" onClick={returnToIntro}>← 돌아가기</button>
          {microphoneState === "idle" && <div className="question-heading">
            <p className="eyebrow">오늘의 연습</p>
            <h2 id="question-title">어떤 질문으로 시작할까요?</h2>
            <p>기본 질문을 고르거나, 연습하고 싶은 질문을 직접 입력해 주세요.</p>
          </div>}

          {microphoneState === "idle" ? (
          <>
          <div className="question-tabs" role="tablist" aria-label="질문 유형">
            <button
              className={questionType === "preset" ? "tab is-selected" : "tab"}
              type="button" role="tab" aria-selected={questionType === "preset"}
              onClick={() => changeQuestionType("preset")}
            >기본 질문</button>
            <button
              className={questionType === "custom" ? "tab is-selected" : "tab"}
              type="button" role="tab" aria-selected={questionType === "custom"}
              onClick={() => changeQuestionType("custom")}
            >내 질문</button>
          </div>

          {questionType === "preset" ? (
            <div className="preset-panel" role="tabpanel">
              <p className="panel-caption">하나의 질문을 선택해주세요.</p>
              <div className="question-list">
                {presetQuestions.map((question, index) => (
                  <button
                    className={selectedQuestion === index ? "preset-question is-selected" : "preset-question"}
                    key={question} type="button"
                    onClick={() => setSelectedQuestion(index)}
                    aria-pressed={selectedQuestion === index}
                  >
                    <span className="question-index">{String(index + 1).padStart(2, "0")}</span>
                    <span>{question}</span>
                    <span className="checkmark" aria-hidden="true">{selectedQuestion === index ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="custom-panel" role="tabpanel">
              <label className="panel-caption" htmlFor="custom-question">연습하고 싶은 면접 질문을 입력해 주세요.</label>
              <textarea
                id="custom-question" value={customQuestion} maxLength={200}
                onChange={(event) => setCustomQuestion(event.target.value)}
                placeholder="질문을 입력해 주세요."
                aria-invalid={Boolean(customError)} aria-describedby="custom-helper custom-error"
              />
              <div className="custom-meta">
                <span id="custom-error" className="error-message">{customError}</span>
                <span id="custom-helper" className="character-count">{customQuestion.length} / 200</span>
              </div>
            </div>
          )}

          <div className="cta-area">
            <button className="start-button" type="button" disabled={!canStart} onClick={handleStart}>
              이 질문으로 시작하기 <span aria-hidden="true">→</span>
            </button>
          </div>
          </>
          ) : (
            <MicrophoneCheckPanel
              state={microphoneState}
              question={selectedText}
              onRetry={checkMicrophone}
              onStart={handleRecordingStart}
            />
          )}
        </section>}
      </main>
    </div>
  );
}

type MicrophoneCheckPanelProps = {
  state: Exclude<MicrophoneState, "idle">;
  question: string;
  onRetry: () => void | Promise<void>;
  onStart: () => void;
};

function MicrophoneCheckPanel({ state, question, onRetry, onStart }: MicrophoneCheckPanelProps) {
  if (state === "checking") {
    return (
      <div className="microphone-panel is-centered" role="status" aria-live="polite">
        <span className="microphone-icon" aria-hidden="true">🎙️</span>
        <h3>마이크를 확인하고 있어요.</h3>
        <p>브라우저에서 마이크 사용을 허용해 주세요.</p>
        <span className="loading-indicator" aria-label="확인 중" />
        <button className="start-button" type="button" disabled>확인 중이에요...</button>
      </div>
    );
  }

  if (state === "granted") {
    return (
      <div className="microphone-panel" role="status" aria-live="polite">
        <span className="microphone-icon" aria-hidden="true">🎙️</span>
        <h3>마이크 준비가 완료됐어요.</h3>
        <p>이제 선택한 질문으로 연습을 시작할 수 있어요.</p>
        <div className="selected-question-preview">
          <span>선택한 질문</span>
          <strong>{question}</strong>
        </div>
        <button className="start-button" type="button" onClick={onStart}>
          연습 시작하기 <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  const isDenied = state === "denied";
  return (
    <div className="microphone-panel" role="alert">
      <span className="microphone-icon" aria-hidden="true">🎙️</span>
      <h3>{isDenied ? "마이크 사용 권한이 필요해요." : MOCK_ERROR_STATE === "mic-unavailable" ? "마이크를 사용할 수 없어요." : "마이크를 확인할 수 없어요."}</h3>
      <p>{isDenied
        ? MOCK_ERROR_STATE === "mic-permission-denied" ? "브라우저 설정에서 마이크 권한을 허용한 뒤 다시 시도해 주세요." : "답변을 녹음하려면 브라우저에서 마이크 사용을 허용해 주세요."
        : "마이크 연결 상태를 확인한 뒤 다시 시도해 주세요."}</p>
      {isDenied && <small>브라우저 주소창의 마이크 설정에서도 권한을 변경할 수 있어요.</small>}
      <button className="start-button" type="button" onClick={onRetry}>다시 확인하기</button>
    </div>
  );
}

export default PracticePage;
