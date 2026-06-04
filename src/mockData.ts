import { LectureRPGData } from "./types";

export const mockLectureSaves: { [key: string]: LectureRPGData } = {
  saves_1: {
    title: "OS_PROC_DUNGEON",
    summary: {
      narrator_intro: "You have arrived at the deep gates of Operating Systems Chapter 3. Ahead lies the Process Lifecycle Pit! Red flames dance in the server racks...",
      background: "Originating from late 1960s batch execution towers, Multiprogramming was forged to keep the CPU Core from staying idle during slow disk raids.",
      core_concepts: "The OS maintains a mythical Process Control Block (PCB) for each thread, guarding its Program Counter, CPU registers, and open files. When the CPU changes focus, a Context Switch occurs—this spell is very resource-intensive!",
      one_sentence: "BEWARE: In the Process Lifecycle, zombies will form if a parent process dies before picking up its orphans!"
    },
    keynotes: [
      {
        title: "PCB (Process Control Block)",
        detail: "The magical scroll storing all status details. Contains the CPU State, memory bounds, and descriptor tables. Beware: modifying this directly from User Mode triggers a core crash!",
        importance: 3
      },
      {
        title: "Context Switch Overhead",
        detail: "The price of shifting processor attention. Registers must be written to disk, and the cache is totally cold! Keep context switches low to avoid Thrashing traps.",
        importance: 2
      },
      {
        title: "The Ready Queue",
        detail: "Where active processes train. Only those with the 'READY' level can enter the CPU inner ring. Non-blocking actions keep this queue flowing.",
        importance: 1
      }
    ],
    quiz: [
      {
        question: "ROUND 1: ENEMY CPU forces a Context Switch! What metadata is saved to the PCB?",
        options: [
          "A: The process environment variables only",
          "B: Program Counter, CPU Registers, and Memory limits",
          "C: The user's current retro high score",
          "D: The master encryption password"
        ],
        correctIndex: 1,
        explanation: "Correct! The Program Counter, general registers, and memory bounds must be captured inside the PCB to safely resume the task."
      },
      {
        question: "ROUND 2: An Orphan Process emerges! What occurs if its parent process dies?",
        options: [
          "A: It is securely adopted by Init (Process 1)",
          "B: It consumes all motherboard memory instantly",
          "C: It is vaporized into virtual swap space",
          "D: It turns into a keyboard input freeze"
        ],
        correctIndex: 0,
        explanation: "Adopted! Init (Process ID 1) adopt orphan threads to prevent memory leaks and zombie buildup."
      },
      {
        question: "ROUND 3: A Process is waiting for an I/O disk fetch. Which state is it in?",
        options: [
          "A: RUNNING state",
          "B: BLOCKED / WAITING state",
          "C: TERMINATED state",
          "D: SPECTATOR state"
        ],
        correctIndex: 1,
        explanation: "Blocked! Freeing the main core thread during slow inputs keeps the clock running smoothly!"
      }
    ]
  },
  saves_2: {
    title: "CRYP_RSA_TEMPLE",
    summary: {
      narrator_intro: "The grand gates of asymmetric encryption tower above you. Standard algorithms lie broken by the roadside, but RSA remains unbroken. Two giant key gargoyles, Public and Private, watch your steps.",
      background: "Conceived in 1977 by sages Rivest, Shamir, and Adleman. It utilizes prime factorization complexity as a shield against digital attackers.",
      core_concepts: "The foundational math depends on Euler's Totient function. Multiplying two enormous prime numbers is mathematically trivial, but factoring them backwards in a reasonable lifetime is virtually impossible.",
      one_sentence: "WARNING: A key length of less than 2048 bits makes your castle walls highly vulnerable to factorization weapons!"
    },
    keynotes: [
      {
        title: "Prime Generation (p & q)",
        detail: "Select two huge secret prime numbers p and q. Their product n = p * q serves as the modulus base for public sharing.",
        importance: 3
      },
      {
        title: "Euler's Totient phi(n)",
        detail: "The magical intermediate formula: phi(n) = (p - 1) * (q - 1). It is essential to generate the private decryption key d.",
        importance: 2
      },
      {
        title: "Public exponent e selection",
        detail: "Typically chosen as 65537 due to binary properties making it fast to calculate while keeping modular attacks impossible.",
        importance: 1
      }
    ],
    quiz: [
      {
        question: "ROUND 1: An eavesdropper extracts n. Why can't they decrypt the ciphertext immediately?",
        options: [
          "A: Because modular math requires a graphic chip",
          "B: Factoring n into p and q is computationally hard",
          "C: The message is scrambled in raw binary only",
          "D: RSA blocks all network trace paths"
        ],
        correctIndex: 1,
        explanation: "True! Factorization is an asymmetric math bottleneck: multiplying is lightning-fast, but factoring prime components backwards is a total crawl."
      },
      {
        question: "ROUND 2: To encrypt ciphertext 'C' from secret 'M', which formula represents the operation?",
        options: [
          "A: C = M * e (mod n)",
          "B: C = M ^ e (mod n)",
          "C: C = M + d (mod phi)",
          "D: C = log(M) (mod n)"
        ],
        correctIndex: 1,
        explanation: "Exact! The modular exponentiation formula is: Cipher = Message ^ publicExponent modulo n."
      },
      {
        question: "ROUND 3: What math entity is safe to share with foreign traveling merchants?",
        options: [
          "A: Sages secret phi(n)",
          "B: Sages secret d factor",
          "C: Sages modular products p & q",
          "D: Sages public keys modulus n and exponent e"
        ],
        correctIndex: 3,
        explanation: "Correct! Only exponents n and e are shared in public scrolls. The remainder components must remain forever inside the vault."
      }
    ]
  },
  saves_1_zh: {
    title: "OS_進程調度魔域",
    summary: {
      narrator_intro: "您來到了作業系統第三章的深邃大門。前方就是進程生命週期深淵！紅色火光在伺服器機架中閃爍...",
      background: "源於1960年代後期的批處理執行塔，多處理技術（Multiprogramming）是為了解決CPU核心在磁碟 I/O 慢速讀寫時常處於閒置狀態的考量而被鍛造出來的。",
      core_concepts: "作業系統為每個進程維護一塊神聖的「進程控制塊（PCB）」，用以保護其程式計數器、CPU暫存器以及開檔狀態。當運作核心要切換關注點時，會發動「上下文切換（Context Switch）」咒語——此魔法相當消耗硬體效能資源！",
      one_sentence: "警告：在進程生命週期中，若父進程在未回收子進程前先行消亡，系統中將會源源不絕地產生孤兒進程與殭屍進程！"
    },
    keynotes: [
      {
        title: "PCB (進程控制塊)",
        detail: "儲存進程所有運行特徵狀態的神秘卷軸。包含暫存器暫態（CPU State）、記憶體邊界與檔案描述符。注意：唯有核心態（Kernel Mode）可完全控制它，用戶態下越界竄改將會觸發核心崩潰！",
        importance: 3
      },
      {
        title: "上下文切換開銷 (Context Switch Overhead)",
        detail: "處理器更替專注對象所必須付出的血汗代價。當前暫存器必須寫入記憶體，且處理器高速緩存（Cache）會完全冷卻！保持切換率正常以防範系統陷入「顛簸（Thrashing）」陷阱。",
        importance: 2
      },
      {
        title: "就緒隊列 (The Ready Queue)",
        detail: "這裏是排隊待命中的活躍進程訓練地。僅有升級為「READY 就緒級別」的進程能登上 CPU 王座。非阻塞式 I/O 能最優化就緒隊列的刷新流速。",
        importance: 1
      }
    ],
    quiz: [
      {
        question: "第一回合：CPU 大考魔王發動上下文切換！此時有哪些關鍵數據會被備份儲存至該進程的 PCB 中？",
        options: [
          "A: 僅有進程的環境變數",
          "B: 程式計數器（Program Counter）、CPU 暫存器與記憶體限制範圍",
          "C: 本機使用者的懷舊小遊戲最高分數",
          "D: 通往核心硬體的萬用解密密碼"
        ],
        correctIndex: 1,
        explanation: "答對了！程式計數器、通用暫存器以及記憶體邊界必須妥善儲存在 PCB 中，以在稍後輪到該進程執行時安全無縫恢復。"
      },
      {
        question: "第二回合：一隻孤兒進程（Orphan Process）誕生了！若其父進程突然消亡，會發生什麼事？",
        options: [
          "A: 它將會被 Init (一號進程 Process 1) 妥善安撫認領",
          "B: 它會瞬間狂暴地吞食主機板上所有的實體記憶體",
          "C: 它被直接汽化並遺棄在虛擬交換主機空間",
          "D: 硬體鍵盤會陷入完全冰凍無法輸入狀態"
        ],
        correctIndex: 0,
        explanation: "被認領！Init 守護進程負責接管孤兒進程，處理其後續生命狀態，避免內存溢出與殭屍累積。"
      },
      {
        question: "第三回合：一個進程正處於等待硬碟讀取文件的階段。此時該進程處於何種狀態？",
        options: [
          "A: 執行狀態（RUNNING state）",
          "B: 阻塞 / 等待狀態（BLOCKED / WAITING state）",
          "C: 終止狀態（TERMINATED state）",
          "D: 旁觀狀態（SPECTATOR state）"
        ],
        correctIndex: 1,
        explanation: "答對了！處於阻塞區以釋放主核心線程，是讓 CPU 在慢速硬體 I/O 回傳前能高效調度其他進程的關鍵核心！"
      }
    ]
  },
  saves_2_zh: {
    title: "CRYP_RSA加密神殿",
    summary: {
      narrator_intro: "高聳的非對稱加密神殿屹立在您的面前。普通的對稱散列算法在路邊散落一地，而 RSA 金鑰仍牢不可破。公鑰和私鑰兩尊守護兽雕像在門口注視著你...",
      background: "這是由 Rivest, Shamir 和 Adleman 三位大賢者在1977年共同領悟的數學護盾。它利用極大整數之「質因數分解（Prime Factorization）」的高昂運算複雜度，為數位防線提供阻絕武器。",
      core_concepts: "數學基石建立在歐拉函數（Euler's Totient）。在正向操作上，兩大巨型質數相乘極其容易；然而在反向操作時，要把乘積倒退破解出原始質數，在實體硬體的常規壽命內幾乎是不可能的任務。",
      one_sentence: "警報：只要金鑰長度低於 2048 位元，你的密碼城堡護城河就極易遭到現代數學因數分解兵器的蹂躪！"
    },
    keynotes: [
      {
        title: "大質數生成 (p & q)",
        detail: "隨機選定兩個巨大的保密質數 p 與 q。其乘積 n = p * q 將作為公鑰與私鑰共用的模數基底（Modulus）對外宣示。",
        importance: 3
      },
      {
        title: "歐拉總計函數 phi(n)",
        detail: "此為核心公式：phi(n) = (p - 1) * (q - 1)。唯有掌握它，才能巧妙算出解密特權私鑰因子 d。",
        importance: 2
      },
      {
        title: "公鑰指數 e 選擇",
        detail: "國際上預設通常選擇 65537（二進制寫法為 10000000000000001）。此特性能在不損及安全強度下讓指數乘法運算神速。",
        importance: 1
      }
    ],
    quiz: [
      {
        question: "第一回合：竊聽者截獲了對外公开的模數 n。為什麼他們無法立即破解出密文？",
        options: [
          "A: 因為模運算需要一張極高硬體規格的顯示卡",
          "B: 對大數 n 進行質因數分解破解出原本的 p 和 q 極度困難且費時",
          "C: 消息被混淆成了二進制亂碼",
          "D: RSA 算法會自動阻斷所有外網數據包"
        ],
        correctIndex: 1,
        explanation: "正確！因數分解是非對稱密碼的不對稱瓶頸：前向操作（相乘）快如閃電，反向操作（因數分解）漫長如龜速。"
      },
      {
        question: "第二回合：若要使用公鑰 e 和模數 n 對明文 'M' 進行加密得到密文 'C'，正確的魔法公式是？",
        options: [
          "A: C = M * e (mod n)",
          "B: C = M ^ e (mod n)",
          "C: C = M + d (mod phi)",
          "D: C = log(M) (mod n)"
        ],
        correctIndex: 1,
        explanation: "答對了！ modular 指數加密公式是：密文等於明文的公鑰次方（M 的 e 次方），然後對 n 取模。"
      },
      {
        question: "第三回合：哪一項數據是完全安全，可以毫無防備地交給過路的外國行商的？",
        options: [
          "A: 賢者精心保密的總計值 phi(n)",
          "B: 掌控解密特權的秘密因子 d",
          "C: 作為核心底數的兩個秘密大質數 p 與 q",
          "D: 公開的模數 n 以及加密指數 e"
        ],
        correctIndex: 3,
        explanation: "完全正確！只有 n 和 e 作為公鑰卷軸公諸於世，其餘核心質因數必須永遠鎖入神殿的最底層保險庫。"
      }
    ]
  }
};
