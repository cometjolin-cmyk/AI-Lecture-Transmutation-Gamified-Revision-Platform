import React from "react";
import { motion } from "motion/react";
import { UserProfile } from "../types";

interface AvatarDressingRoomProps {
  userProfile: UserProfile | null;
  language: "en" | "zh";
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

// 16x16 Pixel Art Avatars natively drawn with SVG
export function RenderAvatar({ avatar, className = "w-16 h-16" }: { avatar: string; className?: string }) {
  if (avatar === "Mage") {
    return (
      <svg className={`${className} image-rendering-pixelated text-[#7C3AED]`} viewBox="0 0 16 16" fill="currentColor">
        {/* Mage Hat & Robes */}
        <path d="M7 1h2v1H7V1zm-1 1h4v1H6V2zm-1 1h6v1H5V3zm-1 1h8v1H4V4zm2 4h4v1H6V8zm-1 1h6v1H5V9zm-2 2h10v1H3v-1zm-1 1h12v1H2v-1z" />
        {/* Face */}
        <path d="M5 5h6v3H5V5z" fill="#FDE047" />
        {/* Eyes */}
        <rect x="6" y="6" width="1" height="1" fill="#000" />
        <rect x="9" y="6" width="1" height="1" fill="#000" />
        {/* Wizard Staff */}
        <path d="M3 6h1v9H3V6zm11 0h1v9h-1V6z" fill="#06B6D4" />
      </svg>
    );
  }
  if (avatar === "Dragon") {
    return (
      <svg className={`${className} image-rendering-pixelated text-[#DC2626]`} viewBox="0 0 16 16" fill="currentColor">
        {/* Legendary crimson dragon head */}
        <path d="M4 2h8v2H4V2zm2 2h4v1H6V4zm-5 2h14v2H1V6zm1 2h12v1H2V8zm-1 1h14v1H1V9zm2 2h10v3H3v-3z" />
        {/* Orange parts */}
        <path d="M4 4h8v2H4V4z" fill="#F97316" />
        {/* Flashing yellow fire eyes */}
        <rect x="5" y="3" width="1" height="1" fill="#FACC15" />
        <rect x="10" y="3" width="1" height="1" fill="#FACC15" />
        {/* Demonic wings spikes */}
        <path d="M1 11l-1 2h2l-1-2zm14 0l-1 2h2l-1-2z" fill="#F59E0B" />
      </svg>
    );
  }
  // Default: Hero (Knight)
  return (
    <svg className={`${className} image-rendering-pixelated text-[#1E40AF]`} viewBox="0 0 16 16" fill="currentColor">
      {/* Helmet & Plumes */}
      <path d="M4 1h8v3H4V1zm1 3h6v2H5V4zm-4 4h14v1H1V8zm1 1h12v1H2V9zm1 1h10v1H3v-1zm-2 2h14v3H1v-3z" />
      {/* Visor silver */}
      <path d="M4 6h8v2H4V6z" fill="#94A3B8" />
      {/* Visor visor-eyes */}
      <rect x="5" y="3" width="1" height="1" fill="#EF4444" />
      <rect x="10" y="3" width="1" height="1" fill="#EF4444" />
      {/* Red plume ornament */}
      <path d="M7 0h2v1H7V0z" fill="#EF4444" />
    </svg>
  );
}

// Pixel Frame Borders using nested inline-block styling
export function RenderBorder({ border, children }: { border: string; children: React.ReactNode }) {
  if (border === "Thorn Frame") {
    return (
      <div className="relative p-2.5 bg-[#8B221D] border-4 border-[#3A0D0A] shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
        {/* Thorn spikes on corners */}
        <span className="absolute -top-1 -left-1 text-[9px] text-[#FFA29D] font-press-start leading-none pointer-events-none">♦</span>
        <span className="absolute -top-1 -right-1 text-[9px] text-[#FFA29D] font-press-start leading-none pointer-events-none">♦</span>
        <span className="absolute -bottom-1 -left-1 text-[9px] text-[#FFA29D] font-press-start leading-none pointer-events-none">♦</span>
        <span className="absolute -bottom-1 -right-1 text-[9px] text-[#FFA29D] font-press-start leading-none pointer-events-none">♦</span>
        <div className="p-1 bg-[#F5F5F4] border-2 border-[#1C1917] flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }
  if (border === "Crown Frame") {
    return (
      <div className="relative p-3 bg-[#D97706] border-4 border-[#78350F] shadow-[3px_3px_0px_rgba(0,0,0,1)] select-none">
        {/* Crown header on top */}
        <div className="absolute -top-[12px] left-0 right-0 flex justify-center space-x-1.5 text-[8px] text-[#FBBF24] font-press-start animate-pulse pointer-events-none">
          <span>▲</span>👑<span>▲</span>
        </div>
        <div className="p-1 bg-[#F5F5F4] border-2 border-[#78350F] flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }
  // Default is Simple Frame
  return (
    <div className="p-2 bg-stone-300 border-4 border-double border-stone-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center select-none">
      <div className="p-0.5 bg-white border border-stone-800 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function AvatarDressingRoom({
  userProfile,
  language,
  onUpdateProfile,
  onClose
}: AvatarDressingRoomProps) {
  const currentAvatar = userProfile?.selectedAvatar || "Hero";
  const currentBorder = userProfile?.selectedBorder || "Simple Frame";
  const userLevel = userProfile?.level || 1;

  // Static locks definitions
  const avatarsList = [
    { id: "Hero", nameZh: "勇者護面甲", nameEn: "VALIANT HELM", reqLevel: 1 },
    { id: "Mage", nameZh: "魔導法師帽", nameEn: "WIZARD CROZIER", reqLevel: 5 },
    { id: "Dragon", nameZh: "古龍赤血爪", nameEn: "DRAGON EMBRYO", reqLevel: 12 }
  ];

  const bordersList = [
    { id: "Simple Frame", nameZh: "學院雙線邊框", nameEn: "ACADEMY FRAME", reqLevel: 1 },
    { id: "Thorn Frame", nameZh: "荊棘護佑之環", nameEn: "THORN SANCTUM", reqLevel: 8 },
    { id: "Crown Frame", nameZh: "傳奇金冠冕框", nameEn: "CORONATION GOLD", reqLevel: 15 }
  ];

  const isLocked = (reqLevel: number) => userLevel < reqLevel;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 md:p-4 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg bg-[#D3D3D3] border-4 border-black p-4 relative retro-shadow text-black"
      >
        {/* CRT Scan lines for aesthetics */}
        <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5" />

        {/* Modal Window Header */}
        <div className="flex justify-between items-center bg-black text-white px-2.5 py-1.5 border-b-4 border-black mb-4">
          <span className="font-press-start text-[8px] md:text-[9 tracking-wider">
            🛋️ {language === "zh" ? "衣櫥更衣室" : "AVATAR DRESSING ROOM"}
          </span>
          <button
            onClick={onClose}
            className="font-press-start text-xs text-white hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Main 2-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Column 1: Current Preview (Span 2) */}
          <div className="md:col-span-2 bg-[#E1E1E1] border-2 border-black p-4 flex flex-col items-center justify-center space-y-4">
            <h4 className="font-press-start text-[7.5px] uppercase tracking-wider text-[#4E4E4E] text-center">
              {language === "zh" ? "當前英雄外觀" : "HERO PREVIEW"}
            </h4>

            {/* Simulated Avatar and Border display */}
            <div className="w-24 h-24 flex items-center justify-center">
              <RenderBorder border={currentBorder}>
                <div className="w-14 h-14 flex items-center justify-center bg-stone-100">
                  <RenderAvatar avatar={currentAvatar} className="w-12 h-12" />
                </div>
              </RenderBorder>
            </div>

            <div className="text-center font-mono text-[10px] md:text-[11px] uppercase space-y-1">
              <div>
                <span className="text-gray-500 font-bold">{language === "zh" ? "外觀:" : "HAUBERK:"}</span>{" "}
                <span className="bg-white px-1.5 border border-black font-semibold text-black">
                  {currentAvatar}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-gray-500 font-bold">{language === "zh" ? "邊框:" : "AURA:"}</span>{" "}
                <span className="bg-white px-1.5 border border-black font-semibold text-black">
                  {currentBorder}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Selection Lists (Span 3) */}
          <div className="md:col-span-3 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {/* Avatars selections */}
            <div className="space-y-2">
              <h4 className="font-press-start text-[7px] text-black border-b border-black pb-1 uppercase tracking-wider">
                🛡️ {language === "zh" ? "選擇角色外觀" : "SELECT AVATAR"}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {avatarsList.map((avatar) => {
                  const locked = isLocked(avatar.reqLevel);
                  const active = currentAvatar === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      disabled={locked}
                      onClick={() => onUpdateProfile({ selectedAvatar: avatar.id })}
                      className={`w-full text-left font-mono text-[11px] p-2 flex items-center justify-between border-2 transition-all ${
                        active
                          ? "bg-black text-white border-black"
                          : locked
                          ? "bg-stone-400 text-stone-600 border-stone-500 cursor-not-allowed opacity-60"
                          : "bg-white hover:bg-stone-100 border-black active:translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {/* Little miniature preview */}
                        <div className={`p-0.5 border ${active ? "bg-white border-white" : "bg-stone-200 border-black"}`}>
                          <RenderAvatar avatar={avatar.id} className="w-5 h-5" />
                        </div>
                        <span className="font-bold">
                          {language === "zh" ? avatar.nameZh : avatar.nameEn}
                        </span>
                      </div>
                      <span className="font-press-start text-[6px]">
                        {locked ? `🔒 LV ${avatar.reqLevel}` : active ? "▶ EQ" : "SELECT"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Borders selections */}
            <div className="space-y-2 pt-1">
              <h4 className="font-press-start text-[7px] text-black border-b border-black pb-1 uppercase tracking-wider">
                👑 {language === "zh" ? "選擇護體守護環" : "SELECT FRAME"}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {bordersList.map((border) => {
                  const locked = isLocked(border.reqLevel);
                  const active = currentBorder === border.id;
                  return (
                    <button
                      key={border.id}
                      disabled={locked}
                      onClick={() => onUpdateProfile({ selectedBorder: border.id })}
                      className={`w-full text-left font-mono text-[11px] p-2 flex items-center justify-between border-2 transition-all ${
                        active
                          ? "bg-black text-white border-black"
                          : locked
                          ? "bg-stone-400 text-stone-600 border-stone-500 cursor-not-allowed opacity-60"
                          : "bg-white hover:bg-stone-100 border-black active:translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {language === "zh" ? border.nameZh : border.nameEn}
                        </span>
                      </div>
                      <span className="font-press-start text-[6px]">
                        {locked ? `🔒 LV ${border.reqLevel}` : active ? "▶ EQ" : "SELECT"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area: Bottom B Button Save & Close */}
        <div className="mt-4 pt-3 border-t-2 border-black/20 flex justify-end">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-4 py-2.5 bg-black text-white hover:bg-white hover:text-black border-2 border-black font-press-start text-[8px] uppercase tracking-wider select-none active:translate-y-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-75 cursor-pointer text-center"
          >
            {language === "zh" ? "[ ◀ B 鍵: 保存並返回旅店 ]" : "[ ◀ B BUTTON: SAVE & EXIT ]"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
