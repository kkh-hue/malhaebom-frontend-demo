import { useState } from "react";
import type { PracticeQuestion } from "./PracticePage";
import type { AnalysisResult } from "../mocks/analysisMock";
import "../styles/flow-pages.css";
import { AppHeader } from "../navigation";

type ComparisonPageProps = { question: PracticeQuestion; firstResult: AnalysisResult; secondResult: AnalysisResult; onReturnHome: () => void };

function ComparisonPage({ question, firstResult, secondResult, onReturnHome }: ComparisonPageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flow-page">
      <AppHeader />
      <main className="flow-main result-main"><section className="flow-card result-card">
        <p className="flow-eyebrow">2차 분석 결과 / 비교</p>
        <h1>1차와 2차 답변의 변화를 확인해 보세요.</h1>
        <div className="flow-question"><span>선택한 질문</span><strong>{question.question}</strong></div>
        <section className="result-section"><h2>2차 답변</h2><p className="transcript">{secondResult.transcript}</p></section>
        <section className="result-section"><h2>1차 / 2차 분석 결과</h2><div className="comparison-grid"><div /><strong>1차</strong><strong>2차</strong><span>말하기 속도</span><span>{firstResult.speakingRate} 음절/분</span><span>{secondResult.speakingRate} 음절/분</span><span>긴 침묵</span><span>{firstResult.longSilence}회</span><span>{secondResult.longSilence}회</span><span>반복 표현</span><span>{firstResult.repeatedExpressions}회</span><span>{secondResult.repeatedExpressions}회</span></div></section>
        <section className="accordion"><button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded}>달라진 점 확인하기 <span>{isExpanded ? "▲" : "▼"}</span></button>{isExpanded && <div className="accordion-content"><p>긴 침묵이 {firstResult.longSilence}회에서 {secondResult.longSilence}회로 줄었어요.</p><p>반복 표현이 {firstResult.repeatedExpressions}회에서 {secondResult.repeatedExpressions}회로 줄었어요.</p><p>말하기 속도는 {firstResult.speakingRate}에서 {secondResult.speakingRate} 음절/분으로 변화했어요.</p></div>}</section>
        <button className="flow-primary-button" type="button" onClick={onReturnHome}>첫 화면으로 돌아가기</button>
      </section></main>
    </div>
  );
}

export default ComparisonPage;
