import { useState } from "react";
import { SaveSlot, LectureRPGData } from "../types";
import { Trash2 } from "lucide-react";
import { Language } from "../translations";

interface LoadGameProps {
  saves: SaveSlot[];
  activeSaveId?: string;
  onSelectSave: (save: SaveSlot) => void;
  onDeleteSave?: (id: string) => void;
  onShowWrongQuizzes: () => void;
  loading: boolean;
  lang?: Language;
}

export default function LoadGame({
  saves,
  activeSaveId,
  onSelectSave,
  onDeleteSave,
  onShowWrongQuizzes,
  loading,
  lang = "zh"
}: LoadGameProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSelect = (save: SaveSlot) => {
    setAnimatingId(save.id);
    // Invert feedback animation for Game Boy aesthetics
    setTimeout(() => {
      setAnimatingId(null);
      onSelectSave(save);
    }, 400); // 400ms flash duration
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, "0");
      const d = date.getDate().toString().padStart(2, "0");
      return `${y}/${m}/${d}`;
    } catch (e) {
      return "2026/05/28";
    }
  };

  return (
    <div className="bg-[#D3D3D3] border-4 border-black p-4 md:p-5 retro-shadow w-full">
      <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-1.5">
        <h3 className="font-press-start text-[8px] uppercase">
          💾 {lang === "zh" ? "[載入存檔] - 雲端與單機目錄" : "[LOAD GAME] - CAMPAIGNS"}
        </h3>
        <span className="font-press-start text-[6px] text-[#707070] uppercase">
          {saves.length} {lang === "zh" ? "組紀錄" : "SAVES"}
        </span>
      </div>

      <button
        onClick={onShowWrongQuizzes}
        type="button"
        className="w-full mb-3 py-2 px-3 font-press-start border-4 border-black bg-white hover:bg-black text-black hover:text-white transition-all text-[7px] flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 focus:outline-none select-none"
      >
        ☠️ {lang === "zh" ? "副本除魔錄 (戰略錯題本)" : "THE BROKEN SHIELD (WRONG QUIZZES)"}
      </button>

      {loading ? (
        // Skeleton Game Boy Save selection box
        <div className="space-y-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="border-2 border-black bg-white p-3 h-12 animate-pulse flex items-center justify-between"
            >
              <div className="h-1.5 w-1/3 bg-black"></div>
              <div className="h-1.5 w-1/4 bg-black"></div>
            </div>
          ))}
        </div>
      ) : saves.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-black p-5 text-center">
          <span className="text-lg">📭</span>
          <p className="font-press-start text-[7px] text-black mt-2 uppercase leading-relaxed text-[#707070]">
            {lang === "zh" ? "存檔法陣目前尚無歷程" : "NO SAVES RECORDED IN VAULT"}
          </p>
          <p className="font-mono text-[11px] mt-1 text-[#707070] uppercase">
            {lang === "zh" ? "請在上方煉金腔傳送講義，即刻鍛造您的首套 RPG 戰卷！" : "Initialize a processing spell above to forge your first RPG notes save!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {saves.map((save, index) => {
            const isSelected = activeSaveId === save.id;
            const isAnimating = animatingId === save.id;

            // Inversion styling:
            let bgClass = "bg-white text-black";
            if (isAnimating) {
              bgClass = "bg-black text-white"; // Absolute flash inversion
            } else if (isSelected) {
              bgClass = "bg-black text-white"; // Stay highlighted
            }

            const isConfirming = confirmDeleteId === save.id;

            if (isConfirming) {
              return (
                <div
                  key={save.id}
                  className="w-full bg-[#8B221D] text-white border-4 border-[#3A0D0A] p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none animate-pulse"
                >
                  <div className="font-press-start text-[7px] text-[#FFA29D] uppercase tracking-wider text-left leading-relaxed">
                    ⚠️ {lang === "zh" ? "抹除此存檔記憶？" : "WIPE SAVE?"}
                    <div className="text-[6.5px] text-white truncate max-w-[150px] font-mono mt-0.5">{save.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteSave) {
                          onDeleteSave(save.id);
                        }
                        setConfirmDeleteId(null);
                      }}
                      className="bg-white text-black hover:bg-stone-100 border-2 border-black font-press-start text-[7px] px-2 py-1.5 transition-all active:translate-y-0.5 cursor-pointer"
                    >
                      {lang === "zh" ? "確認" : "YES"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="bg-black text-white hover:bg-white hover:text-black border-2 border-white font-press-start text-[7px] px-2 py-1.5 transition-all active:translate-y-0.5 cursor-pointer"
                    >
                      {lang === "zh" ? "取消" : "NO"}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={save.id}
                className="flex items-stretch gap-1.5"
              >
                {/* Clicking custom Slot details */}
                <button
                  onClick={() => handleSelect(save)}
                  type="button"
                  className={`flex-1 text-left p-3 hover:bg-black hover:text-white transition-all select-none border-4 border-black cursor-pointer leading-relaxed ${bgClass}`}
                >
                  <div className="flex flex-col justify-between font-press-start text-[8px] gap-1 w-full">
                    <div className="truncate">
                      <span className="mr-1.5 font-bold text-gray-500">SLOT {index + 1}:</span>
                      <span className="font-bold underline uppercase truncate inline-block align-bottom max-w-[150px]">{save.title}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[#707070] text-[6.5px]">
                      <span>[DATE: {formatDate(save.created_at)}]</span>
                      <span
                        className={
                          save.win_rate >= 80
                            ? "text-[#404040] font-bold"
                            : save.win_rate >= 50
                            ? "text-black"
                            : "text-[#707070]"
                        }
                      >
                        [WR: {save.win_rate}%]
                      </span>
                    </div>
                  </div>
                </button>

                {/* Direct delete button tool */}
                {onDeleteSave && (
                  <button
                    onClick={() => setConfirmDeleteId(save.id)}
                    type="button"
                    title="Delete Save Slot"
                    className="border-4 border-black bg-white px-3 flex items-center justify-center text-red-600 hover:bg-black hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
