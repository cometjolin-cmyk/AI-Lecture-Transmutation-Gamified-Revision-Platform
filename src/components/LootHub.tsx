import { useState, useEffect } from "react";
import { Star, Check, ShieldAlert } from "lucide-react";
import { LectureRPGData, QuizQuestion } from "../types";
import { Language } from "../translations";

interface LootHubProps {
  data: LectureRPGData;
  onQuizWin: (winRate: number, correctCount: number) => void;
  onIncorrectAnswer?: (question: QuizQuestion) => void;
  lang?: Language;
  initialTab?: "summary" | "keynotes" | "quiz" | "debuff";
  wrongQuizzes?: any[];
  onDeleteWrongQuiz?: (id: string) => void;
}

export default function LootHub({
  data,
  onQuizWin,
  onIncorrectAnswer,
  lang = "zh",
  initialTab = "summary",
  wrongQuizzes = [],
  onDeleteWrongQuiz
}: LootHubProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "keynotes" | "quiz" | "debuff">(initialTab);
  const [activeKeynoteIndex, setActiveKeynoteIndex] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setActiveKeynoteIndex(0);
  }, [data]);

  // Quiz game state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [quizResults, setQuizResults] = useState<boolean[]>([]); // track correct/incorrect
  const [playerHp, setPlayerHp] = useState(100);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Typewriter effect state for dialogue boxes
  const [typedIntro, setTypedIntro] = useState("");
  const narratorText = data.summary.narrator_intro || "You have entered the academic dungeon!";

  useEffect(() => {
    // Reset typewriter when summary loads
    let index = 0;
    setTypedIntro("");
    const interval = setInterval(() => {
      if (index < narratorText.length) {
        setTypedIntro((prev) => prev + narratorText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [data, activeTab]);

  // Quiz controls
  const handleSelectOption = (index: number) => {
    if (answered) return;
    setSelectedOptionIndex(index);
    setAnswered(true);

    const isCorrect = index === data.quiz[currentQuizIndex].correctIndex;
    const currentResults = [...quizResults, isCorrect];
    setQuizResults(currentResults);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      // Trigger horizontal screen shake & damage player HP
      setPlayerHp((prev) => Math.max(0, prev - 20)); // Increased threat!
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);

      if (onIncorrectAnswer) {
        onIncorrectAnswer(data.quiz[currentQuizIndex]);
      }
    }

    // If it's the final question, submit results to trigger a level update
    if (currentQuizIndex === data.quiz.length - 1) {
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      const finalWinRate = Math.round((finalCorrect / data.quiz.length) * 100);
      onQuizWin(finalWinRate, finalCorrect);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < data.quiz.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setAnswered(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setAnswered(false);
    setQuizResults([]);
    setPlayerHp(100);
    setCorrectCount(0);
  };

  const formatBoldEquations = (text: string) => {
    if (!text) return "";
    
    // First, split by backticks to get code regions
    const backtickParts = text.split(/`([^`]+)`/g);
    
    return backtickParts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <code key={`code-${i}`} className="bg-black text-white px-1 py-0.5 text-[10px] font-mono font-bold whitespace-pre-wrap">
            {part}
          </code>
        );
      } else {
        // Parse inline bold **text** inside the normal text parts
        const boldParts = part.split(/\*\*([^*]+)\*\*/g);
        return boldParts.map((bPart, j) => {
          if (j % 2 === 1) {
            return (
              <strong key={`bold-${i}-${j}`} className="font-press-start text-[8px] text-black font-extrabold uppercase">
                {bPart}
              </strong>
            );
          } else {
            return bPart;
          }
        });
      }
    });
  };

  const renderSummaryText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2.5" />;
      }

      // 1. Check for major heading levels or lines wrapped in 【 】 or [ ]
      const l1HeadingMatch = trimmed.match(/^#\s+(.*)$/);
      const l2PlusHeadingMatch = trimmed.match(/^(#{2,6})\s+(.*)$/);
      const customBracketHeadingMatch = trimmed.match(/^【(.*)】$/);
      const bracketOrTagHeadingMatch = trimmed.match(/^\[(.*)\]$/);
      
      if (l1HeadingMatch) {
        const content = l1HeadingMatch[1];
        return (
          <h3 
            key={idx} 
            className="font-press-start text-black font-extrabold text-[11px] md:text-[12px] mt-6 mb-3 tracking-wide uppercase border-l-4 border-black bg-stone-100 p-2.5 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            👑 {formatBoldEquations(content)}
          </h3>
        );
      } else if (customBracketHeadingMatch) {
        const content = customBracketHeadingMatch[1];
        return (
          <h3 
            key={idx} 
            className="font-press-start text-black font-extrabold text-[10px] md:text-[11px] mt-5 mb-3.5 tracking-wide uppercase border-l-4 border-black bg-stone-100/80 p-2 flex items-center gap-2"
          >
            🔰 {formatBoldEquations(content)}
          </h3>
        );
      } else if (l2PlusHeadingMatch) {
        const content = l2PlusHeadingMatch[2];
        return (
          <h4 
            key={idx} 
            className="font-press-start text-black font-extrabold text-[8.5px] md:text-[9px] mt-4 mb-2 tracking-wide uppercase border-b-2 border-black pb-1.5 flex items-center gap-1.5 text-stone-800"
          >
            ❖ {formatBoldEquations(content)}
          </h4>
        );
      } else if (bracketOrTagHeadingMatch) {
        const content = bracketOrTagHeadingMatch[1];
        return (
          <h4 
            key={idx} 
            className="font-press-start text-black font-extrabold text-[8.5px] md:text-[9px] mt-4 mb-2 tracking-wide uppercase border-b-2 border-black pb-1.5 flex items-center gap-1.5 text-stone-800"
          >
            ⚜️ {formatBoldEquations(content)}
          </h4>
        );
      }

      // 2. Check for bullet list items: - , * , • or number lists: 1. , 2.
      const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      const numberChoiceMatch = trimmed.match(/^(\d+\.|[A-D]:)\s+(.*)$/);

      if (bulletMatch) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-3 my-2 group">
            <span className="text-black text-[12px] md:text-[13px] select-none leading-none pt-0.5 transition-transform duration-100 group-hover:translate-x-0.5">▸</span>
            <div className="font-mono text-[12.5px] md:text-[13.5px] leading-relaxed text-[#1D1D1D] uppercase tracking-wide">
              {formatBoldEquations(bulletMatch[1])}
            </div>
          </div>
        );
      } else if (numberChoiceMatch) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-3 my-2 group">
            <span className="font-press-start text-[6.5px] bg-black text-white px-1 py-1.5 select-none font-bold leading-none">
              {numberChoiceMatch[1].replace(".", "")}
            </span>
            <div className="font-mono text-[12.5px] md:text-[13.5px] leading-relaxed text-[#1D1D1D] uppercase tracking-wide">
              {formatBoldEquations(numberChoiceMatch[2])}
            </div>
          </div>
        );
      }

      // 3. Standard paragraph
      return (
        <p key={idx} className="font-mono text-[12.5px] md:text-[13px] leading-relaxed text-[#2D2D2D] uppercase mb-3 pl-1 pr-2">
          {formatBoldEquations(trimmed)}
        </p>
      );
    });
  };

  const handlePrevKeynote = () => {
    setActiveKeynoteIndex((prev) => (prev > 0 ? prev - 1 : data.keynotes.length - 1));
  };
  const handleNextKeynote = () => {
    setActiveKeynoteIndex((prev) => (prev < data.keynotes.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`w-full space-y-4 ${shakeScreen ? "animate-shake" : ""}`}>
      {/* 8-bit Scroll Result Tabs - Four columns styled beautifully */}
      <div className="flex border-4 border-black bg-white select-none text-[8px] flex-wrap md:flex-nowrap">
        <button
          onClick={() => setActiveTab("summary")}
          type="button"
          className={`flex-1 min-w-[65px] py-2 font-press-start text-[7px] md:text-[8px] border-r-2 border-black transition-all ${
            activeTab === "summary" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          📝 {lang === "zh" ? "摘要" : "SUMMARY"}
        </button>
        <button
          onClick={() => setActiveTab("keynotes")}
          type="button"
          className={`flex-1 min-w-[65px] py-2 font-press-start text-[7px] md:text-[8px] border-r-2 border-black transition-all ${
            activeTab === "keynotes" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          💡 {lang === "zh" ? "法書" : "KEYNOTES"}
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          type="button"
          className={`flex-1 min-w-[65px] py-2 font-press-start text-[7px] md:text-[8px] border-r-2 border-black transition-all ${
            activeTab === "quiz" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          🎯 {lang === "zh" ? "決鬥" : "BATTLE"}
        </button>
        <button
          onClick={() => setActiveTab("debuff")}
          type="button"
          className={`flex-1 min-w-[65px] py-2 font-press-start text-[7px] md:text-[8px] transition-all ${
            activeTab === "debuff" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          ☠️ {lang === "zh" ? "除魔" : "DEBUFF"}
        </button>
      </div>

      {/* RENDER ACTIVE TABS */}

      {/* Tab A: [📝 SUMMARY - Strategic Map] */}
      {activeTab === "summary" && (
        <div className="bg-white text-black border-4 border-black p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-black"></div>

          {/* Typewriter Dialogue box */}
          <div className="border-2 border-black p-3 bg-[#EAEAEA] mb-4 flex gap-2 relative">
            <span className="text-base select-none">💬</span>
            <div className="font-press-start text-[8px] leading-relaxed text-black max-w-full">
              {typedIntro}
              {typedIntro.length < narratorText.length && (
                <span className="inline-block w-1.5 h-3.5 bg-black animate-blink ml-1"></span>
              )}
            </div>
          </div>

          <div className="space-y-4 text-black">
            {/* Background Section */}
            <div className="border-l-4 border-black pl-3 pt-0.5">
              <h4 className="font-press-start text-[8px] text-[#707070] uppercase mb-2 border-b border-black pb-0.5">
                🏛️ {lang === "zh" ? "歷史背景與知識起源" : "HISTORIC BACKGROUND & ORIGIN"}
              </h4>
              <div className="text-black text-sm leading-relaxed">
                {renderSummaryText(data.summary.background)}
              </div>
            </div>

            {/* Core Concepts Section */}
            <div className="border-l-4 border-black pl-3 pt-0.5">
              <h4 className="font-press-start text-[8px] text-[#707070] uppercase mb-2 border-b border-black pb-0.5">
                🔮 {lang === "zh" ? "核心概念與修煉要領" : "CORE PARADIGMS & LESSONS"}
              </h4>
              <div className="text-black text-sm leading-relaxed">
                {renderSummaryText(data.summary.core_concepts)}
              </div>
            </div>

            {/* One Sentence Summary */}
            <div className="border-2 border-black bg-black text-white p-3 text-center mt-3 select-none">
              <span className="font-press-start text-[6px] text-[#D3D3D3] block mb-1">
                ℹ️ {lang === "zh" ? "避坑安全手札秘訣:" : "DIRECTIVE SUMMARY:"}
              </span>
              <p className="font-press-start text-[8px] text-white leading-relaxed uppercase">
                "{data.summary.one_sentence}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab B: [💡 KEYNOTES - Horizontal Card Carousel] */}
      {activeTab === "keynotes" && (
        <div className="space-y-4">
          <div className="bg-black text-white p-2.5 text-center border-4 border-black select-none flex justify-between items-center">
            <h3 className="font-press-start text-[8px] tracking-wide uppercase">
              🛡️ {lang === "zh" ? "當前配備傳奇法書" : "CHOSEN LECTURE CODEX"} 🛡️
            </h3>
            <span className="font-press-start text-[7px] text-[#A0A0A0]">
              {data.keynotes.length > 0 ? `${activeKeynoteIndex + 1} / ${data.keynotes.length}` : "0 / 0"}
            </span>
          </div>

          {data.keynotes.length === 0 ? (
            <div className="py-12 bg-white border-4 border-black text-center text-gray-500 font-press-start text-[8px]">
              {lang === "zh" ? "無任何傳奇法書配置" : "NO SPELLBOOKS AVAILABLE"}
            </div>
          ) : (
            <>
              {/* Horizontal Snap Scroll Carousel Container */}
              <div className="relative border-4 border-black bg-white p-4">
                {/* The single visible pixel card with transition */}
                <div className="relative min-h-[180px] flex flex-col justify-between py-1 transition-all duration-300">
                  
                  {/* Custom stars indicating importance */}
                  <div className="absolute top-1 right-1 flex space-x-0.5 bg-white pl-2">
                    {Array.from({ length: data.keynotes[activeKeynoteIndex]?.importance || 1 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-black text-black" />
                    ))}
                    {Array.from({ length: 3 - (data.keynotes[activeKeynoteIndex]?.importance || 1) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-[#D3D3D3]" />
                    ))}
                  </div>

                  <div>
                    <span className="font-press-start text-[7px] text-gray-500 block mb-1">
                      ⚔️ {lang === "zh" ? `重點技能書 ${activeKeynoteIndex + 1}` : `SPELLBOOK ${activeKeynoteIndex + 1}`}
                    </span>
                    <h4 className="font-press-start text-[9px] pr-12 text-black border-b border-black pb-1 mb-3 leading-relaxed uppercase">
                      {data.keynotes[activeKeynoteIndex]?.title}
                    </h4>
                    {/* Note details styled nicely with parser */}
                    <div className="text-black">
                      {renderSummaryText(data.keynotes[activeKeynoteIndex]?.detail)}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[6px] font-press-start text-[#707070] uppercase border-t border-black/10 mt-3 select-none">
                    <span>TIER {data.keynotes[activeKeynoteIndex]?.importance} {lang === "zh" ? "階等裝備" : "ITEM"}</span>
                    <span>[{lang === "zh" ? "技能已載入" : "SKILL ACTIVE"}]</span>
                  </div>
                </div>
              </div>

              {/* Carousel Buttons Control Panel (Retro Game boy Style) */}
              <div className="flex justify-between items-center mt-2.5">
                <button
                  onClick={handlePrevKeynote}
                  type="button"
                  className="px-3.5 py-1.5 border-4 border-black bg-white hover:bg-black text-black hover:text-white font-press-start text-[8px] active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-extrabold cursor-pointer select-none"
                >
                  ◀ {lang === "zh" ? "上一個" : "PREV"}
                </button>
                
                {/* Pagination Segment Dots */}
                <div className="flex items-center gap-1.5 justify-center">
                  {data.keynotes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveKeynoteIndex(i)}
                      className={`w-3 h-3 border-2 border-black transition-all ${
                        i === activeKeynoteIndex ? "bg-black" : "bg-white"
                      }`}
                      aria-label={`Go to keynote ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextKeynote}
                  type="button"
                  className="px-3.5 py-1.5 border-4 border-black bg-white hover:bg-black text-black hover:text-white font-press-start text-[8px] active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-extrabold cursor-pointer select-none"
                >
                  {lang === "zh" ? "下一個" : "NEXT"} ▶
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab C: [🎯 QUIZ - Turn-based Battle] */}
      {activeTab === "quiz" && (
        <div className="bg-white text-black border-4 border-black p-4 relative">
          <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>

          {/* Fighter Battle Panel Header */}
          <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
            <div>
              <h3 className="font-press-start text-[8px] text-black uppercase">
                {lang === "zh" ? "期末大魔獸" : "ENEMY QUIZ"} Lvl {currentQuizIndex + 1}/{data.quiz.length}
              </h3>
              <p className="font-mono text-[9px] text-[#707070] mt-0.5 uppercase truncate max-w-[120px]">
                {data.title}
              </p>
            </div>

            {/* HP Gauge */}
            <div className="w-24 border-2 border-black p-1 bg-white select-none">
              <div className="flex justify-between font-press-start text-[6px] mb-0.5">
                <span>HP</span>
                <span>{playerHp}/100</span>
              </div>
              <div className="w-full bg-[#D3D3D3] h-2.5 border border-black overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    playerHp > 50 ? "bg-black" : playerHp > 20 ? "bg-[#707070]" : "bg-red-600 animate-pulse"
                  }`}
                  style={{ width: `${playerHp}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Main Question Display */}
          <div className="border-2 border-black bg-black text-white p-3.5 mb-4 select-none">
            <div className="flex items-start gap-2">
              <span className="text-base animate-bounce">👾</span>
              <p className="font-press-start text-[8px] leading-relaxed max-w-full">
                {data.quiz[currentQuizIndex]?.question}
              </p>
            </div>
          </div>

          {/* Option Action Boxes (Fight / Item / Run Menu Style) */}
          <div className="flex flex-col gap-2 mb-4">
            {data.quiz[currentQuizIndex]?.options.map((option, i) => {
              const worksAsCorrect = i === data.quiz[currentQuizIndex].correctIndex;
              const isSelected = selectedOptionIndex === i;

              let buttonStyle = "bg-white text-black border-2 border-black";
              if (answered) {
                if (worksAsCorrect) {
                  buttonStyle = "bg-black text-white border-2 border-black animate-pulse font-bold";
                } else if (isSelected) {
                  buttonStyle = "bg-[#707070] text-white border-2 border-black opacity-85";
                } else {
                  buttonStyle = "bg-white text-black border border-black opacity-50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => handleSelectOption(i)}
                  type="button"
                  className={`text-left p-2.5 font-press-start text-[8px] leading-relaxed transition-all cursor-pointer hover:bg-black hover:text-white ${buttonStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback Dialogue box */}
          {answered && (
            <div className="border-2 border-black p-3 bg-[#EAEAEA] rounded-none space-y-2.5">
              <div className="flex gap-1.5 items-center">
                {selectedOptionIndex === data.quiz[currentQuizIndex].correctIndex ? (
                  <>
                    <Check className="w-4 h-4 text-black animate-bounce" />
                    <span className="font-press-start text-[8px] uppercase font-bold text-black font-press-start">
                      ✔ {lang === "zh" ? "物理暴擊！大獲全勝！" : "CRITICAL HIT! Correct Answer!"}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-black" />
                    <span className="font-press-start text-[8px] uppercase font-bold text-black font-press-start">
                      ❌ {lang === "zh" ? "防禦瓦解！血流不止 HP -20" : "OUCH! Wrong Answer. HP -20."}
                    </span>
                  </>
                )}
              </div>

              {selectedOptionIndex !== data.quiz[currentQuizIndex].correctIndex && (
                <div className="font-press-start text-[7px] text-black">
                  {lang === "zh" ? "正解符印為:" : "Correct option was:"}{" "}
                  <span className="text-black bg-white px-1 py-0.5 ml-1 font-bold border border-black">
                    {["A", "B", "C", "D"][data.quiz[currentQuizIndex].correctIndex]}
                  </span>
                </div>
              )}

              {/* Master explanation */}
              <div className="border-t border-black/20 pt-2">
                <span className="font-press-start text-[7px] text-[#707070] uppercase block mb-0.5">
                  [{lang === "zh" ? "導師深度釋義詳解" : "AI Master Explanation"}]
                </span>
                <div className="text-black">
                  {renderSummaryText(data.quiz[currentQuizIndex]?.explanation)}
                </div>
              </div>

              {/* Next navigation trigger */}
              <div className="pt-1 flex justify-end">
                {currentQuizIndex < data.quiz.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    type="button"
                    className="font-press-start border-2 border-black text-[7px] px-2.5 py-1 bg-white hover:bg-black text-black hover:text-white"
                  >
                    ▶ {lang === "zh" ? "下個回合戰鬥" : "NEXT ROUND"}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetQuiz}
                      type="button"
                      className="font-press-start border border-black text-[7.5px] px-2 py-0.5 bg-white hover:bg-black text-black hover:text-white"
                    >
                      ▶ {lang === "zh" ? "重開挑戰" : "RESET GAME"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Game Status Overlays if HP or game completes */}
          {playerHp === 0 && (
            <div className="absolute inset-x-0 inset-y-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white p-4 z-20 text-center select-none animate-fade-in">
              <span className="text-3xl animate-bounce">💀</span>
              <h4 className="font-press-start text-[9px] text-white uppercase mt-3 animate-pulse">
                {lang === "zh" ? "功課重載 魂斷期末" : "FATAL STUDY OVERLOAD"}
              </h4>
              <p className="font-mono text-[9px] text-[#D3D3D3] mt-1.5 mb-4 max-w-xs uppercase leading-relaxed font-bold">
                {lang === "zh" ? "您的短期大腦儲存區溢流。速速復盤法典摘要提要，編寫高防護力學霸裝甲！" : "Your memory cache overflowed and you dropped to 0 HP. Review Summary maps to build magical armor!"}
              </p>
              <button
                onClick={handleResetQuiz}
                type="button"
                className="font-press-start text-[8px] px-3 py-1.5 border-2 border-white bg-black hover:bg-white hover:text-black retro-shadow"
              >
                🔮 {lang === "zh" ? "復活返魂" : "REVIVE HERO"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab D: [☠️ DEBUFF BOOK - Wrong Quizzes Booklet] */}
      {activeTab === "debuff" && (
        <div className="space-y-4">
          <div className="bg-black text-white p-2.5 text-center border-4 border-black select-none">
            <h3 className="font-press-start text-[8px] tracking-wide uppercase">
              ☠️ {lang === "zh" ? "副本除魔錄 (戰略錯題本)" : "THE BROKEN SHIELD (WRONG QUIZZES)"} ☠️
            </h3>
          </div>

          <div className="overflow-y-auto max-h-[400px] pr-1 space-y-3 font-mono text-xs text-black">
            {(!wrongQuizzes || wrongQuizzes.length === 0) ? (
              <div className="py-12 px-4 border-4 border-dashed border-[#707070] bg-white text-center space-y-3 flex flex-col justify-center items-center">
                <span className="text-3xl animate-bounce">🛡️</span>
                <p className="font-press-start text-[8px] text-black leading-relaxed max-w-xs uppercase">
                  {lang === "zh" 
                    ? "☠️ 目前尚無冤魂...\n你的防禦力已點滿！" 
                    : "☠️ NO RESTLESS SOULS FOUND...\nYOUR SHIELD VALUE IS MAXED OUT!"}
                </p>
              </div>
            ) : (
              <>
                <p className="font-press-start text-[6px] leading-relaxed text-[#707070] bg-[#EAEAEA] p-2 border-2 border-black border-dashed uppercase">
                  {lang === "zh" 
                    ? "以下為戰鬥中曾遭遇的考題反噬。考前進行溫習、掌握答題邏輯，點擊下方「消除業障」即能破除心魔、迴避重擊！" 
                    : "These are critical combat strikes. Review key outlines, formulas, and press PURGE to transcend them!"}
                </p>
                
                <div className="space-y-3">
                  {wrongQuizzes.map((quiz, qIdx) => (
                    <div key={quiz.id} className="bg-white border-4 border-black p-3 space-y-2 text-[10px] md:text-[11px] relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {/* Item head */}
                      <div className="flex justify-between items-center border-b border-black pb-1.5 mb-2">
                        <span className="bg-black text-white px-2 py-0.5 font-press-start text-[6px] tracking-wider uppercase">
                          ⚔️ {quiz.save_title}
                        </span>
                        <span className="text-[8px] text-gray-400 font-press-start">
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
                              className={`p-1.5 border transition-all text-xs font-sans ${
                                isCorrect 
                                  ? "bg-[#EAEAEA] border-black font-bold text-black" 
                                  : "border-transparent text-gray-500"
                              }`}
                            >
                              {opt} {isCorrect && <span className="font-press-start text-[6px] ml-1.5 bg-black text-white px-1 leading-none py-0.5">✔ {lang === "zh" ? "正解" : "TRUE"}</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Expl text */}
                      <div className="bg-[#EAEAEA] border-l-4 border-black p-2 font-mono space-y-1 text-gray-700">
                        <span className="font-press-start text-[6px] text-black font-extrabold block uppercase">
                          🧠 {lang === "zh" ? "【破咒大師攻略】" : "【BREAKSPELL OUTLINE】"}:
                        </span>
                        <div className="leading-relaxed text-[10px] text-black font-sans">
                          {renderSummaryText(quiz.explanation)}
                        </div>
                      </div>

                      {/* Actions row */}
                      {onDeleteWrongQuiz && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onDeleteWrongQuiz(quiz.id)}
                            type="button"
                            className="px-2 py-1 bg-white hover:bg-black border-2 border-black hover:text-white text-[7px] font-press-start flex items-center gap-1 active:translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none cursor-pointer font-bold"
                          >
                            🔥 {lang === "zh" ? "消除業障" : "PURGE SOUL"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
