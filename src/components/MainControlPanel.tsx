import React, { useState, useRef } from "react";
import { Mic, Upload, Video, Sparkles, HelpCircle, Power } from "lucide-react";
import { translations, Language } from "../translations";

interface MainControlPanelProps {
  onProcess: (config: {
    type: "audio" | "document" | "youtube" | "text";
    payload: string;
    fileName?: string;
    fileData?: string;
    difficulty?: "easy" | "hard";
  }) => void;
  isProcessing: boolean;
  onLogout: () => void;
  userEmail: string;
  userStats: { level: number; xp: number; winRate: number };
  lang: Language;
  forcedTab?: "audio" | "document" | "youtube" | "text";
}

export default function MainControlPanel({
  onProcess,
  isProcessing,
  onLogout,
  userEmail,
  userStats,
  lang,
  forcedTab
}: MainControlPanelProps) {
  // Input states
  const [activeInputTab, setActiveInputTab] = useState<"audio" | "document" | "youtube">(() => {
    if (forcedTab === "text" || forcedTab === "audio") return "audio";
    if (forcedTab === "document") return "document";
    if (forcedTab === "youtube") return "youtube";
    return "audio";
  });

  React.useEffect(() => {
    if (forcedTab) {
      if (forcedTab === "text" || forcedTab === "audio") {
        setActiveInputTab("audio");
      } else {
        setActiveInputTab(forcedTab as any);
      }
    }
  }, [forcedTab]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [textInput, setTextInput] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");

  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string>("");

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docBase64, setDocBase64] = useState<string>("");
  const [docText, setDocText] = useState<string>("");

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recIntervalRef = useRef<any>(null);

  // Drag and Drop states
  const [dragActive, setDragActive] = useState(false);

  // File Inputs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Helper: Read file as Base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(lang === "zh" ? "此瀏覽器環境下不支援麥克風錄製設備。" : "Microphone capture is not supported on this browser context.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const mockFile = new File([audioBlob], "rec-session.mp3", { type: "audio/mp3" });
        setAudioFile(mockFile);
        const base64 = await fileToBase64(mockFile);
        setAudioBase64(base64);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error(e);
      alert(lang === "zh" ? "請在瀏覽器設定中授予麥克風權限以進行錄音。" : "Please allow mic access under your Settings panel to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recIntervalRef.current) {
        clearInterval(recIntervalRef.current);
      }
    }
  };

  // File loaders
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const b64 = await fileToBase64(file);
      setAudioBase64(b64);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      const b64 = await fileToBase64(file);
      setDocBase64(b64);
      
      if (file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocText(event.target?.result as string || "");
        };
        reader.readAsText(file);
      } else {
        // Auto-extract textual mockup or name
        setDocText(lang === "zh"
          ? `成功上傳檔案「${file.name}」。已載入拼圖關卡數據公式、指引與章節核心知識點。`
          : `Extracted contents of file: ${file.name}. Hard academic topic formulas, guidelines, and outline definitions.`
        );
      }
    }
  };

  // Drag and Drop Logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isPdfOrPowerpoint =
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".ppt") ||
        file.name.endsWith(".pptx") ||
        file.name.endsWith(".txt");

      if (isPdfOrPowerpoint) {
        setDocFile(file);
        const b64 = await fileToBase64(file);
        setDocBase64(b64);
        
        if (file.name.endsWith(".txt")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setDocText(event.target?.result as string || "");
          };
          reader.readAsText(file);
        } else {
          setDocText(lang === "zh"
            ? `成功轉換拖曳簡報「${file.name}」`
            : `Transmuted information from dropped slides file: ${file.name}`
          );
        }
      } else {
        alert(lang === "zh" ? "請拖角或上傳有效的 PDF, PPT, PPTX 或 TXT 純文字檔案。" : "Please drop a valid PDF, PPT, PPTX or Text document.");
      }
    }
  };

  const handleSubmit = () => {
    // Determine action strictly based on the visible activeInputTab
    if (activeInputTab === "youtube") {
      if (!youtubeUrl.trim()) {
        alert(lang === "zh" ? "請置入 YouTube 影片網址！" : "Please insert a YouTube URL first!");
        return;
      }
      onProcess({
        type: "youtube",
        payload: youtubeUrl,
        difficulty
      });
    } else if (activeInputTab === "document") {
      if (!docBase64 && !docText) {
        alert(lang === "zh" ? "請上傳或拖拽簡報投影片檔案！" : "Please upload or drop lecture slides document first!");
        return;
      }
      onProcess({
        type: "document",
        payload: docText,
        fileName: docFile?.name || "document.pdf",
        fileData: docBase64,
        difficulty
      });
    } else if (activeInputTab === "audio") {
      // Audio tab contains both audio upload/recording and the manual text/notes spell helper
      if (audioBase64) {
        onProcess({
          type: "audio",
          payload: textInput || "Speech Transcription",
          fileName: audioFile?.name || "recording.mp3",
          fileData: audioBase64,
          difficulty
        });
      } else if (textInput.trim()) {
        onProcess({
          type: "text",
          payload: textInput,
          difficulty
        });
      } else {
        alert(lang === "zh" ? "請錄音、載入 MP3，或輸入手寫文字主題！" : "Please record audio, upload an MP3, or enter a text topic first!");
      }
    }
  };

  const loadTopicTemplate = (topic: string) => {
    if (topic === "crypto") {
      setYoutubeUrl("https://www.youtube.com/watch?v=RSA_Cryptography_Lecture");
      setActiveInputTab("youtube");
    } else if (topic === "os") {
      setTextInput(lang === "zh" 
        ? "作業系統進程管理：什麼是 PCB (進程控制塊)？上下文切換 (Context Switch) 為什麼上下文重啟消耗資源？排程隊列運作機制與殭屍 orphans 解構。" 
        : "Operating Systems: Process Management, PCBs, Context Switching and memory scheduling."
      );
      setActiveInputTab("audio");
      // Clean other inputs so they don't block
      setYoutubeUrl("");
      setAudioFile(null);
      setAudioBase64("");
      setDocFile(null);
      setDocBase64("");
    } else {
      setTextInput(lang === "zh"
        ? "資料結構：二元搜索樹 (BST) 之平衡機制、AVL 旋轉、紅黑樹 (Red-Black Algorithm) 的不變性與旋轉不變式分析。"
        : "Data Structures Chapter 5: Binary Search Tree Balancing, AVL rotatings, Red-Black algorithm invariants."
      );
      setActiveInputTab("audio");
      // Clean other inputs so they don't block
      setYoutubeUrl("");
      setAudioFile(null);
      setAudioBase64("");
      setDocFile(null);
      setDocBase64("");
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Dynamic Status Dashboard Rail */}
      <div className="flex flex-col bg-black text-white p-3 border-4 border-black gap-3 items-center select-none w-full">
        <div className="flex gap-3 items-center justify-between w-full">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-press-start text-[10px] bg-white text-black font-extrabold">
              {userStats.level}
            </div>
            <div>
              <div className="font-press-start text-[8px] tracking-wide text-[#D3D3D3]">
                HERO: <span className="text-white truncate max-w-[120px] inline-block align-bottom">{userEmail.split("@")[0].toUpperCase()}</span>
              </div>
              <div className="font-press-start text-[6px] text-[#A3A3A3] mt-0.5">
                STATS: XP {userStats.xp} // WR {userStats.winRate}%
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            type="button"
            className="px-2 py-1 bg-white text-black hover:bg-[#D3D3D3] text-[7px] font-press-start border-2 border-white flex items-center gap-1 active:scale-95 transition-all"
          >
            <Power className="w-2.5 h-2.5" /> {lang === "zh" ? "安全登出" : "EXIT_LOG"}
          </button>
        </div>

        {/* Templates option bar */}
        <div className="flex gap-2 w-full justify-start overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-gray-800">
          <span className="font-press-start text-[6px] text-[#A3A3A3] self-center flex-shrink-0 uppercase">
            {lang === "zh" ? "實例範本:" : "SAMPLES:"}
          </span>
          <button
            onClick={() => loadTopicTemplate("crypto")}
            type="button"
            className="px-2 py-0.5 bg-[#404040] hover:bg-white hover:text-black text-white text-[7px] font-press-start border border-white flex-shrink-0"
          >
            ✦ CRYPTO
          </button>
          <button
            onClick={() => loadTopicTemplate("os")}
            type="button"
            className="px-2 py-0.5 bg-[#404040] hover:bg-white hover:text-black text-white text-[7px] font-press-start border border-white flex-shrink-0"
          >
            ✦ PROC_OS
          </button>
        </div>
      </div>

      {/* MONOCHROME 8-BIT TABS BAR FOR MAX MOBILE ERGONOMICS */}
      {!forcedTab && (
        <div className="flex border-4 border-black bg-white select-none">
          <button
            type="button"
            onClick={() => setActiveInputTab("audio")}
            className={`flex-1 py-1.5 font-press-start text-[8px] border-r-2 border-black last:border-r-0 transition-all ${
              activeInputTab === "audio" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            🎙️ {lang === "zh" ? "語音 / 筆記" : "SPEECH / TXT"}
          </button>
          <button
            type="button"
            onClick={() => setActiveInputTab("document")}
            className={`flex-1 py-1.5 font-press-start text-[8px] border-r-2 border-black last:border-r-0 transition-all ${
              activeInputTab === "document" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            📄 {lang === "zh" ? "簡報上傳" : "SLIDES"}
          </button>
          <button
            type="button"
            onClick={() => setActiveInputTab("youtube")}
            className={`flex-1 py-1.5 font-press-start text-[8px] last:border-r-0 transition-all ${
              activeInputTab === "youtube" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            🎥 {lang === "zh" ? "影片網址" : "YOUTUBE"}
          </button>
        </div>
      )}

      {/* Render selected active input card */}
      <div className="bg-white">
        {activeInputTab === "audio" && (
          <div className="space-y-4">
            {/* SLOT 1: Audio Recorder/Uploader Capsule */}
            {forcedTab !== "text" && (
              <div className="bg-[#D3D3D3] border-4 border-black p-4 relative overflow-hidden">
                <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-press-start text-[8px] border-b-2 border-black pb-0.5 uppercase">
                      🎙️ {translations[lang].capsule_audio}
                    </h3>
                    <Mic className="w-4 h-4 text-black" />
                  </div>
                  <p className="font-mono text-[10px] text-[#505050] mb-3 leading-relaxed uppercase">
                    {translations[lang].audio_desc}
                  </p>

                  {/* Recording Controls */}
                  <div className="border-2 border-black bg-white p-2.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-press-start text-[6px] text-[#707070]">{translations[lang].power_stage}</span>
                      <span className={`font-press-start text-[7px] ${isRecording ? "text-red-600 animate-pulse font-bold" : "text-black"}`}>
                        {isRecording ? "● RECORDING" : "[STANDBY]"}
                      </span>
                    </div>

                    {isRecording ? (
                      <div className="text-center py-1.5 bg-black text-white">
                        <span className="font-press-start text-xs">{formatTime(recordingSeconds)}</span>
                        <div className="text-[6px] font-press-start animate-pulse mt-1 text-red-500">
                          {lang === "zh" ? "傳說音訊擷取中..." : "CAPTURING AUDIO SLIDES..."}
                        </div>
                      </div>
                    ) : audioFile ? (
                      <div className="p-1.5 border border-dashed border-black bg-[#EAEAEA] text-[#333] text-[8px] font-press-start truncate">
                        📻 {audioFile.name}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-400 font-mono text-[10px]">
                        {lang === "zh" ? "請點擊下方投置您的錄音軌道" : "TAP BELOW TO EMBED LECTURE RECORDINGS"}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {isRecording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="col-span-2 text-[7px] py-1.5 bg-red-600 hover:bg-red-700 font-press-start border border-black text-white hover:text-black active:translate-y-0.5 transition-all"
                        >
                          ■ {lang === "zh" ? "中斷錄音歸檔" : "STOP CAPTURE"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          disabled={isProcessing}
                          className="text-[7px] py-1.5 bg-[#EAEAEA] hover:bg-black font-press-start border border-black text-black hover:text-white"
                        >
                          ▶ {translations[lang].record_btn}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={isRecording || isProcessing}
                        className="text-[7px] py-1.5 bg-white hover:bg-black font-press-start border border-black text-black hover:text-white"
                      >
                        📁 {translations[lang].load_mp3}
                      </button>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioUpload}
                    accept="audio/*"
                    className="hidden"
                  />
                </div>

                <div className="mt-3 text-[7px] font-mono text-[#707070] uppercase">
                  {audioFile ? `[${translations[lang].audio_ready}]` : `[${translations[lang].audio_vacant}]`}
                </div>
              </div>
            )}

            {/* Manual text input drawer fallback for quick typing */}
            {forcedTab !== "audio" && (
              <div className="bg-[#D3D3D3] border-4 border-black p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-press-start text-[7px] font-bold uppercase">{lang === "zh" ? "✍️ 手動輸入輔助編譯法典" : "✍️ MANUAL LECTURE NOTES SPELL"}:</label>
                  <span className="font-press-start text-[6px] text-[#707070]">{translations[lang].optional}</span>
                </div>
                <textarea
                  rows={4}
                  placeholder={translations[lang].manual_placeholder}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-[11px] uppercase outline-none focus:border-black"
                ></textarea>
              </div>
            )}
          </div>
        )}

        {activeInputTab === "document" && (
          /* SLOT 2: Slides/Document Transmutation Disk */
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`bg-[#D3D3D3] border-4 border-black p-4 relative transition-colors ${
              dragActive ? "bg-[#FFFFFF] border-dashed" : ""
            }`}
          >
            <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-press-start text-[8px] border-b-2 border-black pb-0.5 uppercase">
                  📀 {translations[lang].disk_slides}
                </h3>
                <Upload className="w-4 h-4 text-black" />
              </div>

              <p className="font-mono text-[10px] text-[#505050] mb-3 leading-relaxed uppercase">
                {translations[lang].slides_desc}
              </p>

              <div
                type="button"
                className="border-2 border-black bg-white p-4 flex flex-col items-center justify-center min-h-[100px] text-center hover:bg-[#EAEAEA] cursor-pointer"
                onClick={() => docInputRef.current?.click()}
              >
                {docFile ? (
                  <div className="space-y-1 text-center w-full">
                    <span className="text-lg">📄</span>
                    <div className="font-press-start text-[8px] text-black truncate w-full p-0.5">
                      {docFile.name}
                    </div>
                    <div className="text-[6px] font-press-start text-[#707070] uppercase">
                      {(docFile.size / 1024).toFixed(1)} {translations[lang].kb_loaded}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-xl animate-bounce block">💿</span>
                    <span className="font-press-start text-[7px] text-[#707070] block">
                      {translations[lang].drag_file}
                    </span>
                    <span className="text-[5px] font-press-start text-gray-400 block uppercase">
                      PDF / PPTX / PPT / TXT
                    </span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={docInputRef}
                onChange={handleDocUpload}
                accept=".pdf,.ppt,.pptx,.txt"
                className="hidden"
              />
            </div>

            <div className="mt-3 text-[7px] font-mono text-[#707070] uppercase">
              {docFile ? `[${translations[lang].disk_ready}]` : `[${translations[lang].disk_vacant}]`}
            </div>
          </div>
        )}

        {activeInputTab === "youtube" && (
          /* SLOT 3: YouTube Portal link pasting */
          <div className="bg-[#D3D3D3] border-4 border-black p-4 relative overflow-hidden">
            <div className="absolute inset-0 screen-scanlines pointer-events-none opacity-5"></div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-press-start text-[8px] border-b-2 border-black pb-0.5 uppercase">
                  🎥 {translations[lang].portal_youtube}
                </h3>
                <Video className="w-4 h-4 text-black" />
              </div>

              <p className="font-mono text-[10px] text-[#505050] mb-3 leading-relaxed uppercase">
                {translations[lang].youtube_desc}
              </p>

              <div className="border-2 border-black bg-white p-3 space-y-2.5">
                <div>
                  <label className="block font-press-start text-[6px] mb-1.5 text-[#707070]">{translations[lang].url_address}</label>
                  <input
                    type="text"
                    placeholder="HTTP://YOUTUBE.COM/WATCH?V=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={isProcessing}
                    className="w-full h-8 px-2 font-mono text-[11px] bg-white border border-black outline-none uppercase"
                  />
                </div>

                {youtubeUrl && (
                  <button
                    type="button"
                    onClick={() => setYoutubeUrl("")}
                    className="w-full font-press-start text-[6px] text-red-600 uppercase border border-red-600 py-1 hover:bg-red-50"
                  >
                    [{translations[lang].clear_portal}]
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 text-[7px] font-mono text-[#707070] uppercase">
              {youtubeUrl ? `[${translations[lang].youtube_ready}]` : `[${translations[lang].youtube_vacant}]`}
            </div>
          </div>
        )}
      </div>

      {/* 🧬 Dungeon Difficulty Level Selector */}
      <div className="bg-[#D3D3D3] border-4 border-black p-3 space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <label className="block font-press-start text-[7px] text-black uppercase font-bold">
          ⚡ {lang === "zh" ? "自訂副本難度 (DUNGEON DIFFICULTY):" : "DUNGEON DIFFICULTY LEVEL:"}
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDifficulty("easy")}
            className={`py-2 px-1 text-[7px] font-press-start border-2 border-black transition-all ${
              difficulty === "easy" 
                ? "bg-black text-white font-extrabold" 
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            👾 {lang === "zh" ? "史萊姆級 (EASY)" : "SLIME (EASY)"}
          </button>
          
          <button
            type="button"
            onClick={() => setDifficulty("hard")}
            className={`py-2 px-1 text-[7px] font-press-start border-2 border-black transition-all ${
              difficulty === "hard" 
                ? "bg-black text-white font-extrabold" 
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            👹 {lang === "zh" ? "地獄魔王 (HARD)" : "DEMON LORD (HARD)"}
          </button>
        </div>

        <div className="font-mono text-[9px] text-[#505050] leading-snug uppercase pt-1 border-t border-black/15">
          {difficulty === "easy" 
            ? (lang === "zh" 
                ? "▶ [ 史萊姆級 ]：AI 僅會提煉基礎名詞解釋，與 3 題簡易戰鬥是非題。" 
                : "▶ [ SLIME CLASS ]: Generates basic terminology summaries and 3 easy true/false battle quizzes.")
            : (lang === "zh" 
                ? "▶ [ 地獄魔王級 ]：包含複數核心申論大綱，與 5 題複雜的計算與邏輯深度戰鬥考題！" 
                : "▶ [ DEMON LORD ]: Transmutes complex theoretical outlines and 5 intense computational/logical battles!")
          }
        </div>
      </div>

      {/* Bottom Massive CTA Button */}
      <div className="pt-1">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          type="button"
          className="w-full font-press-start text-[10px] md:text-xs py-4 border-4 tracking-wider flex items-center justify-center gap-3 bg-white text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#EAEAEA] active:scale-95 duration-75 text-center font-bold"
        >
          <Sparkles className="w-4 h-4 text-black animate-pulse" />
          {translations[lang].start_processing}
        </button>
      </div>
    </div>
  );
}
