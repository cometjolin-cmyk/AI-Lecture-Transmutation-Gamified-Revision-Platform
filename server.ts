import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
// @ts-ignore
import officeParser from "officeparser";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits to support file/audio uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route for Lecture AI Transmutation
  app.post("/api/process", async (req, res) => {
    try {
      const { type, payload, fileName, fileData, lang, difficulty } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY or model provider config is missing. Please configure it in the Secrets panel."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const isZh = lang === "zh";
      const isHard = difficulty === "hard";

      let rawExtractedText = "";

      // ====== STAGE 1: Extract pure text transcript or text content ======
      if (type === "text" || type === "youtube" || (fileName && fileName.toLowerCase().endsWith(".txt"))) {
        if (type === "youtube") {
          rawExtractedText = `YouTube academic portal link: ${payload}. Please generate comprehensive lecture notes and course material outline focusing on this specific educational domain, extracting theoretical concepts, formulas, mathematical models, or code paradigms normally covered.`;
        } else {
          rawExtractedText = payload || "";
        }
      } else {
        let isOfficeDoc = false;
        let mime = "application/pdf";
        let base64 = "";

        if (fileData) {
          mime = fileData.split(";")[0]?.split(":")[1] || "";
          base64 = fileData.split(",")[1] || fileData;

          const mimeLower = mime.toLowerCase();
          const nameLower = (fileName || "").toLowerCase();

          isOfficeDoc = 
            mimeLower.includes("officedocument") || 
            mimeLower.includes("powerpoint") || 
            mimeLower.includes("ms-powerpoint") || 
            mimeLower.includes("msword") || 
            mimeLower.includes("wordprocessingml") || 
            mimeLower.includes("spreadsheetml") || 
            mimeLower.includes("excel") || 
            mimeLower.includes("ms-excel") || 
            nameLower.endsWith(".pptx") || 
            nameLower.endsWith(".ppt") || 
            nameLower.endsWith(".docx") || 
            nameLower.endsWith(".doc") || 
            nameLower.endsWith(".xlsx") || 
            nameLower.endsWith(".xls");
        }

        if (isOfficeDoc && base64) {
          console.log(`[Stage 1] Detecting Office Document (${fileName}). Parsing using officeparser...`);
          try {
            const buffer = Buffer.from(base64, "base64");
            const parsedText: string = await new Promise((resolve, reject) => {
              (officeParser as any).parseOffice(buffer, (data: any, err: any) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(data || "");
                }
              });
            });
            rawExtractedText = parsedText || "";
            console.log(`[Stage 1] Office document "${fileName}" parsed successfully. Extracted ${rawExtractedText.length} characters.`);
          } catch (parseErr: any) {
            console.error("[Stage 1] officeparser extraction failed:", parseErr);
            throw new Error(isZh 
              ? `【解析文件失敗】無法從選擇之檔案「${fileName}」提煉學術內容。請確認該檔案未受損壞，或將內容轉為 PDF/純文字後再次上傳。`
              : `【Parser Error】Failed to extract academic content from office file "${fileName}". Please ensure the file is not corrupted, or convert to PDF/Text and try again.`
            );
          }
        } else {
          // Standard audio, PDF, or other natively supported mime types
          const stage1Parts: any[] = [];
          let stage1Instruction = "";

          if (type === "audio") {
            stage1Instruction = isZh
              ? "你是一個精準的課程聽力逐字稿與大綱記錄專家。請仔細聽取並分析音檔中的全部語音內容，將課程精華完整、詳盡地轉錄為繁體中文文字課堂紀錄。保留任何關鍵的英文專用名詞與學術概念。"
              : "You are a precise classroom transcriber. Transcribe and extract all relevant spoken knowledge, concepts, formulas, and facts from the uploaded audio file into deep, detailed lecture notes and text outlines.";

            if (fileData) {
              const audioMime = mime || "audio/mp3";
              stage1Parts.push({
                inlineData: {
                  mimeType: audioMime,
                  data: base64
                }
              });
            }
          } else if (type === "document") {
            stage1Instruction = isZh
              ? "你是一個精準的高校課程 PDF 與簡報投影片閱讀特攻（Vision 模式）。請仔細閱讀並分析上傳的 PDF 檔案中的每一頁，完整提取所有學術定義、演算公式、重要圖表數據、定理說明、程式碼段落與投影片大綱，並轉為一份極為詳盡的繁體中文文字精華紀錄。"
              : "You are a highly precise document reading specialist. Analyze and read the uploaded PDF document, extracting all theoretical formulas, calculations, code snippets, terminology definitions, and course outlines into a comprehensive text document.";

            if (fileData) {
              const pdfMime = mime || "application/pdf";
              stage1Parts.push({
                inlineData: {
                  mimeType: pdfMime,
                  data: base64
                }
              });
            }
          }

          stage1Parts.push({
            text: isZh
              ? `請幫我完整分析並提煉素材 "${fileName || "lecture_material"}" 的內容並寫出極其詳盡的文字紀錄：`
              : `Please comprehensively extract all textual facts and parameters from the uploaded file: "${fileName || "lecture_material"}":`
          });

          console.log(`[Stage 1] Start multimodal text extraction for ${type} (${mime || "default"})...`);
          const stage1Response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: stage1Parts },
            config: {
              systemInstruction: stage1Instruction
            }
          });

          rawExtractedText = stage1Response.text || "";
          console.log(`[Stage 1] Extracted ${rawExtractedText.length} characters successfully!`);
        }
      }

      // ====== STAGE 2: Decoupled RPG Synthesis inside Zod JSON Schema ======
      console.log("[Stage 2] Starting 8-bit Dungeon RPG note synthesis using JSON Schema...");
      
      const parts: any[] = [];
      let systemInstruction = `You are a high-fidelity retro Dungeon Master specialized in Turning university lecture materials into an 8-bit game style Academic Note adventure.
You combine educational value with retro 8-bit text dialogue and narrator styles similar to original Pokémon Red & Blue, Final Fantasy, or Game Boy games.`;

      if (isHard) {
        systemInstruction += `\n\nDIFFICULTY LEVEL: HARD (DEMON LORD CLASS).
Formulate the response containing:
1. An 8-bit style title (e.g. CRYPTO_CRYPT, PROC_DUNGEON, INF_SEC_CASTLE).
2. A Summary designed as a 'Strategic Map' with background, core concepts (focus on multiple complex essay/analytical outlines), and a one-sentence summary.
3. Keynotes designed as 'Legendary Equipment' with custom bold monospace definitions, formula representation, or exam traps, and an importance rating of 3 stars.
4. An intense interactive combat quiz containing EXACTLY 5 high-difficulty multiple-choice analytical/computational challenges. Options must be labeled as 'A: ...', 'B: ...', 'C: ...', 'D: ...'.`;
      } else {
        systemInstruction += `\n\nDIFFICULTY LEVEL: EASY (SLIME CLASS).
Formulate the response containing:
1. An 8-bit style title (e.g. SLIME_TERMS, BASE_DUNGEON).
2. A Summary designed as a 'Strategic Map' with basic terminology explanations, background, and a one-sentence summary.
3. Keynotes designed as 'Basic Items' with foundational academic concept definitions, and an importance rating of 1 star.
4. A simple interactive combat quiz containing EXACTLY 3 easy True/False (是非題) or simple multiple-choice questions. Options must be labeled as 'A: ...', 'B: ...', 'C: ...', 'D: ...' (for True/False questions, write e.g. 'A: TRUE / 是', 'B: FALSE / 否').`;
      }

      systemInstruction += `\n\n${isZh ? "IMPORTANT DIRECTIVE: Since the user's selected language is \"zh\" (Traditional Chinese), YOU MUST WRITE ALL TEXTS, STRINGS, DESCRIPTIONS, TITLES, MULTIPLE CHOICE OPTIONS, QUESTIONS, BACKGROUNDS, AND EXPLANATIONS IN HIGH-QUALITY TRADITIONAL CHINESE (繁體中文). Keep core equations or acronyms (e.g. PCB, RSA, Modulus) in capital letters with clear translation notes so they are academically precise." : "IMPORTANT DIRECTIVE: Write all summaries, keynotes, explanation texts, options, backgrounds, and quizzes in clear English."}

Output valid JSON matching the required response schema exactly. Do not embed any extra markdown formats around the JSON.`;

      const userPrompt = isZh
        ? `以下是提煉出的課程素材純文字紀錄：
---------------------------------------------
${rawExtractedText}
---------------------------------------------
請將上述內容，完美重塑鍛造成一個難度等級為「${difficulty}」的 8-bit 學術 RPG 下地下城冒險筆記、裝備重點與 combat 戰鬥 quiz 題目。`
        : `Below is the transcribed text from the lecture material:
---------------------------------------------
${rawExtractedText}
---------------------------------------------
Please synthesize this text into a "difficulty: ${difficulty}" 8-bit themed academic adventure notes, keynotes, and combat quizzes.`;

      parts.push({ text: userPrompt });

      const titleDesc = isZh 
        ? "此筆記的硬派學術 8-bit 標題，請全部使用大寫英文字母並用底線分隔單字（例如：OS_PROCESS_DUNGEON 或 CRYPTO_RSA_TEMPLE）。"
        : "descriptive 8-bit Title of the note (uppercase, underscores)";
      const narratorIntroDesc = isZh 
        ? "以 Game Boy 像素 RPG 冒險旁白口吻撰寫的繁體中文極酷開場描述（例如：『一個野生的期末考魔獸正在逼近大腦！前方是處理器生命週期的深淵...』）。"
        : "Intro in Game Boy Narrator tone (e.g. 'A wild Exam is approaching!...')";
      const backgroundDesc = isZh 
        ? "此學術章節主題的歷史起源背景、發展脈絡與戰略概述世界觀（繁體中文）。" 
        : "Origin, background context and strategic overview of the topic";
      const coreConceptsDesc = isZh 
        ? "此學術主旨的核心特戰原理、公式運作、演算法法則或者是重要解密手段（繁體中文，公式可保留英文）。" 
        : "The primary battle mechanics / academic paradigms of the topic";
      const oneSentenceDesc = isZh 
        ? "一行 8-bit 風格下地下城大考避坑、防範魔法反噬的核心大考排雷警語（繁體中文）。" 
        : "A dark warning summary in a single 8-bit narrator line";
      const keynoteTitleDesc = isZh 
        ? "學術概念珍貴裝備極短標題名稱（例如：PCB (進程控制塊) 或 歐拉總計函數）（繁體中文）。" 
        : "Brief concept title with bold equations or parameters";
      const keynoteDetailDesc = isZh 
        ? "詳細說明的條列式教授精華與大考排雷陷阱細解，包含必要的程式碼、公式表示法或計算步驟（繁體中文）。" 
        : "Bullet points detailing exam tips, code fragments or calculations";
      const quizQuestionDesc = isZh 
        ? "回合制決鬥的回合考驗學術題目情境描述（例如：『第一回合：期末考魔靈強制展開上下文切換！此時程式暫存器與計數器會被迅速歸檔至何處？』）（繁體中文）。" 
        : "Turn battle description e.g. 'ROUND 1: ENEMY attacks with SQL injection!'";
      const quizOptionsDesc = isZh 
        ? "剛好 4 個繁體中文的單選題選項。每個選項極度精確且開頭必須帶有『A: ...』, 『B: ...』, 『C: ...』, 『D: ...』的標記符印。" 
        : "Exactly 4 multiple choice options. Each option must be prefixed with 'A:', 'B:', 'C:', or 'D:'";
      const quizExplDesc = isZh 
        ? "大考高保真學霸大師解答釋義，完整破解試題陷阱或計算，並詳細解释正確答案為什麼是該學術選項（繁體中文）。" 
        : "8-bit tutor description explaining correct response";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: parts },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: titleDesc
              },
              summary: {
                type: Type.OBJECT,
                properties: {
                  narrator_intro: {
                    type: Type.STRING,
                    description: narratorIntroDesc
                  },
                  background: {
                    type: Type.STRING,
                    description: backgroundDesc
                  },
                  core_concepts: {
                    type: Type.STRING,
                    description: coreConceptsDesc
                  },
                  one_sentence: {
                    type: Type.STRING,
                    description: oneSentenceDesc
                  }
                },
                required: ["narrator_intro", "background", "core_concepts", "one_sentence"]
              },
              keynotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: keynoteTitleDesc
                    },
                    detail: {
                      type: Type.STRING,
                      description: keynoteDetailDesc
                    },
                    importance: {
                      type: Type.INTEGER,
                      description: "Importance from 1 to 3 (which will display as 1-3 pixel stars)"
                    }
                  },
                  required: ["title", "detail", "importance"]
                }
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: quizQuestionDesc
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: quizOptionsDesc
                    },
                    correctIndex: {
                      type: Type.INTEGER,
                      description: "An integer between 0 and 3 mapping to correct option choice"
                    },
                    explanation: {
                      type: Type.STRING,
                      description: quizExplDesc
                    }
                  },
                  required: ["question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["title", "summary", "keynotes", "quiz"]
          }
        }
      });

      const responseText = response.text || "{}";
      const resultObj = JSON.parse(responseText.trim());
      res.json(resultObj);
    } catch (err: any) {
      console.error("AI Error:", err);
      res.status(500).json({ 
        error: err.message || "An error occurred during AI processing.",
        stack: err.stack || "No stack trace available."
      });
    }
  });

  // Serve static assets or use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
