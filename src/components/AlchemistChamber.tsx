import { useState, useEffect } from "react";
import { translations, Language } from "../translations";

interface AlchemistChamberProps {
  onCancel?: () => void;
  lang?: Language;
}

export default function AlchemistChamber({ onCancel, lang = "zh" }: AlchemistChamberProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logsEn = [
    "AI IS LISTENING TO YOUR PROFESSOR...",
    "EXTRACTING EXAM SECRETS...",
    "PARSING COMPLEX EQUATIONS...",
    "SPELLCASTING THEME SUMMARY...",
    "CONSTRUCTING ENEMY QUIZ ENEMIES...",
    "WRITING MASTER EXPLANATIONS...",
    "PREPARING MAP FOR EXPEDITION...",
    "UPGRADING ACADEMIC WEAPONRY...",
    "LEVELING UP YOUR MEMORY BUFFER..."
  ];

  const logsZh = [
    "AI 正在屏息聆聽教授的授課祕法...",
    "正在提煉重點、提取期末秘籍考點...",
    "破譯繁複公式、解構學理迴路...",
    "研發主題副本摘要法典...",
    "正在捏造並排程關卡怪物（測驗題）...",
    "正在編纂完美防護詳解魔法...",
    "搭建遠征地圖、校準裂隙座標...",
    "升級期末學科決戰武器配備...",
    "正在拓寬您的記憶體與靈魂緩衝區..."
  ];

  const logs = lang === "zh" ? logsZh : logsEn;

  useEffect(() => {
    // Simulate gradual RPG progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          return 98; // Hold until API resolves
        }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 400);

    // Rotate retro logs
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % logs.length);
    }, 1800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [logs.length]);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-[#D3D3D3] retro-double-border retro-shadow text-black max-w-sm mx-auto my-4 relative overflow-hidden">
      {/* Visual CRT Overlay effect */}
      <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-20"></div>

      {/* Screen Header */}
      <div className="w-full text-center mb-4 z-10">
        <h2 className="font-press-start text-xs uppercase animate-pulse border-b-4 border-black pb-2">
          ⚡ {lang === "zh" ? "煉金傳送煉化腔" : "TRANSMUTATION CHAMBER"} ⚡
        </h2>
      </div>

      {/* Shaking Orb Animation */}
      <div className="my-4 z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white border-4 border-black relative flex items-center justify-center animate-bounce shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {/* Hourglass Icon or Pixel Orb */}
          <div className="w-8 h-8 border-4 border-black rounded-full flex items-center justify-center bg-black text-white font-press-start text-sm">
            ⭐
          </div>
          {/* Pulsing sub-pixels */}
          <span className="absolute top-0.5 left-0.5 text-[6px] font-press-start">■</span>
          <span className="absolute bottom-0.5 right-0.5 text-[6px] font-press-start">■</span>
        </div>
        <p className="font-press-start text-[8px] mt-3 tracking-widest text-[#707070]">
          [ALCHEMIST_ACTIVE]
        </p>
      </div>

      {/* Progress metrics */}
      <div className="w-full bg-white border-4 border-black p-2 mb-3 z-10">
        <div className="flex justify-between font-press-start text-[8px] mb-1.5 leading-none">
          <span>{lang === "zh" ? "煉析百分量" : "XP PROCESS"}</span>
          <span>{progress}%</span>
        </div>
        {/* Pixel Bar */}
        <div className="w-full bg-[#D3D3D3] h-5 border-2 border-black p-0.5 flex relative">
          <div
            className="bg-black h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {progress < 40 && <span className="text-[7px] font-press-start text-black">{lang === "zh" ? "材料預備中..." : "PREPARING..."}</span>}
            {progress >= 40 && progress < 80 && (
              <span className="text-[7px] font-press-start text-black font-semibold">{lang === "zh" ? "核心提煉中..." : "TRANSMUTING..."}</span>
            )}
            {progress >= 80 && <span className="text-[7px] font-press-start text-white">{lang === "zh" ? "幻化最終祕寶" : "FINALIZING SECRETS"}</span>}
          </div>
        </div>
      </div>

      {/* Dynamic scrolling logs */}
      <div className="w-full min-h-[48px] bg-black text-[#D3D3D3] border-4 border-black p-2 font-mono text-[10px] uppercase flex flex-col justify-center leading-relaxed">
        <span className="text-white font-press-start text-[7px] text-[#707070] mr-1.5">LOG:</span>
        <span className="animate-pulse">{logs[logIndex]}</span>
      </div>

      {/* Cancel escape valve */}
      {onCancel && (
        <button
          onClick={onCancel}
          type="button"
          className="mt-4 font-press-start text-[8px] bg-white border-2 border-black px-3 py-1 text-black hover:bg-black hover:text-white"
        >
          ◀ {lang === "zh" ? "強行終止退避" : "ABORT EXPEDITION"}
        </button>
      )}
    </div>
  );
}
