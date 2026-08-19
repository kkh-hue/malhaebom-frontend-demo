import { useState } from "react";
import { AppHeader } from "../navigation";
import { MOCK_PRACTICE_HISTORY, type PracticeHistoryItem } from "../mocks/practiceHistoryMock";
import "../styles/history-page.css";
import { MOCK_ERROR_STATE } from "../mocks/errorStateMock";

type HistoryPageProps = { isLoggedIn: boolean; onLogin: () => void; onStartPractice: () => void; onView: (item: PracticeHistoryItem) => void };

function HistoryPage({ isLoggedIn, onLogin, onStartPractice, onView }: HistoryPageProps) {
  const [items, setItems] = useState(MOCK_PRACTICE_HISTORY);
  const [deleteTarget, setDeleteTarget] = useState<string | "all" | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const confirmDelete = () => { if (MOCK_ERROR_STATE === "history-delete-failed") { setDeleteTarget(null); setDeleteError(true); return; } if (deleteTarget === "all") setItems([]); else if (deleteTarget) setItems((current) => current.filter((item) => item.id !== deleteTarget)); setDeleteTarget(null); };
  if (isLoggedIn && MOCK_ERROR_STATE === "history-load-failed") return <div className="history-page"><AppHeader /><main className="history-main"><section className="flow-card history-empty-card"><p className="flow-eyebrow">연습 기록</p><h1>연습 기록을 불러오지 못했어요.</h1><p>잠시 후 다시 시도해 주세요.</p><button className="flow-primary-button" type="button" onClick={() => console.log("[말해봄 mock] 기록 다시 불러오기")}>다시 불러오기</button></section></main></div>;
  return (
    <div className="history-page"><AppHeader /><main className="history-main">
      {!isLoggedIn ? <section className="flow-card history-empty-card"><p className="flow-eyebrow">연습 기록</p><h1>연습 기록을 확인하려면 로그인이 필요해요.</h1><p>로그인 후 연습 기록을 확인할 수 있어요.</p><button className="flow-primary-button" type="button" onClick={onLogin}>로그인하기</button></section> : <>
        <p className="flow-eyebrow">연습 기록</p><h1>지금까지 연습한 답변을 확인해 보세요.</h1><p className="history-description">연습 기록은 생성 후 최대 24시간 동안 보관돼요.</p>
        {items.length > 0 && <div className="history-toolbar"><span>{items.length}개의 기록</span><button className="text-danger-button" type="button" onClick={() => setDeleteTarget("all")}>전체 삭제</button></div>}
        {items.length > 0 ? <div className="history-list">{items.map((item) => <article className="history-item" key={item.id}><div><span className="history-status">{item.status}</span><h2>{item.question}</h2><p>{item.practicedAt}</p></div><div className="history-actions"><button className="history-view-button" type="button" onClick={() => onView(item)}>결과 보기</button><button className="history-delete-button" type="button" onClick={() => setDeleteTarget(item.id)}>삭제</button></div></article>)}</div> : <section className="flow-card history-empty-card"><h2>아직 연습 기록이 없어요.</h2><p>면접 질문을 골라 첫 연습을 시작해 보세요.</p><button className="flow-primary-button" type="button" onClick={onStartPractice}>연습 시작하기</button></section>}
      </>}
    </main>
    {deleteTarget && <div className="confirm-backdrop"><div className="confirm-card"><h2>{deleteTarget === "all" ? "모든 연습 기록을 삭제할까요?" : "이 연습 기록을 삭제할까요?"}</h2><p>삭제한 기록은 다시 복구할 수 없어요.</p><div><button className="history-view-button" type="button" onClick={() => setDeleteTarget(null)}>취소</button><button className="history-delete-button" type="button" onClick={confirmDelete}>{deleteTarget === "all" ? "전체 삭제" : "삭제하기"}</button></div></div></div>}
    {deleteError && <div className="confirm-backdrop"><div className="confirm-card"><h2>연습 기록을 삭제하지 못했어요.</h2><p>잠시 후 다시 시도해 주세요.</p><button className="history-view-button" type="button" onClick={() => setDeleteError(false)}>확인</button></div></div>}
    </div>
  );
}

export default HistoryPage;
