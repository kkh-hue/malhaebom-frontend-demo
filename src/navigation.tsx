import { createContext, useContext, useState, type ReactNode } from "react";
const logoImage = "/malhaebom-detail-logo.png";

export type AppDestination = "practice" | "history" | "auth";
type NavigationContextValue = { active: AppDestination; isLoggedIn: boolean; navigate: (destination: AppDestination) => void; logout: () => void };

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ active, isLoggedIn, navigate, logout, children }: NavigationContextValue & { children: ReactNode }) {
  return <NavigationContext.Provider value={{ active, isLoggedIn, navigate, logout }}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const value = useContext(NavigationContext);
  if (!value) throw new Error("NavigationProvider is missing");
  return value;
}

export function AppHeader() {
  const { active, isLoggedIn, navigate, logout } = useNavigation();
  const [accountOpen, setAccountOpen] = useState(false);
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => navigate("practice")} aria-label="말해봄 홈"><img className="brand-logo-image" src={logoImage} alt="말해봄" /></button>
      <nav className="site-nav" aria-label="주요 메뉴">
        <button className={active === "practice" ? "nav-link is-active" : "nav-link"} type="button" onClick={() => navigate("practice")}>연습하기</button>
        <button className={active === "history" ? "nav-link is-active" : "nav-link"} type="button" onClick={() => navigate("history")}>연습 기록</button>
        {isLoggedIn ? <div className="account-menu"><button className="login-button" type="button" onClick={() => setAccountOpen((open) => !open)}>내 계정</button>{accountOpen && <div className="account-popover"><button type="button" onClick={() => { setAccountOpen(false); logout(); }}>로그아웃</button></div>}</div> : <button className="login-button" type="button" onClick={() => navigate("auth")}>로그인/회원가입</button>}
      </nav>
    </header>
  );
}
