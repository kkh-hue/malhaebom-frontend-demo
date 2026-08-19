import { useState } from "react";
import { AppHeader } from "../navigation";
import "../styles/account-pages.css";
import { MOCK_ERROR_STATE } from "../mocks/errorStateMock";

type AuthPageProps = { onSuccess: () => void };
type AuthMode = "login" | "signup";

function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const emailInvalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);
  const errors = {
    email: !email.trim() ? "이메일을 입력해 주세요." : emailInvalid ? "이메일 형식을 확인해 주세요." : "",
    password: !password ? "비밀번호를 입력해 주세요." : mode === "signup" && password.length < 8 ? "비밀번호는 8자 이상 입력해 주세요." : "",
    passwordConfirm: mode === "signup" && passwordConfirm !== password ? "비밀번호가 일치하지 않아요." : "",
  };
  const isValid = !errors.email && !errors.password && (mode === "login" || !errors.passwordConfirm);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    if (mode === "login" && MOCK_ERROR_STATE === "login-failed") { setServerError("이메일과 비밀번호를 확인해 주세요."); return; }
    if (mode === "signup" && MOCK_ERROR_STATE === "signup-failed") { setServerError("회원가입을 완료하지 못했어요. 다시 시도해 주세요."); return; }
    if (mode === "signup" && MOCK_ERROR_STATE === "signup-email-exists") { setServerError("이미 가입된 이메일이에요. 로그인해 주세요."); return; }
    console.log(`[말해봄 mock] ${mode === "login" ? "로그인" : "회원가입"} 성공`, { email });
    onSuccess();
  };

  const changeMode = (nextMode: AuthMode) => { setMode(nextMode); setSubmitted(false); setServerError(""); setPasswordConfirm(""); };
  return (
    <div className="account-page"><AppHeader /><main className="account-main"><section className="account-card">
      <div className="auth-tabs"><button className={mode === "login" ? "auth-tab is-active" : "auth-tab"} type="button" onClick={() => changeMode("login")}>로그인</button><button className={mode === "signup" ? "auth-tab is-active" : "auth-tab"} type="button" onClick={() => changeMode("signup")}>회원가입</button></div>
      <form onSubmit={submit} noValidate>
        <label htmlFor="auth-email">이메일</label><input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일을 입력해 주세요." />{submitted && errors.email && <span className="field-error">{errors.email}</span>}
        <label htmlFor="auth-password">비밀번호</label><input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호를 입력해 주세요." />{submitted && errors.password && <span className="field-error">{errors.password}</span>}
        {mode === "signup" && <><label htmlFor="auth-password-confirm">비밀번호 확인</label><input id="auth-password-confirm" type="password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} placeholder="비밀번호를 다시 입력해 주세요." />{submitted && errors.passwordConfirm && <span className="field-error">{errors.passwordConfirm}</span>}</>}
        {serverError && <span className="field-error server-error">{serverError}</span>}<button className="flow-primary-button" type="submit">{mode === "login" ? "로그인" : "회원가입"}</button>
      </form>
      <button className="auth-switch" type="button" onClick={() => changeMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "아직 계정이 없나요? 회원가입" : "이미 계정이 있나요? 로그인"}</button>
    </section></main></div>
  );
}

export default AuthPage;
