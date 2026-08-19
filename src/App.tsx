import { useState } from "react";
import PracticePage from "./pages/PracticePage";
import RecordingPage from "./pages/RecordingPage";
import type { PracticeQuestion } from "./pages/PracticePage";
import AnalysisPage from "./pages/AnalysisPage";
import ResultPage from "./pages/ResultPage";
import ComparisonPage from "./pages/ComparisonPage";
import AuthPage from "./pages/AuthPage";
import HistoryPage from "./pages/HistoryPage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import HistoryResultPage from "./pages/HistoryResultPage";
import { MOCK_COACH_AUDIO_STATE, MOCK_LOGGED_IN, type AnalysisResult } from "./mocks/analysisMock";
import { NavigationProvider, type AppDestination } from "./navigation";
import type { PracticeHistoryItem } from "./mocks/practiceHistoryMock";
import { MOCK_ERROR_STATE } from "./mocks/errorStateMock";

type AppScreen = "practice" | "recording" | "analysis" | "result" | "rerecord-ready" | "comparison" | "history" | "history-result" | "history-detail" | "auth";

function App() {
  const [screen, setScreen] = useState<AppScreen>("practice");
  const [isLoggedIn, setIsLoggedIn] = useState(MOCK_LOGGED_IN);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [attemptNo, setAttemptNo] = useState<1 | 2>(1);
  const [firstResult, setFirstResult] = useState<AnalysisResult | null>(null);
  const [secondResult, setSecondResult] = useState<AnalysisResult | null>(null);
  const [historyDetail, setHistoryDetail] = useState<PracticeHistoryItem | null>(null);
  const analysisLoggedIn = isLoggedIn && MOCK_ERROR_STATE !== "auth-required-analysis";
  const historyLoggedIn = isLoggedIn && MOCK_ERROR_STATE !== "auth-required-history";

  const handlePracticeStart = (selectedQuestion: PracticeQuestion) => {
    setQuestion(selectedQuestion);
    setAttemptNo(1);
    setFirstResult(null);
    setSecondResult(null);
    setScreen("recording");
  };

  const handleAnalysisRequest = (requestedAttempt: 1 | 2) => {
    setAttemptNo(requestedAttempt);
    setScreen("analysis");
  };

  const navigate = (destination: AppDestination) => {
    setScreen(destination);
    if (destination === "practice") {
      setQuestion(null);
      setFirstResult(null);
      setSecondResult(null);
      setAttemptNo(1);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    navigate("practice");
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    if (result.attemptNo === 1) {
      setFirstResult(result);
      setScreen("result");
    } else {
      setSecondResult(result);
      setScreen("comparison");
    }
  };

  const returnHome = () => {
    setQuestion(null);
    setAttemptNo(1);
    setFirstResult(null);
    setSecondResult(null);
    setHistoryDetail(null);
    setScreen("practice");
  };

  const renderScreen = () => {
    if (screen === "history") return <HistoryPage isLoggedIn={historyLoggedIn} onLogin={() => setScreen("auth")} onStartPractice={() => navigate("practice")} onView={(item) => { setHistoryDetail(item); setScreen("history-result"); }} />;
    if (screen === "history-result" && historyDetail) return <HistoryResultPage item={historyDetail} onDetail={() => setScreen("history-detail")} onBack={() => setScreen("history")} />;
    if (screen === "history-detail" && historyDetail) return <HistoryDetailPage item={historyDetail} onBack={() => setScreen("history-result")} />;
    if (screen === "auth") return <AuthPage onSuccess={() => { setIsLoggedIn(true); setScreen("practice"); }} />;
    if (question && screen === "recording") return <RecordingPage key={`recording-${attemptNo}`} question={question} attemptNo={attemptNo} isLoggedIn={analysisLoggedIn} onLogin={() => setScreen("auth")} onAnalysis={handleAnalysisRequest} />;
    if (question && screen === "analysis") return <AnalysisPage question={question} attemptNo={attemptNo} isLoggedIn={analysisLoggedIn} onLogin={() => setScreen("auth")} onBack={() => setScreen("recording")} onComplete={handleAnalysisComplete} />;
    if (question && screen === "result" && firstResult) return <ResultPage question={question} result={firstResult} coachAudioState={MOCK_COACH_AUDIO_STATE} onRerecord={() => { setAttemptNo(2); setScreen("rerecord-ready"); }} />;
    if (question && screen === "rerecord-ready") return <RecordingPage key="rerecord-ready" question={question} attemptNo={2} isRerecord coachAudioState={MOCK_COACH_AUDIO_STATE} isLoggedIn={analysisLoggedIn} onLogin={() => setScreen("auth")} onAnalysis={handleAnalysisRequest} />;
    if (question && screen === "comparison" && firstResult && secondResult) return <ComparisonPage question={question} firstResult={firstResult} secondResult={secondResult} onReturnHome={returnHome} />;
    return <PracticePage onRecordingReady={handlePracticeStart} />;
  };

  const active: AppDestination = screen === "history" || screen === "history-result" || screen === "history-detail" ? "history" : screen === "auth" ? "auth" : "practice";
  return <NavigationProvider active={active} isLoggedIn={isLoggedIn} navigate={navigate} logout={logout}>{renderScreen()}</NavigationProvider>;
}

export default App;
