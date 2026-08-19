import { useEffect, useRef, useState } from "react";
import type { PracticeQuestion } from "./PracticePage";
import type { CoachAudioState } from "../mocks/analysisMock";
import { AppHeader } from "../navigation";
import { MOCK_ERROR_STATE } from "../mocks/errorStateMock";
import "../styles/recording-page.css";

type RecordingPageProps = {
  question: PracticeQuestion;
  attemptNo: 1 | 2;
  isRerecord?: boolean;
  coachAudioState?: CoachAudioState;
  onAnalysis: (attemptNo: 1 | 2) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
};
type RecordingStatus = "ready" | "recording" | "paused" | "completed" | "error";
type RecordingError = "microphone" | "start" | "interrupted" | "blob" | "too-short";

const MAX_RECORDING_MS = 60_000;
const MIN_RECORDING_MS = 5_000;
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function RecordingPage({ question, attemptNo, isRerecord = false, coachAudioState = "unavailable", onAnalysis, isLoggedIn, onLogin }: RecordingPageProps) {
  const [status, setStatus] = useState<RecordingStatus>("ready");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<RecordingError | null>(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const elapsedMsRef = useRef(0);
  const startedAtRef = useRef(0);
  const elapsedBeforeResumeRef = useRef(0);
  const recorderErrorRef = useRef(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const revokeAudioUrl = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
  };

  const finishRecorder = () => {
    recorderRef.current = null;
    stopStream();
  };

  const setElapsed = (value: number) => {
    const nextValue = Math.min(value, MAX_RECORDING_MS);
    elapsedMsRef.current = nextValue;
    setElapsedMs(nextValue);
  };

  useEffect(() => {
    if (status !== "recording") return undefined;
    const timer = window.setInterval(() => {
      const nextValue = elapsedBeforeResumeRef.current + (Date.now() - startedAtRef.current);
      if (nextValue >= MAX_RECORDING_MS) {
        setElapsed(MAX_RECORDING_MS);
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== "inactive") recorder.stop();
        return;
      }
      setElapsed(nextValue);
    }, 100);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => () => {
    stopStream();
    recorderRef.current = null;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  const handleRecorderStop = (recorder: MediaRecorder) => {
    finishRecorder();
    if (recorderErrorRef.current) return;
    if (elapsedMsRef.current < MIN_RECORDING_MS) {
      setErrorType("too-short");
      setStatus("error");
      return;
    }
    try {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (blob.size === 0) throw new Error("Empty recording blob");
      revokeAudioUrl();
      const nextAudioUrl = URL.createObjectURL(blob);
      audioUrlRef.current = nextAudioUrl;
      setAudioUrl(nextAudioUrl);
      setStatus("completed");
    } catch (error) {
      console.error("[말해봄] 녹음 Blob 생성 실패", error);
      setErrorType("blob");
      setStatus("error");
    }
  };

  const startRecording = async () => {
    revokeAudioUrl();
    chunksRef.current = [];
    recorderErrorRef.current = false;
    setErrorType(null);
    setElapsed(0);
    elapsedBeforeResumeRef.current = 0;
    if (MOCK_ERROR_STATE === "recording-failed") {
      setErrorType("start");
      setStatus("error");
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("getUserMedia is not supported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          const activeRecorder = recorderRef.current;
          if (!activeRecorder || activeRecorder.state === "inactive") return;
          console.error("[말해봄] 녹음 중 마이크 연결 종료");
          recorderErrorRef.current = true;
          setErrorType("interrupted");
          setStatus("error");
          activeRecorder.stop();
        };
      });
      const mimeType = MIME_TYPES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = (event) => {
        console.error("[말해봄] 녹음 중 오류", event);
        recorderErrorRef.current = true;
        stopStream();
        setErrorType("interrupted");
        setStatus("error");
      };
      recorder.onstop = () => handleRecorderStop(recorder);
      recorder.start();
      startedAtRef.current = Date.now();
      setStatus("recording");
    } catch (error) {
      console.error("[말해봄] 녹음 시작 실패", error);
      stopStream();
      setErrorType(error instanceof DOMException ? "microphone" : "start");
      setStatus("error");
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (MOCK_ERROR_STATE === "too-short") {
      recorderErrorRef.current = true;
      stopStream();
      setElapsed(3000);
      setErrorType("too-short");
      setStatus("error");
    }
  };

  const pauseRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    setElapsed(elapsedBeforeResumeRef.current + (Date.now() - startedAtRef.current));
    recorder.pause();
    setStatus("paused");
  };

  const resumeRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    elapsedBeforeResumeRef.current = elapsedMsRef.current;
    startedAtRef.current = Date.now();
    recorder.resume();
    setStatus("recording");
  };

  const resetRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stopStream();
    recorderRef.current = null;
    chunksRef.current = [];
    recorderErrorRef.current = false;
    revokeAudioUrl();
    setElapsed(0);
    setErrorType(null);
    setStatus("ready");
  };

  const handleAnalysis = () => {
    if (!isLoggedIn) {
      setShowLoginRequired(true);
      return;
    }
    onAnalysis(attemptNo);
  };

  const errorTitle = errorType === "too-short" ? "조금만 더 답변해 주세요." : errorType === "microphone" ? "마이크를 사용할 수 없어요." : errorType === "interrupted" ? "녹음이 중단됐어요." : errorType === "blob" ? "녹음 파일을 만들 수 없어요." : "녹음을 시작할 수 없어요.";
  const errorDescription = errorType === "too-short" ? "답변은 5초 이상 녹음해야 분석할 수 있어요." : errorType === "microphone" ? "마이크 권한과 연결 상태를 확인한 뒤 다시 시도해 주세요." : errorType === "interrupted" ? "마이크 연결 상태를 확인한 뒤 다시 시도해 주세요." : errorType === "blob" ? "잠시 후 다시 녹음해 주세요." : "마이크 권한과 연결 상태를 확인한 뒤 다시 시도해 주세요.";
  const statusLabel = status === "ready" ? "녹음 준비" : status === "recording" ? "녹음 중" : status === "paused" ? "일시정지" : status === "completed" ? "녹음 완료" : errorType === "too-short" ? "녹음 확인" : "녹음 오류";

  return (
    <div className="recording-page">
      <AppHeader />
      <main className="recording-main">
        <section className="recording-card" aria-labelledby="recording-title">
          <p className="eyebrow">{statusLabel}</p>
          <div className="recording-question"><span>선택한 질문</span><h1>{question.question}</h1></div>

          {status === "ready" && <div className="recording-state ready-state">
            <div className="recording-icon" aria-hidden="true">🎙️</div>
            <h2 id="recording-title">{isRerecord ? "피드백과 말하기 예시를 떠올리며 다시 말해볼까요?" : "준비되셨다면 편하게 시작해 주세요."}</h2>
            <p className="recording-limit">{isRerecord ? "완벽하게 바꾸려 하지 않아도 괜찮아요. 한 가지씩 적용해 보세요." : "답변은 5초 이상, 최대 60초까지 녹음할 수 있어요."}</p>
            {!isRerecord && <p className="recording-tip">완벽하게 말하려 하지 않아도 괜찮아요.<br />평소처럼 자연스럽게 답해 주세요.</p>}
            {isRerecord && <div className="rerecord-coach-note">{coachAudioState === "available" ? <button className="coach-example-button" type="button" onClick={() => console.log("[말해봄 mock] 정적 coach audio 재생")}>말하기 예시 다시 듣기</button> : coachAudioState === "unavailable" ? "이번에는 말하기 예시 없이 텍스트 안내를 참고해 다시 연습해 주세요." : "이번에는 텍스트 안내를 참고해 다시 연습해 주세요."}</div>}
            <button className="start-button recording-start-button" type="button" onClick={() => void startRecording()}>{isRerecord ? "재녹음 시작하기" : "녹음 시작하기"} <span aria-hidden="true">→</span></button>
          </div>}

          {(status === "recording" || status === "paused") && <div className="recording-state active-state" role="status" aria-live="polite">
            <div className={`recording-icon is-active${status === "paused" ? " is-paused" : ""}`} aria-hidden="true"><span className="recording-indicator"><i /></span></div>
            <h2>{status === "recording" ? "답변을 녹음하고 있어요. 편하게 말씀해 주세요." : "녹음을 잠시 멈췄어요. 준비되면 이어서 말씀해 주세요."}</h2>
            <div className="timer">{formatTime(elapsedMs)} <span>/ 01:00</span></div>
            <div className="waveform" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 30)}px` }} />)}</div>
            <div className="recording-actions">
              <button className="secondary-button" type="button" onClick={stopRecording}>그만하기</button>
              {status === "recording" ? <button className="start-button" type="button" onClick={pauseRecording}>일시정지</button> : <button className="start-button" type="button" onClick={resumeRecording}>이어서 녹음하기</button>}
            </div>
          </div>}

          {status === "completed" && <div className="recording-state completed-state">
            <div className="recording-icon" aria-hidden="true">✓</div>
            <h2>답변 녹음이 완료됐어요.</h2>
            <p className="recording-tip completed-description">녹음한 답변을 확인한 뒤 분석을 시작해 주세요.</p>
            <p className="recording-limit">총 녹음 시간 {formatTime(elapsedMs)}</p>
            {audioUrl && <audio className="recording-player" controls src={audioUrl} />}
            <div className="recording-actions"><button className="secondary-button" type="button" onClick={resetRecording}>다시 녹음</button><button className="start-button" type="button" onClick={handleAnalysis}>분석하기</button></div>
          </div>}

          {status === "error" && <div className="recording-state error-state" role="alert">
            <div className="recording-icon is-error" aria-hidden="true">!</div>
            <h2>{errorType === "too-short" ? "답변을 조금 더 길게 해주세요." : errorTitle}</h2>
            <p className="recording-tip">{MOCK_ERROR_STATE === "recording-failed" ? "잠시 후 다시 시도해 주세요." : errorType === "too-short" ? "분석을 위해 답변을 5초 이상 녹음해 주세요." : errorDescription}</p>
            <button className="start-button recording-start-button" type="button" onClick={resetRecording}>{MOCK_ERROR_STATE === "recording-failed" ? "다시 시도하기" : "다시 녹음하기"}</button>
          </div>}
        </section>
      </main>
      {showLoginRequired && <div className="recording-login-backdrop"><div className="recording-login-card"><h2>분석 결과를 확인하려면 로그인이 필요해요.</h2><p>로그인 후 연습 결과를 최대 24시간 동안 확인할 수 있어요.</p><div><button className="secondary-button" type="button" onClick={() => setShowLoginRequired(false)}>돌아가기</button><button className="start-button" type="button" onClick={onLogin}>로그인하기</button></div></div></div>}
    </div>
  );
}

export default RecordingPage;
