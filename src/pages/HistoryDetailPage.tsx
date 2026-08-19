import { AppHeader } from "../navigation";
import type { PracticeHistoryItem } from "../mocks/practiceHistoryMock";
import "../styles/history-page.css";

function HistoryDetailPage({ item, onBack }: { item: PracticeHistoryItem; onBack: () => void }) {
  const isComparison = item.resultType === "comparison" && item.attempt2Metrics && item.attempt2Transcript;
  return (
    <div className="history-page">
      <AppHeader />
      <main className="history-main">
        <section className="flow-card history-detail-card">
          <p className="flow-eyebrow">{item.status}</p>
          <h1>연습 결과</h1>
          <div className="history-detail-question"><span>질문</span><strong>{item.question}</strong><small>{item.practicedAt}</small></div>

          {isComparison ? <>
            <section className="history-detail-section"><h2>1차 답변</h2><p className="history-transcript">{item.attempt1Transcript}</p></section>
            <section className="history-detail-section"><h2>2차 답변</h2><p className="history-transcript second-answer">{item.attempt2Transcript}</p></section>
            <section className="history-detail-section"><h2>1차 / 2차 분석 결과</h2><div className="history-metrics"><Metric label="말하기 속도" value={`${item.attempt1Metrics.speakingRate} → ${item.attempt2Metrics!.speakingRate} 음절/분`} /><Metric label="긴 침묵" value={`${item.attempt1Metrics.longSilence} → ${item.attempt2Metrics!.longSilence}회`} /><Metric label="반복 표현" value={`${item.attempt1Metrics.repeatedExpressions} → ${item.attempt2Metrics!.repeatedExpressions}회`} /></div></section>
            <section className="history-detail-section"><h2>달라진 점</h2><div className="history-change-list">{item.changes?.map((change) => <p key={change}>{change}</p>)}</div></section>
          </> : <>
            <section className="history-detail-section"><h2>내 답변</h2><p className="history-transcript">{item.attempt1Transcript}</p></section>
            <section className="history-detail-section"><h2>1차 분석 결과</h2><div className="history-metrics"><Metric label="말하기 속도" value={`${item.attempt1Metrics.speakingRate} 음절/분`} /><Metric label="긴 침묵" value={`${item.attempt1Metrics.longSilence}회`} /><Metric label="반복 표현" value={`${item.attempt1Metrics.repeatedExpressions}회`} /></div></section>
            <section className="history-detail-section"><h2>다음 연습에서 바꿔볼 점</h2><div className="history-change-list">{item.feedback.slice(0, 2).map((feedback) => <p key={feedback}>{feedback}</p>)}</div></section>
          </>}

          <button className="flow-primary-button" type="button" onClick={onBack}>결과로 돌아가기</button>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

export default HistoryDetailPage;
