import { useEffect, useState } from "react";
import type { PracticeQuestion } from "./PracticePage";
import type { AnalysisResult } from "../mocks/analysisMock";
import { supabase } from "../api/supabaseAuth";
import "../styles/flow-pages.css";
import { AppHeader } from "../navigation";

type Props = { question: PracticeQuestion; attemptNo: 1 | 2; audio: Blob; onComplete: (result: AnalysisResult) => void; isLoggedIn: boolean; onLogin: () => void; onBack: () => void };
const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

async function getApiError(response: Response, fallback: string) {
  try {
    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("detail" in payload)) return fallback;
    const detail = payload.detail;
    if (typeof detail === "string") return detail;
    if (typeof detail === "object" && detail !== null && "message" in detail && typeof detail.message === "string") return detail.message;
  } catch {
    // 오류 응답이 JSON이 아니면 공통 안내를 표시한다.
  }
  return fallback;
}

function AnalysisPage({ question, attemptNo, audio, onComplete, isLoggedIn, onLogin, onBack }: Props) {
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const abort = new AbortController();
    void (async () => {
      const { data } = await supabase().auth.getSession();
      if (!data.session) throw new Error("로그인이 필요하거나 세션이 만료되었습니다.");
      const form = new FormData(); form.set("source_id", crypto.randomUUID()); form.set("question_type", question.questionType); form.set("attempt_no", String(attemptNo));
      if (question.questionType === "preset") form.set("question_id", question.questionId || ""); else form.set("custom_question_text", question.question);
      form.set("audio", audio, audio instanceof File ? audio.name : "answer.webm");
      const created = await fetch(`${base}/analysis-jobs`, { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` }, body: form, signal: abort.signal });
      if (!created.ok) throw new Error(await getApiError(created, "분석 요청에 실패했습니다.")); const job = await created.json();
      for (;;) { const response = await fetch(`${base}/analysis-jobs/${job.job_id}`, { headers: { Authorization: `Bearer ${data.session.access_token}` }, signal: abort.signal }); if (!response.ok) throw new Error(await getApiError(response, "분석 상태를 확인하지 못했습니다.")); const current = await response.json(); if (current.status === "completed") { const metrics = current.delivery?.metrics || {}; onComplete({ attemptNo, transcript: current.result?.text || "", speakingRate: Math.round(metrics.cpm || 0), longSilence: metrics.long_silences?.length || 0, repeatedExpressions: metrics.repetitions?.length || 0, feedback: (current.delivery?.feedback || []).slice(0, 2).map((item: { action: string }) => item.action), prosodyReferenceAvailable: false, referenceMetrics: { pace: { value: 0 }, longSilenceCount: { value: 0 }, repetitionCount: { value: 0 } }, contentFeedback: { text: current.content_feedback?.feedback || "" } }); return; } if (current.status === "failed") throw new Error(current.error?.message || "분석에 실패했습니다."); await new Promise((resolve) => window.setTimeout(resolve, 1000)); }
    })().catch((cause) => { if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "분석에 실패했습니다."); });
    return () => abort.abort();
  }, [audio, attemptNo, isLoggedIn, onComplete, question]);
  return <div className="flow-page"><AppHeader /><main className="flow-main"><section className="flow-card analysis-card" aria-live="polite">{!isLoggedIn ? <><h1>로그인이 필요해요.</h1><button className="flow-primary-button" onClick={onLogin}>로그인하기</button></> : error ? <><h1>답변을 분석하지 못했어요.</h1><p>{error}</p><button className="flow-primary-button" onClick={onBack}>다시 녹음하기</button></> : <><h1>답변의 전달 방식을 살펴보고 있어요.</h1><p>잠시만 기다려 주세요.</p></>}</section></main></div>;
}
export default AnalysisPage;
