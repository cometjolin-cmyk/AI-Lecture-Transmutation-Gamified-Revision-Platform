import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, saveUserProfile, fetchUserProfile, signInWithGooglePopup } from "../firebaseUtils";
import { UserProfile } from "../types";
import { translations, Language } from "../translations";

interface AdventureLogInnProps {
  onLoginSuccess: (user: any, profile: UserProfile) => void;
  onEnterGuest: () => void;
  lang?: Language;
  onLangToggle?: () => void;
}

export default function AdventureLogInn({
  onLoginSuccess,
  onEnterGuest,
  lang = "zh",
  onLangToggle
}: AdventureLogInnProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText(lang === "zh" ? "請提供電子郵件或密鑰！" : "Provide email & key!");
      return;
    }
    setLoading(true);
    setErrorText("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Load or create User profile
      let profile = await fetchUserProfile(user.uid);
      if (!profile) {
        profile = {
          uid: user.uid,
          email: user.email || "",
          level: 1,
          xp: 0,
          totalQuizzes: 0,
          correctAnswers: 0,
          winRate: 0
        };
        await saveUserProfile(profile);
      }

      setSuccessMsg(lang === "zh" ? "歡迎歸來，勇者！正在召喚您的雲端冒險存檔..." : "Welcome back, Hero! Loading your cloud save data...");
      setTimeout(() => {
        onLoginSuccess(user, profile!);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorText(lang === "zh" ? "無此勇者紀錄或密碼不合！" : "INCORRECT HERO RECORDS!");
      } else if (err.code === "auth/invalid-credential") {
        setErrorText(lang === "zh" ? "認證密法或驗證失敗！" : "BAD AUTHENTICATION KEY!");
      } else if (err.code === "auth/operation-not-allowed") {
        setErrorText(lang === "zh" 
          ? "【未啟用登入方式】Email/Password 註冊登入功能尚未在您的 Firebase Console 啟用。請前往 Firebase 控制台的 Authentication -> Sign-in method 啟用「電子郵件/密碼」認證，或改用上方「Google 登入」/「單機離線快速試玩」即可立即載入！" 
          : "【AUTH NOT ENABLED】Email/Password Sign-In is disabled in your Firebase console. Please go to Firebase Console -> Authentication -> Sign-in method and enable 'Email/Password', or use 'Google Login' / 'Offline Guest Mode' to proceed!"
        );
      } else {
        setErrorText(lang === "zh" ? "召喚失敗：請在 Firebase 控制台確認 Email 授權！" : "EXPEDITION FAILED: Enable Email authentication under console if disabled!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText(lang === "zh" ? "請填寫信箱與預設密鑰！" : "Need email & credential!");
      return;
    }
    if (password.length < 6) {
      setErrorText(lang === "zh" ? "密法需大於 6 位元字元！" : "Password must be >= 6 chars!");
      return;
    }
    setLoading(true);
    setErrorText("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        level: 1,
        xp: 0,
        totalQuizzes: 0,
        correctAnswers: 0,
        winRate: 0,
        updatedAt: new Date().toISOString()
      };

      await saveUserProfile(newProfile);
      setSuccessMsg(lang === "zh" ? "全新角色註冊成功！歡迎進入學院學科裂隙。" : "Welcome to the Realm! Creating your character...");
      setTimeout(() => {
        onLoginSuccess(user, newProfile);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorText(lang === "zh" ? "此勇者郵件帳號已被佔用！" : "HERO ALREADY REGISTERED!");
      } else if (err.code === "auth/invalid-email") {
        setErrorText(lang === "zh" ? "無效的郵件格式編纂！" : "INVALID EMAIL STRUCTURE!");
      } else if (err.code === "auth/operation-not-allowed") {
        setErrorText(lang === "zh" 
          ? "【未啟用登入方式】Email/Password 註冊登入功能尚未在您的 Firebase Console 啟用。請前往 Firebase 控制台的 Authentication -> Sign-in method 啟用「電子郵件/密碼」認證，或改用上方「Google 登入」/「單機離線快速試玩」即可立即載入！" 
          : "【AUTH NOT ENABLED】Email/Password Sign-In is disabled in your Firebase console. Please go to Firebase Console -> Authentication -> Sign-in method and enable 'Email/Password', or use 'Google Login' / 'Offline Guest Mode' to proceed!"
        );
      } else {
        setErrorText(lang === "zh" ? "註冊受阻，請聯絡管理員確認 Firebase 專案規則。" : "SIGNUP BLOCKED: Check rules or Firebase Email Auth setup.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorText("");
    try {
      const userCredential = await signInWithGooglePopup();
      const user = userCredential.user;

      let profile = await fetchUserProfile(user.uid);
      if (!profile) {
        profile = {
          uid: user.uid,
          email: user.email || "",
          level: 1,
          xp: 20, // Start bonus
          totalQuizzes: 0,
          correctAnswers: 0,
          winRate: 0,
          updatedAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      }

      setSuccessMsg(lang === "zh" ? "Google 認證連線成功！加載學術裂隙空間..." : "Welcome back, Hero! Loading your cloud save data...");
      setTimeout(() => {
        onLoginSuccess(user, profile!);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorText(lang === "zh" ? "GOOGLE 登錄遭強行偏折阻斷" : "GOOGLE ATTEMPT INTERRUPTED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-2 bg-[#D3D3D3] retro-double-border p-4 md:p-5 retro-shadow relative text-black">
      {/* Visual background scanning layer */}
      <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>

      {/* Top Language Toggle in login gate */}
      {onLangToggle && (
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={onLangToggle}
            className="px-1.5 py-0.5 border border-black bg-white hover:bg-black hover:text-white font-press-start text-[6px] tracking-tight"
          >
            🌐 {lang === "en" ? "繁中" : "EN"}
          </button>
        </div>
      )}

      {/* Hero Badge */}
      <div className="flex justify-center mb-3">
        <div className="bg-black text-white font-press-start text-[7px] px-2 py-0.5 retro-border">
          {lang === "zh" ? "冒險登入旅店" : "ADVENTURE LOG INN"}
        </div>
      </div>

      <div className="text-center mb-4 border-b-4 border-black pb-3">
        <h1 className="font-press-start text-[9px] md:text-xs leading-relaxed text-black animate-pulse">
          {lang === "zh" ? "⚔️ 級怪獸「期末考」逼近！ ⚔️" : "⚔️ WILD FINAL EXAM APPROACHING! ⚔️"}
        </h1>
        <p className="font-mono text-[11px] mt-1 text-[#505050] uppercase leading-relaxed">
          {lang === "zh" ? "安全綁定帳號以保存您的各科冒險軌跡與英雄等級 EXP。" : "Connect your account to save your academic campaign and EXP level in the cloud."}
        </p>
      </div>

      {/* Feedback Message */}
      {errorText && (
        <div className="bg-white border-2 border-black p-2 mb-3 text-center">
          <p className="font-press-start text-[7px] text-red-600 block">❌ {errorText}</p>
        </div>
      )}

      {successMsg ? (
        <div className="bg-white border-4 border-black p-4 text-center my-4">
          <p className="font-press-start text-[8px] animate-pulse text-black leading-relaxed">
            {successMsg}
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <span className="w-1.5 h-1.5 bg-black animate-ping"></span>
            <span className="w-1.5 h-1.5 bg-black animate-ping delay-100"></span>
            <span className="w-1.5 h-1.5 bg-black animate-ping delay-200"></span>
          </div>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="pb-2 border-b border-black mb-1.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full font-press-start border-4 border-black bg-white hover:bg-black text-black hover:text-white active:bg-black active:text-white transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[7px] py-2.5 px-3 flex items-center justify-center gap-1 font-bold uppercase tracking-tight focus:outline-none select-none"
            >
              🌐 ▶ CONNECT VIA GOOGLE (Google 傳送陣)
            </button>
          </div>

          <div>
            <label className="block font-press-start text-[7px] mb-1.5 text-gray-700">{lang === "zh" ? "信信投遞地址 (EMAIL):" : "EMAIL ADDRESS:"}</label>
            <input
              type="email"
              placeholder="HERO@EMAIL.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full h-9 px-2 font-mono text-xs bg-white border-2 border-black outline-none uppercase"
            />
          </div>

          <div>
            <label className="block font-press-start text-[7px] mb-1.5 text-gray-700">{lang === "zh" ? "防護暗號密鑰 (PASSWORD):" : "SECRET PASSCODE:"}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full h-9 px-2 font-mono text-xs bg-white border-2 border-black outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="font-press-start border border-black retro-btn text-[7px] py-2 bg-white hover:bg-black text-black hover:text-white transition-all active:scale-95 text-center leading-normal"
            >
              ▶ {lang === "zh" ? "創建角色" : "NEW GAME"}
            </button>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="font-press-start border border-black retro-btn text-[7px] py-2 bg-white hover:bg-black text-black hover:text-white transition-all active:scale-95 text-center leading-normal"
            >
              ▶ {lang === "zh" ? "讀取紀錄" : "CONTINUE"}
            </button>
          </div>

          {/* Alternative options divider */}
          <div className="flex items-center my-3">
            <div className="h-0.5 bg-black flex-1"></div>
            <span className="mx-2 font-press-start text-[6px] text-[#707070] uppercase">{lang === "zh" ? "或快速探索" : "OR QUICK EXPLORE"}</span>
            <div className="h-0.5 bg-black flex-1"></div>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onEnterGuest}
              disabled={loading}
              className="w-full font-press-start text-[7px] border-2 border-black text-white bg-black py-1.5 hover:bg-white hover:text-black transition-all"
            >
              ▶ {lang === "zh" ? "單機離線快速試玩" : "OFFLINE GUEST STRATEGY"}
            </button>
          </div>
        </form>
      )}

      {/* Footer RPG message */}
      <div className="mt-4 border-t border-black/10 font-press-start text-[5px] text-center text-[#707070] pt-3 leading-loose">
        {lang === "zh" ? "內部虛擬機 6.0 // FIREBASE 雲端架構保護" : "VER 6.0 // GOOGLE FIREBASE CLOUD ENCRYPTED"}
      </div>
    </div>
  );
}
