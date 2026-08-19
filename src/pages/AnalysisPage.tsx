import { useEffect, useState } from "react";
import type { PracticeQuestion } from "./PracticePage";
import { getMockAnalysisResult, type AnalysisResult } from "../mocks/analysisMock";
import "../styles/flow-pages.css";
import { AppHeader } from "../navigation";
import { MOCK_ERROR_STATE } from "../mocks/errorStateMock";

type AnalysisPageProps = {
  question: PracticeQuestion;
  attemptNo: 1 | 2;
  onComplete: (result: AnalysisResult) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onBack: () => void;
};

function AnalysisPage({ question, attemptNo, onComplete, isLoggedIn, onLogin, onBack }: AnalysisPageProps) {
  const [analysisError, setAnalysisError] = useState<"analysis-failed" | "no-speech" | null>(null);
  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const timer = window.setTimeout(() => {
      if (MOCK_ERROR_STATE === "analysis-failed" || MOCK_ERROR_STATE === "no-speech") setAnalysisError(MOCK_ERROR_STATE);
      else onComplete(getMockAnalysisResult(attemptNo));
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [attemptNo, isLoggedIn, onComplete]);

  return (
    <div className="flow-page">
      <AppHeader />
      <main className="flow-main">
        <section className="flow-card analysis-card" aria-live="polite">
          {!isLoggedIn ? (
            <>
              <div className="flow-icon">🔒</div>
              <p className="flow-eyebrow">로그인 확인</p>
              <h1>분석 결과를 확인하려면 로그인이 필요해요.</h1>
              <p>로그인 후 연습 결과를 최대 24시간 동안 확인할 수 있어요.</p>
              <button className="flow-primary-button" type="button" onClick={onLogin}>로그인하기</button>
              <button className="flow-secondary-button" type="button" onClick={onBack}>돌아가기</button>
            </>
          ) : (
            <>
              {analysisError ? <>
                <div className="flow-icon">!</div>
                <p className="flow-eyebrow">{attemptNo === 1 ? "1차 분석" : "2차 분석"}</p>
                <h1>{analysisError === "analysis-failed" ? "답변을 분석하지 못했어요." : "음성을 충분히 확인하기 어려워요."}</h1>
                <p>{analysisError === "analysis-failed" ? "잠시 후 다시 시도해 주세요." : "조금 더 또렷하게 말하거나 마이크와의 거리를 조정한 뒤 다시 녹음해 주세요."}</p>
                <button className="flow-primary-button" type="button" onClick={() => analysisError === "no-speech" ? onBack() : console.log("[말해봄 mock] 다시 분석하기")}>{analysisError === "analysis-failed" ? "다시 분석하기" : "다시 녹음하기"}</button>
                {analysisError === "analysis-failed" && <button className="flow-secondary-button" type="button" onClick={onBack}>다시 녹음하기</button>}
              </> : <>
                <div className="flow-icon is-loading"><span /></div>
                <p className="flow-eyebrow">{attemptNo === 1 ? "1차 분석" : "2차 분석"}</p>
                <h1>답변의 전달 방식을 살펴보고 있어요.</h1>
                <p>잠시만 기다려 주세요.</p>
                <div className="flow-question">{question.question}</div>
              </>}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AnalysisPage;
