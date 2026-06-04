export type Language = "en" | "zh";

export interface TranslationSet {
  system_status: string;
  cache_synchronized: string;
  off_line_mode: string;
  app_title: string;
  platform: string;
  anomaly_error: string;
  awaiting_dungeon: string;
  awaiting_dungeon_desc: string;
  level_up_boosts: string;
  run_engine: string;
  start_processing: string;
  narrator_processing: string;
  narrator_loaded: string;
  narrator_greetings: string;
  footer_platform: string;
  footer_corp: string;
  exit_log: string;
  crypto_rsa: string;
  process_os: string;
  data_struct: string;
  capsule_audio: string;
  audio_desc: string;
  power_stage: string;
  record_btn: string;
  load_mp3: string;
  audio_ready: string;
  audio_vacant: string;
  disk_slides: string;
  slides_desc: string;
  drag_file: string;
  drop_formats: string;
  kb_loaded: string;
  disk_ready: string;
  disk_vacant: string;
  portal_youtube: string;
  youtube_desc: string;
  url_address: string;
  clear_portal: string;
  youtube_ready: string;
  youtube_vacant: string;
  manual_spell: string;
  manual_placeholder: string;
  optional: string;
  load_game: string;
  recorded: string;
  no_saves: string;
  no_saves_desc: string;
  slot: string;
  date: string;
  win_rate: string;
  wipe_confirm: string;
  email_filter: string;
  secret_passcode: string;
  new_adventure: string;
  continue_journey: string;
  or_gateway: string;
  google_signin: string;
  guest_mode: string;
  exam_approaching: string;
  connect_account_desc: string;
  current_secured: string;
  summary_tab: string;
  keynotes_tab: string;
  quiz_tab: string;
  narrator_advisor: string;
  active_alchemist: string;
  transmutation_chamber: string;
  xp_progress: string;
  preparing: string;
  transmuting: string;
  finalizing: string;
  hp_gauge: string;
  correct_streak: string;
  wrong_answer_damage: string;
  victory_title: string;
  defeat_title: string;
  back_to_map: string;
  play_again: string;
  explanation: string;
  next_match: string;
  equip_stars: string;
  historic_bg: string;
  core_concepts: string;
  dark_warning: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    system_status: "SYSTEM STATUS: ONLINE // CACHE SYNCHRONIZED",
    cache_synchronized: "CACHE SYNCHRONIZED",
    off_line_mode: "⚠️ OFFLINE MODE IN PLAY: SPELLS COMMITTED SAFELY TO BROWSER LOCALSTORAGE CORES.",
    app_title: "AI ACADEMIC COGNITION CONSOLE",
    platform: "PLATFORM: WEB // VER 1.0.5",
    anomaly_error: "TRANSMUTATION ANOMALY:",
    awaiting_dungeon: "AWAITING COGNITIVE DUNGEON LOAD",
    awaiting_dungeon_desc: "There are no active summaries, notes, or quiz campaigns loaded. Pick a finished card save from the database below or record new live university audio.",
    level_up_boosts: "⚡ LEVEL UP BOOSTS AVAILABLE WITH NEW COMPLETED EXPEDITIONS!",
    run_engine: "🕹️ RUN ENGINE - ENTRANCE PORTAL",
    start_processing: "✨ START AI PROCESSING SPELL ✨",
    narrator_processing: "[NARRATOR]: THE ALCHEMIST IN THE ENCHANTED CHAMBER IS DISSOLVING THE SLIDES INTO RPG SPELLS. STANDBY EXAM SOLDIER!",
    narrator_loaded: '[NARRATOR]: ACCESSED COMPILATIONS FOR "{title}". TRAVERSE INTO SUMMARY MAP OR CAST SPELLS IN TURN-BASED COMBAT QUIZ.',
    narrator_greetings: "[NARRATOR]: GREETINGS HERO! PREPARE YOUR COURSEWORK DUNGEON. UPLOAD DECK OR ACTIVATE OFFLINE TEMPLATES TO COMMENCEMENT EXPEDITIONS.",
    footer_platform: "COGNITIVE PLATFORM TERMINAL SEWERAGE",
    footer_corp: "© 1989-2026 UNIVERSITY TACTICAL WORKGROUNDS INC.",
    exit_log: "EXIT LOG",
    crypto_rsa: "✦ CRYPTO_RSA",
    process_os: "✦ PROCESS_OS",
    data_struct: "✦ DATA_STRUCT",
    capsule_audio: "⚙️ [CAPSULE_01] AUDIO",
    audio_desc: "Speak or insert recorded lecture audio files directly to transcribe & categorize secrets.",
    power_stage: "POWER STAGE:",
    record_btn: "RECORD",
    load_mp3: "LOAD MP3",
    audio_ready: "[READY FOR PROCESSING]",
    audio_vacant: "[INPUT VACANT]",
    disk_slides: "📀 [DISK_02] SLIDES",
    slides_desc: "Drag-and-drop or select lecture slides (.pdf, .ppt, .pptx) directly to filter formulas and traps.",
    drag_file: "DRAG FILE HERE OR CLICK TO BROWSE",
    drop_formats: "PDF / PPTX / PPT / TXT",
    kb_loaded: "KB LOADED",
    disk_ready: "[DISK INSERTED SUCCESSFULLY]",
    disk_vacant: "[DISK DRIVE VACANT]",
    portal_youtube: "🌐 [PORTAL_03] YOUTUBE",
    youtube_desc: "Paste standard academic or coding YouTube lecture links. The portal converts it into active dungeons.",
    url_address: "URL ADDRESS:",
    clear_portal: "[CLEAR URL PORTAL]",
    youtube_ready: "[CONJURING PORTAL KEYWAYS]",
    youtube_vacant: "[PORTAL STANDBY]",
    manual_spell: "✍️ MANUAL TRANSMUTATION SPELL TEXTBOX:",
    manual_placeholder: "TYPE OR PASTE EXTRA LECTURE GUIDELINES & SYLLABUS NOTES TO COMPLEMENT YOUR CAMPAIGN DECONSTRUCTION...",
    optional: "OPTIONAL",
    load_game: "💾 [LOAD GAME] - CLOUD CAMPAIGNS",
    recorded: "RECORDED",
    no_saves: "NO SAVES RECORDED IN VAULT",
    no_saves_desc: "Initialize a processing spell above to forge your first RPG notes save!",
    slot: "SLOT",
    date: "DATE",
    win_rate: "WIN RATE",
    wipe_confirm: "Do you want to wipe memory records of",
    email_filter: "EMAIL FILTERS:",
    secret_passcode: "SECRET PASSCODE:",
    new_adventure: "▶ NEW ADVENTURE",
    continue_journey: "▶ CONTINUE JOURNEY",
    or_gateway: "OR SELECT GATEWAY",
    google_signin: "🌐 SIGN IN WITH GOOGLE",
    guest_mode: "▶ OFFLINE GUEST MODE (LOCAL SAVE)",
    exam_approaching: "⚔️ WILD FINAL EXAM APPROACHING! ⚔️",
    connect_account_desc: "Connect your account to save your academic campaign and EXP level in the cloud.",
    current_secured: "CURRENT DUNGEON SECURED:",
    summary_tab: "📝 SUMMARY",
    keynotes_tab: "💡 KEYNOTES",
    quiz_tab: "🎯 QUIZ",
    narrator_advisor: "TACTICAL NARRATOR ADVISOR:",
    active_alchemist: "[ALCHEMIST_ACTIVE]",
    transmutation_chamber: "⚡ TRANSMUTATION CHAMBER ⚡",
    xp_progress: "XP PROCESS",
    preparing: "PREPARING...",
    transmuting: "TRANSMUTING...",
    finalizing: "FINALIZING SECRETS",
    hp_gauge: "HERO HP",
    correct_streak: "STREAK BONUSES:",
    wrong_answer_damage: "⚠️ MINUS -10 HP OVERRUN!",
    victory_title: "✨ STAGE CLEAR! ACADEMIC DEFEAT RESOLVED! ✨",
    defeat_title: "💀 GAME OVER: EXAM OVERRUN DETECTED! 💀",
    back_to_map: "🗺️ BACK TO STRATEGIC MAP",
    play_again: "🔄 COMBAT REBOOT (REPLAY)",
    explanation: "INSTRUCTION / TRAPS DEBUNKER:",
    next_match: "NEXT STAGE ⚔️",
    equip_stars: "EQUIPMENT RARITY",
    historic_bg: "🏛️ HISTORIC BACKGROUND",
    core_concepts: "🔮 CORE CONCEPT MECHANICS",
    dark_warning: "⚠️ NARRATOR TRAP ADVICE & WARNING"
  },
  zh: {
    system_status: "系統狀態：線上運作中 // 緩存已同步",
    cache_synchronized: "緩存已同步",
    off_line_mode: "⚠️ 離線模式：所有冒險筆記已安全存入瀏覽器 LocalStorage 核心中。",
    app_title: "AI 學術思維戰術控制台",
    platform: "平台：WEB 網頁版 // 版本 1.0.5",
    anomaly_error: "轉換時產生魔法異常：",
    awaiting_dungeon: "等待加載學術思維地下城",
    awaiting_dungeon_desc: "尚未加載任何 active 筆記、總結或測驗。請從下方數據庫中選擇已存檔的卡片，或現場錄製大學講座音訊！",
    level_up_boosts: "⚡ 完成新的學術遠征即可解鎖升級獎勵與經驗加成！",
    run_engine: "🕹️ 引擎發動 - 地下城入口傳送門",
    start_processing: "✨ 啟動 AI 知識轉換咒語 ✨",
    narrator_processing: "[旁白]：煉金室裡的學術賢者正在努力將 PPT 簡報幻化成 RPG 學術咒語！期末考戰士請稍候！",
    narrator_loaded: '[旁白]：已成功連線至「{title}」的傳說檔案。立刻進入總結地圖或在回合制戰鬥中發動Quiz攻勢！',
    narrator_greetings: "[旁白]：勇者安好！請做好期末遠征準備。上傳你的簡報，或激活下方的離線預設範本來開始冒險。",
    footer_platform: "學術控制台戰術系統網絡結構",
    footer_corp: "© 1989-2026 戰術大學工坊股份有限公司 全體版權所有。",
    exit_log: "登出備份",
    crypto_rsa: "✦ RSA加密神殿",
    process_os: "✦ OS進程魔域",
    data_struct: "✦ BST平衡之塔",
    capsule_audio: "⚙️ [膠囊 01] 語音錄製",
    audio_desc: "直接對麥克風說話或載入錄好的課程音檔，將音訊自動轉譯為戰術重點與考題。",
    power_stage: "錄音模組狀態：",
    record_btn: "錄製語音",
    load_mp3: "載入 MP3",
    audio_ready: "【錄音儲存就緒 - 準備融合】",
    audio_vacant: "【音軌插槽尚未就緒】",
    disk_slides: "📀 [磁碟 02] 講座簡報",
    slides_desc: "拖曳或選擇學校課程簡報 (.pdf, .ppt, .pptx, .txt)，迅速過濾必考公式與常見考題陷阱。",
    drag_file: "將檔案拖曳至此處或點擊手動瀏覽",
    drop_formats: "支援 PDF / PPTX / PPT / TXT 格式",
    kb_loaded: "KB 已載入",
    disk_ready: "【磁碟置入成功 - 軌道就緒】",
    disk_vacant: "【磁碟機槽空置中】",
    portal_youtube: "🌐 [傳送門 03] YOUTUBE 影像",
    youtube_desc: "貼上大學線上課程或寫程式教學的 YouTube 影片網址，傳送門會當場將影片轉化為冒險筆記。",
    url_address: "影片傳送地址：",
    clear_portal: "【重設傳送鏈結】",
    youtube_ready: "【傳送門鑰匙校準完畢】",
    youtube_vacant: "【傳送儀式待命中】",
    manual_spell: "✍️ 手動輸入輔助魔法文字欄：",
    manual_placeholder: "在此輸入或貼上額外的大學課程大綱、手寫筆記或補充細節，能讓生成的戰鬥地下城更加精準...",
    optional: "可選選項",
    load_game: "💾 【加載存檔】 - 雲端學術戰役紀錄",
    recorded: "個存動檔案",
    no_saves: "雲端儲存庫中沒有任何存檔記錄",
    no_saves_desc: "請先在上方啟動轉換魔法來鍛造您的第一個學術 RPG 冒險存檔！",
    slot: "存檔槽",
    date: "日期",
    win_rate: "勝率",
    wipe_confirm: "您確定要清除並永遠遺忘此檔案的記憶和進度嗎：",
    email_filter: "勇者電子信箱：",
    secret_passcode: "密室驗證金鑰 (密碼)：",
    new_adventure: "▶ 新建勇者角色",
    continue_journey: "▶ 繼承冒險旅程",
    or_gateway: "或選擇傳送通道",
    google_signin: "🌐 以 Google 帳號登入",
    guest_mode: "▶ 離線遊客模式 (僅保存在本機)",
    exam_approaching: "⚔️ 警報！野生期末大考正朝著你走來！ ⚔️",
    connect_account_desc: "連接您的個人帳號將能在雲端無限同步冒險筆記、EXP等級與戰術分析。",
    current_secured: "當前攻略成功的地下城：",
    summary_tab: "📝 戰略地圖總結",
    keynotes_tab: "💡 傳說裝備要點",
    quiz_tab: "🎯 戰鬥問答考驗",
    narrator_advisor: "戰術導師旁白提點：",
    active_alchemist: "【大賢者轉換魔法注入中】",
    transmutation_chamber: "⚡ 學術煉金術轉換室 ⚡",
    xp_progress: "經驗升級進度度量",
    preparing: "準備煉金術媒介中...",
    transmuting: "重組考題矩陣中...",
    finalizing: "秘密檔案正在編解碼...",
    hp_gauge: "勇者生命值 HP",
    correct_streak: "連擊狀態加成：",
    wrong_answer_damage: "⚠️ 魔法反噬！生命值減少 -10 HP！",
    victory_title: "✨ 勝利！成功消滅期末考魔王！ ✨",
    defeat_title: "💀 期末大考碾壓！全軍覆沒，勇者請重新修煉！ 💀",
    back_to_map: "🗺️ 返回戰略地圖",
    play_again: "🔄 再戰一次（重刷考驗）",
    explanation: "魔法要領與陷阱破解說明：",
    next_match: "迎戰下一回合 ⚔️",
    equip_stars: "戰備珍貴度等級",
    historic_bg: "🏛️ 歷史起源背景",
    core_concepts: "🔮 核心思維戰術運行原理",
    dark_warning: "⚠️ 學術防身與大考排雷建議"
  }
};
