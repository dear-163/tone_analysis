# 法說會逐字稿語調分析系統 (Tone Analysis System)

這是一個專為分析台灣上市公司法人說明會（Conference Call）逐字稿所設計的語調分析系統。本系統結合了本地字典規則（Dictionary-based）與 Google Gemini 大語言模型（AI-based）的優勢，能自動識別發言者角色、定位簡報與問答階段、精煉不確定性語意，並計算出精準的語調指標（Tone Scores）。

本專案提供兩種使用介面：
1. **📊 互動式網頁儀表板 (`index-v2.html`)**：具備高視覺化圖表、拖放式佇列分析、與實時進度條。
2. **⚡ 高效批次命令行工具 (`batch_process.js`)**：專為處理數千份歷史逐字稿而設計，具備自動重試與指數退避機制，極速狂飆。

---

## 🌟 主要功能與特點

* **發言者角色自動分類 (Speaker Role Classification)**: 自動區分「管理層 (Management)」與「其他/主持人 (Others)」，避免非管理層的客套詞彙干擾語調指標。
* **簡報與問答分段定位 (Presentation & Q&A Segmentation)**: 自動辨識簡報階段（Phase P）與開放提問階段（Phase Q），分別計算語調，提供多維度的研究數據。
* **不確定性語意細分精煉 (Uncertainty Refinement)**: 本地字典標記為不確定（UNC）的句子，透過 AI 結合前後文語意進一步細分為偏向正向（POS）或偏向負向（NEG），提高分析靈敏度。
* **批次打包與節流優化 (Batch API Optimization)**: 將大量句子打包成批次（Batch Chunks）發送至 Gemini API，並具備 429 頻率限制自動退避與重試機制，徹底壓低 API 呼叫次數與成本。
* **前端 DOM 虛擬化列表 (Virtual List Rendering)**: 網頁端在載入數千筆資料時能保持 60 FPS 流暢度，絕不凍結網頁。

---

## 📁 專案結構

```text
├── index-v2.html          # 視覺化網頁儀表板 (獨立 self-contained HTML 檔案)
├── batch_process.js       # 本地高效批次 CLI 分析指令碼
├── .gitignore             # Git 忽略設定（保護 API 金鑰、本地快取與大體積 CSV）
└── README.md              # 專案說明文件（本檔案）
```

---

## 🛠️ 使用說明

### 1. 視覺化網頁儀表板 (`index-v2.html`)
此網頁已將所有樣式 (CSS) 與程式邏輯 (JS) 打包在單一 HTML 檔案中。
* **開啟方式**：直接雙擊 `index-v2.html` 用 Chrome 或 Safari 等瀏覽器開啟；或使用本機網頁伺服器開啟：
  ```bash
  python3 -m http.server 8080
  # 瀏覽器造訪: http://localhost:8080/index-v2.html
  ```
* **操作方法**：
  1. 輸入您的 Gemini API Key。
  2. 選擇分析模型（預設為 `gemini-1.5-flash`）。
  3. 點擊上傳或直接拖放 `.txt` 逐字稿檔案至上傳區。
  4. 點擊「▶ 啟動批次分析」，即可透過實時進度條查看進展。
  5. 分析完畢後，點擊「匯出報表」下載 CSV 格式的統計摘要或逐句明細。

### 2. 本地批次命令行工具 (`batch_process.js`)
專為自動化處理數千份大體積法說會稿件而設計。
* **事前準備**：確保已安裝 Node.js（v18 以上）。
* **執行方法**：
  在 Terminal 執行指令，將您的 API Key 以環境變數方式動態傳入（此方法最安全，金鑰不會被寫死在程式碼或儲存至硬碟中）：
  ```bash
  GEMINI_API_KEY="您的_GEMINI_API_KEY" node batch_process.js
  ```
* **控制台回饋**：程式將以精美的實時進度條顯示進度：
  `Role classification progress: [██████████████░░░░░░░░░░░] 56.4% (31/55)`

---

## 📊 數據輸出格式

批次分析完成後，系統會自動在指定位置生成兩份 UTF-8 (含 BOM) 格式的報表：

### 1. 摘要總報表 (`Tone_Summary.csv`)
每家公司/每次法說會輸出為單一行，包含：
* `TONE_P` / `TONE_Q` / `TONE_T`：簡報段、問答段、以及整體的語調分數。
* `P_正向`、`P_負向`、`Q_正向`、`Q_負向` 等各類情緒有效句數量。
* `AI`：標記該檔案是否有成功調用 AI 進行深度輔助分析。

### 2. 逐句分析明細表 (`Tone_Detail.csv`)
包含所有檔案中被拆分出來的每一句話的詳細分類：
* 該句子的原始文字、句子所屬角色（管理層/其他）、句子所屬階段（簡報/問答）。
* 本地字典匹配到的類別（POS/NEG/LIT/UNC/NEUTRAL/NONE）及對應的情緒詞。
* AI 針對不確定（UNC）句子的精煉結果（POS-Refined / NEG-Refined / 依然中性）。

---

## 🔒 隱私與安全性安全聲明

* **金鑰防護**：本系統**絕不**將您的 Gemini API 金鑰硬編碼在程式碼中，網頁版採用瀏覽器本機的 LocalStorage 快取，腳本版採用環境變數傳遞，安全合規。
* **資料過濾**：`.gitignore` 檔案已設定好排除所有的 `.csv`、`.xlsx` 等大型統計檔案，避免商業敏感數據被意外 Push 上傳至公開的 GitHub 儲存庫。
