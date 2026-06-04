import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  auth,
  fetchUserProfile,
  saveUserProfile,
  fetchUserSaves,
  saveLectureSlot,
  deleteLectureSlot,
  fetchWrongQuizzes,
  saveWrongQuiz,
  deleteWrongQuiz
} from "./firebaseUtils";
import { UserProfile, SaveSlot, LectureRPGData, WrongQuiz } from "./types";
import { mockLectureSaves } from "./mockData";
import { translations, Language } from "./translations";

// Sub components
import AdventureLogInn from "./components/AdventureLogInn";
import MainControlPanel from "./components/MainControlPanel";
import AlchemistChamber from "./components/AlchemistChamber";
import LootHub from "./components/LootHub";
import LoadGame from "./components/LoadGame";
import { AvatarDressingRoom, RenderAvatar, RenderBorder } from "./components/AvatarDressingRoom";

export default function App() {
  // Locale State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("rpg_language") as Language) || "zh";
  });

  // Auth state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  // App layouts / slots
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [activeSaveId, setActiveSaveId] = useState<string | undefined>(undefined);
  const [activeRPGData, setActiveRPGData] = useState<LectureRPGData | null>(null);
  const [wrongQuizzes, setWrongQuizzes] = useState<WrongQuiz[]>([]);
  const [showWrongQuizzesModal, setShowWrongQuizzesModal] = useState(false);

  // 3-Tier State Navigation State Engine
  const [currentScreen, setCurrentScreen] = useState<'lobby' | 'active_dungeon' | 'new_alchemy'>('lobby');
  const [activeModal, setActiveModal] = useState<'summary' | 'keynotes' | 'quiz_battle' | 'wrong_book' | 'new_document' | 'new_youtube' | 'new_audio' | 'new_text' | null>(null);

  // Processing triggers
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Global system diagnostics
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [useLocalStorageFallback, setUseLocalStorageFallback] = useState(false);

  // Gamification & Avatar Dressing Space
  const [showDressingRoom, setShowDressingRoom] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);

  // Monitor offline statuses
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch Cloud Profile
          let profile = await fetchUserProfile(user.uid);
          if (!profile) {
            profile = {
              uid: user.uid,
              email: user.email || "hero@academicrpg.com",
              level: 1,
              xp: 0,
              totalQuizzes: 0,
              correctAnswers: 0,
              winRate: 0,
              selectedAvatar: "Hero",
              selectedBorder: "Simple Frame"
            };
            await saveUserProfile(profile);
          } else {
            if (!profile.selectedAvatar) profile.selectedAvatar = "Hero";
            if (!profile.selectedBorder) profile.selectedBorder = "Simple Frame";
          }
          setUserProfile(profile);

          // Fetch saves
          const list = await fetchUserSaves(user.uid);
          if (list) {
            setSaves(list);
            // Default select first save if present
            if (list.length > 0) {
              loadSaveData(list[0]);
            }
          }

          // Fetch wrong quizzes
          const wrongList = await fetchWrongQuizzes(user.uid);
          if (wrongList) {
            setWrongQuizzes(wrongList);
          } else {
            loadLocalStorageWrongQuizzes(user.uid);
          }
        } catch (err) {
          console.error("Firebase startup issue:", err);
          setUseLocalStorageFallback(true);
          // Fallback to local variables if connection errors occur
          loadLocalStorageSaves(user.uid, user.email || "");
          loadLocalStorageWrongQuizzes(user.uid);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        if (!guestMode) {
          setSaves([]);
          setActiveSaveId(undefined);
          setActiveRPGData(null);
          setWrongQuizzes([]);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [guestMode]);

  const loadLocalStorageWrongQuizzes = (uid: string) => {
    const key = `rpg_wrong_${uid}`;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        setWrongQuizzes(JSON.parse(value));
      } catch (e) {
        setWrongQuizzes([]);
      }
    } else {
      setWrongQuizzes([]);
    }
  };

  // Load saves from LocalStorage (Offline or Guest fallback)
  const loadLocalStorageSaves = (uid: string, email: string) => {
    const localProfileKey = `rpg_profile_${uid}`;
    const localSavesKey = `rpg_saves_${uid}`;

    // Read profile
    const savedProf = localStorage.getItem(localProfileKey);
    let profileData: UserProfile;
    if (savedProf) {
      profileData = JSON.parse(savedProf);
      if (!profileData.selectedAvatar) profileData.selectedAvatar = "Hero";
      if (!profileData.selectedBorder) profileData.selectedBorder = "Simple Frame";
    } else {
      profileData = {
        uid,
        email,
        level: 1,
        xp: 0,
        totalQuizzes: 0,
        correctAnswers: 0,
        winRate: 0,
        selectedAvatar: "Hero",
        selectedBorder: "Simple Frame"
      };
      localStorage.setItem(localProfileKey, JSON.stringify(profileData));
    }
    setUserProfile(profileData);

    // Read Saves
    const savedSavesValue = localStorage.getItem(localSavesKey);
    if (savedSavesValue) {
      const list = JSON.parse(savedSavesValue);
      setSaves(list);
      if (list.length > 0) {
        loadSaveData(list[0]);
      }
    } else {
      // Seed initial dummy saves so guest experience works instantly
      const seedSaves: SaveSlot[] = [
        {
          id: "seed_1",
          user_id: uid,
          title: "OS_PROC_DUNGEON",
          created_at: new Date().toISOString(),
          text_summary: JSON.stringify(mockLectureSaves.saves_1.summary),
          keynotes_json: JSON.stringify(mockLectureSaves.saves_1.keynotes),
          quiz_json: JSON.stringify(mockLectureSaves.saves_1.quiz),
          win_rate: 92
        },
        {
          id: "seed_2",
          user_id: uid,
          title: "CRYP_RSA_TEMPLE",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          text_summary: JSON.stringify(mockLectureSaves.saves_2.summary),
          keynotes_json: JSON.stringify(mockLectureSaves.saves_2.keynotes),
          quiz_json: JSON.stringify(mockLectureSaves.saves_2.quiz),
          win_rate: 45
        }
      ];
      localStorage.setItem(localSavesKey, JSON.stringify(seedSaves));
      setSaves(seedSaves);
      loadSaveData(seedSaves[0]);
    }
  };

  // Triggers guest mode on button click
  const handleEnterGuestMode = () => {
    setGuestMode(true);
    setAuthLoading(false);
    loadLocalStorageSaves("guest_hero", "guest@academicrpg.com");
    loadLocalStorageWrongQuizzes("guest_hero");
  };

  const handleUpdateProfile = async (fieldsToUpdate: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...fieldsToUpdate,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updatedProfile);

    const saveUid = currentUser?.uid || "guest_hero";
    if (guestMode || isOffline || useLocalStorageFallback) {
      localStorage.setItem(`rpg_profile_${saveUid}`, JSON.stringify(updatedProfile));
    } else {
      try {
        await saveUserProfile(updatedProfile);
      } catch (e) {
        console.error("Failed saving profile stats:", e);
        localStorage.setItem(`rpg_profile_${saveUid}`, JSON.stringify(updatedProfile));
      }
    }
  };

  const handleDailyCheckIn = async () => {
    if (!userProfile) return;
    const today = new Date().toISOString().split("T")[0];
    if (userProfile.lastCheckIn === today) return;

    let nextLevel = userProfile.level || 1;
    let nextXp = (userProfile.xp || 0) + 20;
    let leveledUp = false;

    while (nextXp >= 35) {
      nextLevel += 1;
      nextXp -= 35;
      leveledUp = true;
    }

    const fields: Partial<UserProfile> = {
      lastCheckIn: today,
      xp: nextXp,
      level: nextLevel
    };

    await handleUpdateProfile(fields);

    const message = language === "zh"
      ? `您獲得了每日簽到獎勵！(+20 EXP)${leveledUp ? `\n\n🎉 等級提升！恭喜晉升為 LV ${nextLevel}！` : ""}`
      : `You received the Daily Check-in Gift! (+20 EXP)${leveledUp ? `\n\n🎉 LEVEL UP! You are now LV ${nextLevel}!` : ""}`;

    setCheckInMessage(message);
  };

  const handleIncorrectAnswer = async (question: any) => {
    const userId = currentUser ? currentUser.uid : "guest_hero";
    const newWrong: WrongQuiz = {
      id: `w_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      save_title: activeRPGData ? activeRPGData.title : "GENERAL_NOTES",
      question: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      created_at: new Date().toISOString()
    };

    const updated = [newWrong, ...wrongQuizzes];
    setWrongQuizzes(updated);

    if (currentUser && !isOffline && !useLocalStorageFallback) {
      try {
        await saveWrongQuiz(newWrong);
      } catch (err) {
        console.error("Failed to sync wrong quiz to cloud:", err);
      }
    }

    localStorage.setItem(`rpg_wrong_${userId}`, JSON.stringify(updated));
  };

  const handleDeleteWrongQuiz = async (quizId: string) => {
    const userId = currentUser ? currentUser.uid : "guest_hero";
    const updated = wrongQuizzes.filter((q) => q.id !== quizId);
    setWrongQuizzes(updated);

    if (currentUser && !isOffline && !useLocalStorageFallback) {
      try {
        await deleteWrongQuiz(quizId);
      } catch (err) {
        console.error("Failed to sync delete wrong quiz to cloud:", err);
      }
    }

    localStorage.setItem(`rpg_wrong_${userId}`, JSON.stringify(updated));
  };

  const handleLoginSuccess = (user: any, profile: UserProfile) => {
    setGuestMode(false);
    setCurrentUser(user);
    setUserProfile(profile);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (guestMode) {
      setGuestMode(false);
      setUserProfile(null);
      setSaves([]);
      setActiveRPGData(null);
      setActiveSaveId(undefined);
    } else {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Decode JSON from SaveSlot row into LectureRPGData state
  const loadSaveData = (slot: SaveSlot, currentLang: Language = language) => {
    try {
      let title = slot.title;
      let summary = JSON.parse(slot.text_summary);
      let keynotes = JSON.parse(slot.keynotes_json);
      let quiz = JSON.parse(slot.quiz_json);

      // Dynamically load the correct language variant for static demo content
      if (slot.id === "seed_1") {
        const source = currentLang === "zh" ? mockLectureSaves.saves_1_zh : mockLectureSaves.saves_1;
        title = source.title;
        summary = source.summary;
        keynotes = source.keynotes;
        quiz = source.quiz;
      } else if (slot.id === "seed_2") {
        const source = currentLang === "zh" ? mockLectureSaves.saves_2_zh : mockLectureSaves.saves_2;
        title = source.title;
        summary = source.summary;
        keynotes = source.keynotes;
        quiz = source.quiz;
      }

      const parsedData: LectureRPGData = {
        title,
        summary,
        keynotes,
        quiz
      };
      setActiveRPGData(parsedData);
      setActiveSaveId(slot.id);
    } catch (err) {
      console.error("Failure decoding save:", err);
    }
  };

  // Keep active card sync'd when language is toggled mid-flight
  useEffect(() => {
    localStorage.setItem("rpg_language", language);
    if (activeSaveId) {
      const activeSlot = saves.find((s) => s.id === activeSaveId);
      if (activeSlot) {
        loadSaveData(activeSlot, language);
      }
    }
  }, [language, saves]);

  // Submit trigger
  const handleProcessLecture = async (config: {
    type: "audio" | "document" | "youtube" | "text";
    payload: string;
    fileName?: string;
    fileData?: string;
    difficulty?: "easy" | "hard";
  }) => {
    setIsProcessing(true);
    setProcessingError(null);

    if (!config.payload || config.payload.trim().length === 0) {
      setProcessingError(language === "zh"
        ? "【系統提示】傳送陣失效！請輸入有效的文字講義或確保文件已成功讀取。"
        : "【Platform Error】Transmutation matrix failed! Please enter valid lecture notes or make sure document is successfully read."
      );
      setIsProcessing(false);
      return;
    }

    // Immediately close the upload/input window modal so the player is shown the alchemy progress % chamber
    setActiveModal(null);

    // Dynamic timer fallback for processing feedback
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, lang: language })
      });

      if (!response.ok) {
        const errJson = await response.json();
        if (errJson.stack) {
          console.error("Transmutation Server Error Stack Trace:", errJson.stack);
        }
        throw new Error(errJson.error || "Bad status from transmutation backend");
      }

      const responseData: LectureRPGData = await response.json();

      // Forged Save object
      const uniqueId = `save_${Date.now()}`;
      const saveUid = currentUser?.uid || "guest_hero";

      const saveModel: SaveSlot = {
        id: uniqueId,
        user_id: saveUid,
        title: responseData.title || "LECTURE_DUNGEON",
        created_at: new Date().toISOString(),
        text_summary: JSON.stringify(responseData.summary),
        keynotes_json: JSON.stringify(responseData.keynotes),
        quiz_json: JSON.stringify(responseData.quiz),
        win_rate: 0
      };

      // Handle Storage Strategy (Cloud vs. LocalStorage)
      if (guestMode || isOffline || useLocalStorageFallback) {
        const localSavesKey = `rpg_saves_${saveUid}`;
        const currentLocal = localStorage.getItem(localSavesKey);
        const list = currentLocal ? JSON.parse(currentLocal) : [];
        const updatedList = [saveModel, ...list];
        localStorage.setItem(localSavesKey, JSON.stringify(updatedList));
        setSaves(updatedList);
      } else {
        try {
          await saveLectureSlot(saveModel);
          // Refresh Saves
          const list = await fetchUserSaves(saveUid);
          if (list) {
            setSaves(list);
          }
        } catch (dbErr) {
          console.warn("Cloud save failed, falling back to Local Storage:", dbErr);
          setUseLocalStorageFallback(true);
          const localSavesKey = `rpg_saves_${saveUid}`;
          const currentLocal = localStorage.getItem(localSavesKey);
          const list = currentLocal ? JSON.parse(currentLocal) : [];
          const updatedList = [saveModel, ...list];
          localStorage.setItem(localSavesKey, JSON.stringify(updatedList));
          setSaves(updatedList);
        }
      }

      setActiveRPGData(responseData);
      setActiveSaveId(uniqueId);
      setCurrentScreen("active_dungeon");
      setActiveModal(null);

    } catch (err: any) {
      console.error("Transmutation Client Error caught:", err);
      if (err.stack) {
        console.error("Client Error Stack Trace:", err.stack);
      }
      setProcessingError(err.message || " Transmutation failed. Check your API token details.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete saves
  const handleDeleteSave = async (id: string) => {
    const saveUid = currentUser?.uid || "guest_hero";
    try {
      if (guestMode || isOffline || useLocalStorageFallback) {
        const localSavesKey = `rpg_saves_${saveUid}`;
        const list = saves.filter((s) => s.id !== id);
        localStorage.setItem(localSavesKey, JSON.stringify(list));
        setSaves(list);
        if (activeSaveId === id) {
          setActiveRPGData(null);
          setActiveSaveId(undefined);
        }
      } else {
        try {
          await deleteLectureSlot(id);
          const list = await fetchUserSaves(saveUid);
          setSaves(list || []);
          if (activeSaveId === id) {
            setActiveRPGData(null);
            setActiveSaveId(undefined);
          }
        } catch (dbErr) {
          console.warn("Cloud delete failed, falling back to Local Storage:", dbErr);
          setUseLocalStorageFallback(true);
          const localSavesKey = `rpg_saves_${saveUid}`;
          const list = saves.filter((s) => s.id !== id);
          localStorage.setItem(localSavesKey, JSON.stringify(list));
          setSaves(list);
          if (activeSaveId === id) {
            setActiveRPGData(null);
            setActiveSaveId(undefined);
          }
        }
      }
    } catch (err) {
      console.error("Delete issue:", err);
    }
  };

  // Recalculates stats when user wins a quiz segment
  const handleScoreQuiz = async (winRate: number, correctCount: number) => {
    if (!userProfile) return;

    // Award +15 XP for completing, and +5 XP for each correct answer!
    const bonusXp = 15 + correctCount * 5;
    const nextTotal = userProfile.totalQuizzes + 1;
    const nextCorrect = userProfile.correctAnswers + correctCount;
    const nextWinRate = Math.round((nextCorrect / (nextTotal * 3)) * 100);

    let nextXp = userProfile.xp + bonusXp;
    let nextLevel = userProfile.level;

    // Standard level progression: 35 XP to level up
    if (nextXp >= 35) {
      nextLevel += 1;
      nextXp = nextXp - 35;
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      level: nextLevel,
      xp: nextXp,
      totalQuizzes: nextTotal,
      correctAnswers: nextCorrect,
      winRate: nextWinRate,
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile);

    // Save Updated Profile
    const saveUid = currentUser?.uid || "guest_hero";
    if (guestMode || isOffline || useLocalStorageFallback) {
      localStorage.setItem(`rpg_profile_${saveUid}`, JSON.stringify(updatedProfile));
    } else {
      try {
        await saveUserProfile(updatedProfile);
      } catch (e) {
        console.error("Failed saving profile stats:", e);
        setUseLocalStorageFallback(true);
        localStorage.setItem(`rpg_profile_${saveUid}`, JSON.stringify(updatedProfile));
      }
    }

    // Update current save's winrate performance records too
    if (activeSaveId) {
      const updatedSaves = saves.map((s) => {
        if (s.id === activeSaveId) {
          return { ...s, win_rate: winRate };
        }
        return s;
      });
      setSaves(updatedSaves);

      if (guestMode || isOffline || useLocalStorageFallback) {
        localStorage.setItem(`rpg_saves_${saveUid}`, JSON.stringify(updatedSaves));
      } else {
        const slotToUpdate = updatedSaves.find((s) => s.id === activeSaveId);
        if (slotToUpdate) {
          try {
            await saveLectureSlot(slotToUpdate);
          } catch (e) {
            console.error("Failed to update save winrate in cloud:", e);
            setUseLocalStorageFallback(true);
            localStorage.setItem(`rpg_saves_${saveUid}`, JSON.stringify(updatedSaves));
          }
        }
      }
    }
  };

  if (authLoading) {
    const isZh = language === "zh";
    // Pixel loading screen on system startup
    return (
      <div className="min-h-screen bg-[#D3D3D3] flex flex-col items-center justify-center text-black font-press-start p-6">
        <div className="border-4 border-black p-8 bg-white retro-shadow max-w-sm text-center relative">
          <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-20"></div>
          <span className="text-4xl animate-bounce block">🎮</span>
          <h2 className="text-xs uppercase mt-4 mb-2 tracking-widest leading-relaxed">
            {isZh ? "AI 學術冒險控制台" : "AI STUDY ADVENTURE"}
          </h2>
          <div className="w-full bg-[#EAEAEA] h-4 border-2 border-black p-0.5 mt-4 flex items-center">
            <div className="bg-black h-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-[7px] text-[#707070] uppercase mt-4 animate-pulse">
            {isZh ? "讀取存檔中 // 連接數位傳送通道..." : "READING SAVE CARDS // CONNECTING DIGITAL GATEWAYS..."}
          </p>
        </div>
      </div>
    );
  }

  const isUserLoggedIn = currentUser !== null || guestMode;

  return (
    <div className="min-h-screen bg-[#707070] text-black font-press-start p-2 md:p-6 flex flex-col items-center justify-start selection:bg-black selection:text-white pb-16">
      {/* 8-bit monochromatic scanlines layer covering the entire application screen */}
      <div className="fixed inset-0 screen-scanlines pointer-events-none opacity-5 z-50"></div>

      {/* Main Container framed as a vintage military-spec handheld portrait terminal shell */}
      <div className="w-full max-w-2xl bg-[#D3D3D3] border-4 md:border-8 border-black p-2 md:p-5 retro-shadow relative flex flex-col gap-4 mx-auto">
        
        {/* PHYSICAL CONSOLE HEADER BAR */}
        <div className="flex justify-between items-center border-b-4 border-black pb-2 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse border-2 border-black"></span>
            <span className="text-[6px] md:text-[8px] tracking-widest font-bold text-gray-800 font-press-start">
              {translations[language].system_status}
            </span>
          </div>
          <h1 className="text-[8px] md:text-[9px] text-black font-extrabold tracking-tight uppercase bg-white border-2 border-black px-1 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
            {translations[language].app_title}
          </h1>
        </div>

        {/* OFFLINE BACKEND WARNING TAPE */}
        {isOffline && (
          <div className="bg-black text-white border-4 border-black text-[7px] p-2 leading-none text-center animate-pulse">
            ⚠️ {translations[language].off_line_mode}
          </div>
        )}

        {/* SCREEN VIEWS */}
        {!isUserLoggedIn ? (
          <div className="w-full min-h-[480px] flex items-center justify-center bg-white border-4 border-black p-3 relative">
            <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>
            <AdventureLogInn
              onLoginSuccess={handleLoginSuccess}
              onEnterGuest={handleEnterGuestMode}
              lang={language}
              onLangToggle={() => setLanguage(language === "en" ? "zh" : "en")}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* BRANDING LOGO RAIL */}
            <div className="flex flex-col justify-between items-center border-b-4 border-black pb-3 select-none gap-2 bg-white p-3">
              <div className="text-center w-full">
                <h2 className="text-[10px] md:text-xs tracking-wide text-black uppercase font-bold">
                  {language === "zh" ? "⚔️ ACADEMIC COGNITION DUNGEON ⚔️" : "⚔️ ACADEMIC COGNITION DUNGEON ⚔️"}
                </h2>
                <p className="font-mono text-[9px] text-[#505050] mt-1 uppercase w-full">
                  {language === "zh" ? "兩階段學術提煉：將考題與知識點轉化為回合制刷題地下城！" : "2-phase academic smelting: transmute courses and files into turn-based dungeons!"}
                </p>
              </div>
              
              <div className="flex justify-between items-center w-full border-t border-black pt-2 text-[7px] font-bold">
                <div className="border border-black bg-[#EAEAEA] px-1.5 py-0.5">
                  {translations[language].platform}
                </div>
                <button
                  type="button"
                  onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                  className="px-2.5 py-0.5 bg-black text-white hover:bg-white hover:text-black hover:border-black border-2 border-black font-press-start active:scale-95 transition-all text-[7px]"
                >
                  🌐 {language === "en" ? "繁體中文" : "ENGLISH"}
                </button>
              </div>
            </div>

            {/* PROCESSING ERROR BOX */}
            {processingError && (
              <div className="bg-white border-4 border-black p-3 text-center">
                <p className="font-press-start text-[7px] text-red-600">❌ {translations[language].anomaly_error} {processingError}</p>
              </div>
            )}

            {/* MAIN LAYER SYSTEM CONTROLLER */}
            <div className="flex flex-col gap-4">
              
              {/* LOBBY SCREEN (Tier 1) */}
              {currentScreen === "lobby" && (
                <div className="space-y-4">
                  {/* Hero Specs top dashboard */}
                  <div className="bg-black text-white p-3 border-4 border-black font-press-start flex flex-col gap-3 shadow-[3px_3px_0px_rgba(0,0,0,1)] select-none">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                      {/* Profile Avatar and Info */}
                      <div className="flex items-center gap-3">
                        {/* Avatar Clickable to Dressing Room */}
                        <div 
                          onClick={() => setShowDressingRoom(true)}
                          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-75 text-black flex-shrink-0"
                          title={language === "zh" ? "點擊進入衣櫥更衣室" : "CLICK TO ENTER DRESSING ROOM"}
                        >
                          <RenderBorder border={userProfile?.selectedBorder || "Simple Frame"}>
                            <div className="w-11 h-11 flex items-center justify-center bg-stone-100">
                              <RenderAvatar avatar={userProfile?.selectedAvatar || "Hero"} className="w-9 h-9" />
                            </div>
                          </RenderBorder>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-white text-black px-1.5 py-0.5 text-[7px] font-extrabold border border-black leading-none pt-1">
                              LV {userProfile?.level || 1}
                            </span>
                            <span className="text-[9px] font-bold text-[#EAEAEA] uppercase truncate max-w-[120px] inline-block align-bottom leading-none pt-1">
                              {currentUser?.email?.split("@")[0] || "GUEST"}
                            </span>
                          </div>
                          <div className="text-[6.5px] text-gray-400 mt-1.5 leading-none">
                            WR {userProfile?.winRate || 0}% // CLASS: SPELLCASTER
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions side-by-side */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Daily Check-In Button */}
                        {(() => {
                          const today = new Date().toISOString().split("T")[0];
                          const claimed = userProfile?.lastCheckIn === today;
                          return (
                            <button
                              onClick={handleDailyCheckIn}
                              disabled={claimed}
                              className={`px-2 py-1.5 font-press-start text-[6px] md:text-[6.5px] border transition-all text-center select-none active:translate-y-0.5 cursor-pointer font-bold ${
                                claimed
                                  ? "bg-[#222] text-gray-500 border-gray-750 cursor-not-allowed opacity-80"
                                  : "bg-white text-black border-white hover:bg-black hover:text-white hover:border-white"
                              }`}
                            >
                              {claimed
                                ? (language === "zh" ? "▶ 今日已簽到" : "▶ CLAIMED")
                                : (language === "zh" ? "📅 [ CHECK-IN 簽到 ]" : "📅 [ CHECK-IN ]")}
                            </button>
                          );
                        })()}

                        <button
                          onClick={handleLogout}
                          className="px-2 py-1.5 bg-[#8b0000] text-white hover:bg-[#ff1a1a] transition-colors border border-red-800 text-[6px] md:text-[6.5px] flex items-center gap-1 active:translate-y-0.5 cursor-pointer font-bold font-press-start"
                        >
                          🚪 {language === "zh" ? "安全登出" : "EXIT_LOG"}
                        </button>
                      </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="w-full bg-[#111] border border-gray-800 p-0.5 relative">
                      <div 
                        className="bg-yellow-450 h-3.5 transition-all duration-500"
                        style={{ width: `${Math.min(100, (((userProfile?.xp || 0) % 35) / 35) * 100)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[6.5px] text-black font-extrabold uppercase mix-blend-difference">
                        XP {userProfile?.xp || 0} // NEXT LEVEL AT: 35
                      </div>
                    </div>
                  </div>

                  {/* Saves Database */}
                  <div className="bg-white border-4 border-black p-3">
                    <LoadGame
                      saves={saves}
                      activeSaveId={activeSaveId}
                      onSelectSave={(slot) => {
                        loadSaveData(slot);
                        setCurrentScreen("active_dungeon");
                      }}
                      onDeleteSave={handleDeleteSave}
                      onShowWrongQuizzes={() => setActiveModal("wrong_book")}
                      loading={authLoading}
                      lang={language}
                    />
                  </div>

                  {/* Create New Game CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentScreen("new_alchemy")}
                      type="button"
                      className="w-full font-press-start text-[10px] md:text-xs py-4 border-4 tracking-wider bg-white text-black hover:bg-black hover:text-white transition-all text-center flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 duration-100 font-extrabold uppercase border-black cursor-pointer leading-relaxed"
                    >
                      ➕ {language === "zh" ? "[開啟全新冒險副本]" : "➕ START NEW ADVENTURE"}
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE DUNGEON BATTLE PANELS (Tier 2-A) */}
              {currentScreen === "active_dungeon" && activeRPGData && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Header line to establish active dungeon context */}
                  <div className="border-4 border-black bg-[#EAEAEA] p-2.5 flex justify-between items-center relative select-none">
                    <span className="text-[9px] uppercase font-extrabold text-black font-press-start flex items-center gap-1.5 leading-none pt-0.5">
                      ⚔️ {language === "zh" ? "冒險學術副本進駐中" : "ACTIVE DUNGEON"}
                    </span>
                    <span className="text-[7.5px] bg-black text-white px-2 py-1 font-bold uppercase font-press-start truncate max-w-[200px]">
                      {activeRPGData.title}
                    </span>
                  </div>

                  {/* Immediate Integrated LootHub rendering directly on the main screen area */}
                  <LootHub
                    data={activeRPGData}
                    onQuizWin={handleScoreQuiz}
                    onIncorrectAnswer={handleIncorrectAnswer}
                    lang={language}
                    initialTab="summary"
                    wrongQuizzes={wrongQuizzes}
                    onDeleteWrongQuiz={handleDeleteWrongQuiz}
                  />

                  {/* Permanent Bottom B Button Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setCurrentScreen("lobby");
                        setActiveModal(null);
                      }}
                      type="button"
                      className="w-full px-3.5 py-3.5 bg-white text-black hover:bg-black hover:text-white transition-all duration-150 border-4 border-black font-press-start text-[8.5px] flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-extrabold select-none uppercase"
                    >
                      ◀ [ B BUTTON: BACK TO LOBBY ({language === "zh" ? "返回精煉大廳" : "BACK TO LOBBY"}) ]
                    </button>
                  </div>
                </div>
              )}

              {/* NEW ALALCHEMY PROCESS (Tier 2-B) */}
              {currentScreen === "new_alchemy" && (
                <div className="space-y-4">
                  <div className="border-4 border-black bg-white p-4 relative">
                    <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>
                    
                    {/* Header banner */}
                    <div className="bg-[#EAEAEA] border-b-2 border-black p-2 flex justify-between items-center mb-4">
                      <span className="text-[9.5px] uppercase font-bold text-black flex items-center gap-1.5 leading-none pt-0.5">
                        🧪 {language === "zh" ? "煉金熔爐傳送門" : "ALCHEMIST CHAMBER"}
                      </span>
                      <span className="text-[7.5px] bg-black text-white px-2 py-0.5 font-bold">
                        {language === "zh" ? "兩階段煉金系統" : "2-STAGE READY"}
                      </span>
                    </div>

                    <p className="text-[9px] text-[#505050] mb-4 uppercase leading-relaxed text-center font-bold">
                      {language === "zh" 
                        ? "請投入您的學術材料，即刻幻化為極限煉金高能筆記與試題：" 
                        : "投置您的 LECTURE MATERIALS TO SMELT RPG NOTES & BOSS ENCOUNTERS:"}
                    </p>

                    {/* Strict 2x2 Input Bento Choice Board */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <button
                        onClick={() => setActiveModal("new_document")}
                        type="button"
                        className="p-4 border-4 border-black bg-white hover:bg-black text-black hover:text-white transition-all text-left flex flex-col justify-between h-28 hover:scale-102 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 font-press-start"
                      >
                        <span className="text-xl">📄</span>
                        <div>
                          <span className="text-[8.5px] font-bold block mb-1">1. SLIDES</span>
                          <span className="text-[6.5px] text-gray-500 block leading-tight font-sans">
                            {language === "zh" ? "拖曳簡報講義 (PDF)" : "School Slides / PPT"}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveModal("new_youtube")}
                        type="button"
                        className="p-4 border-4 border-black bg-white hover:bg-black text-black hover:text-white transition-all text-left flex flex-col justify-between h-28 hover:scale-102 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 font-press-start"
                      >
                        <span className="text-xl">📼</span>
                        <div>
                          <span className="text-[8.5px] font-bold block mb-1">2. VIDEO PORTAL</span>
                          <span className="text-[6.5px] text-gray-500 block leading-tight font-sans">
                            {language === "zh" ? "傳入 YouTube 網址" : "Web Video Portal"}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveModal("new_audio")}
                        type="button"
                        className="p-4 border-4 border-black bg-white hover:bg-black text-black hover:text-white transition-all text-left flex flex-col justify-between h-28 hover:scale-102 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 font-press-start"
                      >
                        <span className="text-xl">🎙️</span>
                        <div>
                          <span className="text-[8.5px] font-bold block mb-1">3. CASSETTE</span>
                          <span className="text-[6.5px] text-gray-500 block leading-tight font-sans">
                            {language === "zh" ? "現場錄音或 MP3" : "Microphone Audio Rec"}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveModal("new_text")}
                        type="button"
                        className="p-4 border-4 border-black bg-white hover:bg-black text-black hover:text-white transition-all text-left flex flex-col justify-between h-28 hover:scale-102 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 font-press-start"
                      >
                        <span className="text-xl">✍️</span>
                        <div>
                          <span className="text-[8.5px] font-bold block mb-1">4. SPELLS CODES</span>
                          <span className="text-[6.5px] text-gray-500 block leading-tight font-sans">
                            {language === "zh" ? "貼入大段文字筆記" : "Copy-paste Notes Code"}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Back to lobby B Trigger */}
                  <div className="flex justify-start">
                    <button
                      onClick={() => {
                        setCurrentScreen("lobby");
                        setActiveModal(null);
                      }}
                      type="button"
                      className="px-3.5 py-2.5 bg-white text-black hover:bg-black hover:text-white transition-colors border-4 border-black font-press-start text-[8px] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-bold select-none uppercase"
                    >
                      ◀ B BUTTON: {language === "zh" ? "◀ B 鍵：取消返回大廳" : "◀ B BUTTON: CANCEL ALCHEMY"}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* DYNAMIC NARRATOR DIALOGUE STATUS TICKER AT FOOTER */}
            <div className="bg-white border-4 border-black p-3 flex items-center gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
              <div className="flex-shrink-0 w-10 h-10 bg-black flex items-center justify-center text-white text-[12px] border-2 border-black font-press-start">
                ?
              </div>
              <div className="flex-grow">
                <span className="font-press-start text-[7px] text-[#707070] block mb-1 uppercase">
                  {translations[language].narrator_advisor}
                </span>
                <p className="font-press-start text-[8px] leading-relaxed uppercase animate-pulse">
                  {isProcessing
                    ? translations[language].narrator_processing
                    : activeRPGData
                    ? translations[language].narrator_loaded.replace("{title}", activeRPGData.title)
                    : translations[language].narrator_greetings
                  }
                </p>
              </div>
              <div className="flex space-x-1 select-none flex-shrink-0">
                <span className="w-2 h-2 bg-black"></span>
                <span className="w-2 h-2 bg-black"></span>
                <span className="w-2 h-2 bg-[#D3D3D3] border border-black"></span>
              </div>
            </div>

          </div>
        )}



        {/* DEVICE COMPONENT FOOTNOTE FOR MAXIMUM VINTAGE IMMERSION */}
        <div className="flex justify-between items-center bg-black/5 p-2 rounded-none select-none text-[#505050] text-[5px] md:text-[6px] border-t-2 border-black/10 mt-1 leading-none font-press-start font-bold">
          <span>{translations[language].footer_platform}</span>
          <span>{translations[language].footer_corp}</span>
        </div>
      </div>

      {/* 🔮 ALCHEMY TRANSMUTATION PROGRESS OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs select-none">
          <AlchemistChamber 
            onCancel={() => setIsProcessing(false)}
            lang={language}
          />
        </div>
      )}

      {/* 🧪 TRANSMUTATION INPUT DIALOG OVERLAY (SLIDES, VIDEO PORTAL, CASSETTE, SPELLS CODES) */}
      {(activeModal === "new_document" || activeModal === "new_youtube" || activeModal === "new_audio" || activeModal === "new_text") && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs select-none">
          <div className="bg-[#D3D3D3] border-4 border-black p-4 md:p-5 retro-shadow w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header Banner */}
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🧪</span>
                <h3 className="font-press-start text-[7px] md:text-[8px] uppercase font-extrabold text-black">
                  {activeModal === "new_document" && (language === "zh" ? "傳奇簡報轉化爐" : "PPT/PDF DECRYPTOR")}
                  {activeModal === "new_youtube" && (language === "zh" ? "影音傳送魔鏡" : "YOUTUBE TRANSMUTER")}
                  {activeModal === "new_audio" && (language === "zh" ? "錄音卡匣冶煉處" : "AUDIO SMELTER")}
                  {activeModal === "new_text" && (language === "zh" ? "文字咒語編譯砧" : "TEXT SPELLS")}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                type="button"
                className="font-press-start text-[7px] text-red-600 hover:bg-black hover:text-white px-1.5 py-0.5 border-2 border-black bg-white select-none transition-colors"
              >
                [X]
              </button>
            </div>

            {/* Scrollable content container for MainControlPanel */}
            <div className="overflow-y-auto pr-1 flex-grow">
              <MainControlPanel
                onProcess={handleProcessLecture}
                isProcessing={isProcessing}
                onLogout={handleLogout}
                userEmail={currentUser?.email || "hero@academicrpg.com"}
                userStats={{
                  level: userProfile?.level || 1,
                  xp: userProfile?.xp || 0,
                  winRate: userProfile?.winRate || 0
                }}
                lang={language}
                forcedTab={
                  activeModal === "new_document" ? "document" :
                  activeModal === "new_youtube" ? "youtube" :
                  activeModal === "new_audio" ? "audio" :
                  activeModal === "new_text" ? "text" :
                  undefined
                }
              />
            </div>

            {/* Footer with close action */}
            <div className="mt-4 pt-2 border-t-2 border-black flex justify-end flex-shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                type="button"
                className="px-3 py-1.5 bg-black text-white font-press-start text-[7px] border-2 border-black hover:bg-[#EAEAEA] hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(112,112,112,1)] cursor-pointer"
              >
                ◀ {language === "zh" ? "返回傳送門" : "CLOSE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚔️ LOOT HUB VIEW DIALOG OVERLAY (SUMMARY, KEYNOTES, BATTLE) */}
      {(activeModal === "summary" || activeModal === "keynotes" || activeModal === "quiz_battle") && activeRPGData && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs select-none">
          <div className="bg-[#D3D3D3] border-4 border-black p-4 md:p-5 retro-shadow w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header Banner */}
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⚔️</span>
                <h3 className="font-press-start text-[7px] md:text-[8px] uppercase font-extrabold text-black truncate max-w-[285px]">
                  {activeRPGData.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                type="button"
                className="font-press-start text-[7px] text-red-600 hover:bg-black hover:text-white px-1.5 py-0.5 border-2 border-black bg-white select-none transition-colors"
              >
                [X]
              </button>
            </div>

            {/* Scrollable content container for LootHub */}
            <div className="overflow-y-auto pr-1 flex-grow">
              <LootHub
                data={activeRPGData}
                onQuizWin={handleScoreQuiz}
                onIncorrectAnswer={handleIncorrectAnswer}
                lang={language}
                initialTab={
                  activeModal === "summary" ? "summary" :
                  activeModal === "keynotes" ? "keynotes" :
                  activeModal === "quiz_battle" ? "quiz" :
                  "summary"
                }
                wrongQuizzes={wrongQuizzes}
                onDeleteWrongQuiz={handleDeleteWrongQuiz}
              />
            </div>

            {/* Footer with close action */}
            <div className="mt-4 pt-2 border-t-2 border-black flex justify-end flex-shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                type="button"
                className="px-3 py-1.5 bg-black text-white font-press-start text-[7px] border-2 border-black hover:bg-[#EAEAEA] hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(112,112,112,1)] cursor-pointer"
              >
                ◀ {language === "zh" ? "返回地下城" : "CLOSE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ☠️ RETRO WRONG QUIZ REVIEWER DIALOG OVERLAY */}
      {(showWrongQuizzesModal || activeModal === "wrong_book") && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs select-none">
          <div className="bg-[#D3D3D3] border-4 border-black p-4 md:p-5 retro-shadow w-full max-w-lg max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header Banner */}
            <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm">☠️</span>
                <h3 className="font-press-start text-[7px] md:text-[8px] uppercase font-extrabold text-black">
                  {language === "zh" ? "副本除魔錄 (戰略錯題本)" : "THE BROKEN SHIELD (WRONG QUIZZES)"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowWrongQuizzesModal(false);
                  setActiveModal(null);
                }}
                type="button"
                className="font-press-start text-[7px] text-red-600 hover:bg-black hover:text-white px-1.5 py-0.5 border-2 border-black bg-white select-none transition-colors"
              >
                [X]
              </button>
            </div>

            {/* Scrollable Questions list */}
            <div className="overflow-y-auto pr-1 flex-grow space-y-4 font-mono text-xs text-black">
              {wrongQuizzes.length === 0 ? (
                <div className="py-12 px-4 border-4 border-dashed border-[#707070] bg-white/50 text-center space-y-3 flex flex-col justify-center items-center">
                  <span className="text-3xl animate-bounce">🛡️</span>
                  <p className="font-press-start text-[8px] text-black leading-relaxed max-w-xs">
                    {language === "zh" 
                      ? "☠️ 目前尚無冤魂...\n你的防禦力已點滿！" 
                      : "☠️ NO RESTLESS SOULS FOUND...\nYOUR SHIELD VALUE IS MAXED OUT!"}
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-press-start text-[6px] leading-relaxed text-[#505050] bg-white/75 p-2 border-2 border-black border-dashed">
                    {language === "zh" 
                      ? "以下為戰鬥中曾遭遇的考題反噬。考前進行溫習、掌握答題邏輯，點擊下方「消除業障」即能破除心魔、迴避重擊！" 
                      : "These are critical combat strikes. Review key outlines, formulas, and press PURGE to transcend them!"}
                  </p>
                  
                  <div className="space-y-3">
                    {wrongQuizzes.map((quiz, qIdx) => (
                      <div key={quiz.id} className="bg-white border-2 border-black p-3 space-y-2 text-[10px] md:text-[11px] relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {/* Item head */}
                        <div className="flex justify-between items-center border-b border-black/10 pb-1">
                          <span className="bg-black text-white px-1 py-0.5 font-press-start text-[5px]">
                            ⚔️ {quiz.save_title}
                          </span>
                          <span className="text-[8px] text-gray-500 font-press-start">
                            #{qIdx + 1}
                          </span>
                        </div>

                        {/* Question text */}
                        <p className="font-bold leading-normal text-black font-sans">
                          {quiz.question}
                        </p>

                        {/* Options list */}
                        <div className="space-y-1 pl-1">
                          {quiz.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === quiz.correctIndex;
                            return (
                              <div 
                                key={oIdx} 
                                className={`p-1 border rounded-none transition-all ${
                                  isCorrect 
                                    ? "bg-[#EAEAEA] border-black font-bold text-black" 
                                    : "border-transparent text-gray-600"
                                }`}
                              >
                                {opt} {isCorrect && <span className="font-press-start text-[6px] ml-1 bg-black text-white px-1">✔ {language === "zh" ? "正解" : "TRUE"}</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Expl text */}
                        <div className="bg-[#F3F3F3] border-l-2 border-black p-2 font-sans space-y-1 text-gray-700">
                          <span className="font-press-start text-[6px] text-black font-bold block">
                            🧠 {language === "zh" ? "【破咒大師攻略】" : "【BREAKSPELL OUTLINE】"}:
                          </span>
                          <p className="leading-relaxed text-[10px]">{quiz.explanation}</p>
                        </div>

                        {/* Actions row */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleDeleteWrongQuiz(quiz.id)}
                            type="button"
                            className="px-2 py-1 bg-white hover:bg-black border border-black hover:text-white text-[7px] font-press-start flex items-center gap-1 active:translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none cursor-pointer"
                          >
                            🔥 {language === "zh" ? "消除業障" : "PURGE SOUL"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bottom footer bar */}
            <div className="mt-4 pt-2 border-t-2 border-black flex justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setShowWrongQuizzesModal(false);
                  setActiveModal(null);
                }}
                type="button"
                className="px-3 py-1.5 bg-black text-white font-press-start text-[7px] border-2 border-black hover:bg-[#EAEAEA] hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(112,112,112,1)] cursor-pointer"
              >
                ◀ {language === "zh" ? "返回地下城" : "CLOSE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛋️ HERO AVATAR CUSTOMIZER DRESSING SPACE */}
      {showDressingRoom && (
        <AvatarDressingRoom
          userProfile={userProfile}
          language={language}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowDressingRoom(false)}
        />
      )}

      {/* 📅 RETRO DAILY CHECK-IN DIALOG REWARD (Pokémon Dialogue Box) */}
      {checkInMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[#D3D3D3] border-4 border-black p-4 md:p-5 retro-shadow relative text-black"
          >
            <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5" />

            <div className="bg-black text-white px-2.5 py-1 font-press-start text-[7px] border-b-4 border-black mb-3 flex items-center justify-between">
              <span>📅 {language === "zh" ? "能量補充成功" : "ENERGY HARVESTED"}</span>
              <span className="animate-ping w-1.5 h-1.5 bg-green-450 rounded-full"></span>
            </div>

            <div className="bg-white border-2 border-black p-4 mb-4 min-h-[90px] flex items-center justify-center text-center">
              <p className="font-press-start text-[8px] md:text-[9px] leading-relaxed whitespace-pre-line text-black">
                {checkInMessage}
              </p>
            </div>

            <button
              onClick={() => setCheckInMessage(null)}
              className="w-full py-2.5 bg-black text-white hover:bg-white hover:text-black border-2 border-black font-press-start text-[8px] uppercase tracking-wider select-none active:translate-y-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer text-center"
            >
              {language === "zh" ? "[ ◀ A 鍵: 收到、確認 ]" : "[ ◀ A BUTTON: CONFIRM ]"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
