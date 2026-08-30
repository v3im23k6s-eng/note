/* フルトレ Content Lab v2
 * サーバー・APIキーなし。設定と履歴はブラウザのlocalStorageにのみ保存する。
 * 生成はClaudeへの手動コピペ往復(STEP1: 指示文コピー → STEP2: 回答貼り付け)で行う。
 */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var SETTINGS_KEY = "furutore_settings_v2";
  var HISTORY_KEY = "furutore_history_v2";
  var DRAFTS_KEY = "furutore_drafts_v2";
  var QT_DRAFTS_KEY = "furutore_qt_drafts_v2";

  var TYPE_DEFS = [
    { key: "empathy", label: "共感型", desc: "就活生の本音を言語化する" },
    { key: "story", label: "ストーリー型", desc: "場面→出来事→気持ち→学びの実体験" },
    { key: "tips", label: "Tips型", desc: "今日から使える具体ノウハウ" },
    { key: "contrarian", label: "逆説型", desc: "就活の思い込みに切り込む" },
    { key: "credibility", label: "実績型", desc: "SS獲得・内定実績など幅広い実績で信頼を積む" },
    { key: "cta", label: "直結型", desc: "note記事へ自然に誘導(note宣伝をしてよいのはこのタイプだけ)" },
    { key: "news", label: "最新情報型", desc: "検索した最新ニュース・トレンドを解説し、必ず解釈を添える" },
    { key: "contrast", label: "比較型(❌⭕)", desc: "NG行動とOK行動を❌⭕で対比する" },
    { key: "company", label: "企業紹介型", desc: "実在企業を検索し、締切・事業内容・年収などを紹介" },
    { key: "affiliate", label: "アフィリエイト紹介型", desc: "登録した本・商品をPR表記つきで紹介" }
  ];
  var TYPE_LABEL = {};
  TYPE_DEFS.forEach(function (t) { TYPE_LABEL[t.key] = t.label; });

  // 指示文では投稿タイプを日本語ラベル(例:「Tips型」)で提示しているため、
  // Claudeの回答もラベルのまま返ってくることが多い。内部のタイプ集計・頻度ゲートは
  // 英語キー(例: "tips")を前提にしているため、ラベル/キーどちらで返っても
  // 正しく英語キーへ正規化する。未知の値はempathyへフォールバックする。
  function normalizeTypeKey(raw) {
    if (!raw) return "empathy";
    var s = String(raw).trim();
    for (var i = 0; i < TYPE_DEFS.length; i++) {
      if (TYPE_DEFS[i].key === s) return TYPE_DEFS[i].key;
    }
    for (var j = 0; j < TYPE_DEFS.length; j++) {
      if (TYPE_DEFS[j].label === s || TYPE_DEFS[j].label.replace(/[（(].*[）)]/, "") === s.replace(/[（(].*[）)]/, "")) {
        return TYPE_DEFS[j].key;
      }
    }
    return "empathy";
  }

  var DEFAULT_PERSONA =
    "「フルトレ就活」/ @fluture_74\n" +
    "ES・ガクチカ・面接・SPI・自己分析・OB訪問・業界研究など、就職活動全般を実体験ベースで支援するアカウント。専門分野の一つとしてデザイン思考テスト(デザシコ)も扱うが、投稿全体の1〜2割程度に留め、話題を独占しない。\n" +
    "実績: デザイン思考テストを29回受験し16回SS評価を獲得(3回目以降は9割がA/S/SS)。日系大手4社から内定(50社ES提出→43社通過(総合商社5社含む)→15社最終面接→4社内定)。ES通過率90%(総合商社含む)。就活攻略noteを500円で200名以上に販売。TOEICは900点台。\n" +
    "トーン: 断定口調でテンポよく、短文中心。締めは「〜べき」「〜ましょう」「〜できる」のような行動喚起で終えることが多い。見出しは【】、構成は①②③や・の箇条書きで可視化する。誇張・煽り表現(誰でも/絶対に稼げる系)は使わない。\n" +
    "ハッシュタグは対象の卒業年度(複数学年可)+就活+就職活動を末尾にまとめて付ける。";

  var DEFAULT_PAST_TWEETS =
    "TOEIC900点ぐらいの時に on the same page って表現をAtsu さんから初めての聞いた。\nニュースや映画見てるとバンバン出てくるから思い切ってDistinction 1,2,3まとめ買いした\n\n---\n\nデザイン思考テストでSS（上位1%）を取りました私が2000字ほどで高得点を取るために意識していること、ポイントをまとめました。\n\nこのツイートのリツイートとフォローで3名の方にプレゼントします！\n\n#デザイン思考　#デザイン思考テスト\n#22卒　#23卒\n\n---\n\nまたまた23卒へのアドバイス。\n新聞は読んだほうがいい。新聞の知識あるだけで頭が良い印象を与えれます。\n\n僕は面接で何度も新聞に書いてあることそのまま言って、褒められたことあります。\n\n#23卒　#就活\n\n---\n\n人を巻き込むガクチカが多いが、「どうやって巻き込んだ？」という想定される質問に対ししっかり答えられない人が多い。\n\n解答例)　人は①論理で動く人と②情熱で動く人がいると思います。巻き込みたい人がどちらのタイプかを見極めてアプローチしました。　論理タイプには彼らのメリットを理路整然↓\n\n#23卒　#24卒　#就職活動　#就活　#デザイン思考テスト　#デザシニ\n\n---\n\n総合商社も含めてES通過率90%だったのですが、ガクチカだけで1.8万文字書きなぐり、熟考を重ねました。\n\n①エピソードを細かいところまで書き出し\n②アピールできそうなところを残す。\n③PREP法に従い1000字ぐらいで書いてみる\n④言葉を一つ一つ変え、短くしていく。\n\nこの作業をしました。\n\n---\n\n三菱に内定した先輩の【最後に一言】\n\n私は「毎日自分との約束を守り続けること」を大切にしています。150人のOB訪問の中でそんな社員の方が一番多いと感じたのが御社です。御社でも毎日自分との約束を守り続け成長することを約束します。\n\n1番熱を込めて語ったそう\n\n#25卒　#24卒　#就活　#就職活動\n\n---\n\n【ESなしでSPIが受けられる企業】\n①ミルボン\n②アフラック\n③東レ\n④野村総合研究所\n⑤JCB\n⑥NTT系列\n⑦キーエンス\n⑧日本郵送\n\n年末年始にSPIは勉強して年明けに一気に受ける。高得点を取ってそれを使いまわす。\n\n#26卒　#25卒　#就活　#就職活動\n\n---\n\n自分の大切にしてきた価値観は思わぬところに転がっている。\n\n(例)\nアルバイトを辞めた理由が店長の理不尽な叱責\n→人間関係重視\n\nアルバイトを辞めた理由が時給が低く、仕事にやる気が起きないから\n→給料\n\n#26卒 #就職活動　#就活";

  var DEFAULT_SEARCH_KEYWORDS =
    "就活 最新ニュース\n大学4年生 就職活動\n27卒 就活状況\n28卒 就活準備\n\n" +
    "[就活用語・トレンドワード]\nガクチカ\nNNT（無い内定）\nオワハラ\nオヤカク\nグルディス（グループディスカッション）\n早期化\nジョブポスティング\nセカンドオピニオン（就活）\n母集団形成\n静かな退職\nタイパ（タイムパフォーマンス）\n\n" +
    "[思考法・シンキング系]\nロジカルシンキング／論理的思考\nクリティカルシンキング／批判的思考\nデザイン思考／デザインシンキング\nラテラルシンキング／水平思考\n仮説思考\nシステム思考\nゼロベース思考\nアブダクション／仮説推論\n\n" +
    "[分析フレームワーク・伝える技術]\nMECE\nロジックツリー／イシューツリー\nPREP法\n3C分析／SWOT分析\n4P分析／STP分析\nPDCAサイクル／OODAループ\nフェルミ推定\nピラミッドストラクチャー\n\n" +
    "[選考・適性テスト・評価手法]\nデザイン思考テスト（DTT）\nケース面接\nSTAR面接法\nコンピテンシー面接\n構造化面接\nオンライン面接／録画面接\nAI面接\n集団面接\n\n" +
    "[WEBテスト・選考プロセス系]\nSPI（テストセンター／WEBテスティング）\n玉手箱／TG-WEB／C-GAB\nジョブ（選考型インターン）\nエレベーターピッチ\n逆質問\nリクルーター面談\n\n" +
    "[社会人基礎力・ポータブルスキル]\nポータブルスキル\n社会人基礎力\nファシリテーション\nアサーティブコミュニケーション\nネゴシエーション／交渉力\nタイムマネジメント\n\n" +
    "[トレンド・実務リテラシー]\nDX（デジタルトランスフォーメーション）\n生成AI活用／プロンプトエンジニアリング\nAIエージェント\nデータリテラシー\n半導体業界 動向\n量子コンピュータ\nweb3／ブロックチェーン\nSaaS／フィンテック／ヘルステック\n宇宙ビジネス\n再生可能エネルギー・脱炭素\n\n" +
    "[ケース・地頭選考系（問題解決）]\nイシュー／本質的課題\nボトルネック\nドライバー（変数分解）\nトレードオフ\n売上向上・市場規模推計\nLTV／CAC\n\n" +
    "[自己分析・ガクチカ作成系]\nWILL・CAN・MUST\n原体験\n抽象化と具体化\nキャリアアンカー\nジョブ理論\nモチベーショングラフ\n\n" +
    "[業界研究トピック]\n総合商社／専門商社\nメガバンク／証券／保険\n戦略コンサル／総合コンサル／ITコンサル\n広告代理店\nデベロッパー／不動産\n自動車業界／化学業界／食品業界\n小売・流通\nIT・Web業界\nスタートアップ\n公務員（国家／地方）\n外資系企業\n\n" +
    "[雇用・採用制度トレンド]\n通年採用\nジョブ型雇用 vs メンバーシップ型雇用\nリファラル採用\n逆求人サイト\n就活エージェント\n低学年向けキャリア教育\n\n" +
    "[就活生の悩み・メンタル系]\n就活疲れ\n就活うつ\nお祈りメール／サイレントお祈り\n内定ブルー\n就活の軸のブレ\n\n" +
    "[スキル・資格系]\n簿記\nTOEIC\n統計検定\nITパスポート／G検定\nExcel関数\nビジネスマナー\n\n" +
    "[締切・時期トレンド系（優先度高め・毎回1つはここから検索）]\nサマーインターン 締切\n秋冬インターン 選考スケジュール\nES締切 今週\n早期選考 エントリー締切\n27卒 28卒 就活スケジュール\n内々定率 最新";

  function defaultSettings() {
    var types = {};
    TYPE_DEFS.forEach(function (t) { types[t.key] = t.key !== "affiliate"; });
    return {
      persona: DEFAULT_PERSONA,
      pastTweets: DEFAULT_PAST_TWEETS,
      noteLinks: "",
      hotThemes: "",
      watchAccounts: "fluture_74",
      affiliateItems: "",
      useWebSearch: true,
      searchKeywords: DEFAULT_SEARCH_KEYWORDS,
      types: types,
      targetLen: 130,
      generateCount: 6,
      qtCount: 2
    };
  }

  // ---------- storage ----------
  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
    // 保存直後に読み直して検証する(保存の取りこぼしを検知するため)
    var check = localStorage.getItem(key);
    return check === JSON.stringify(val);
  }

  var state = {
    settings: loadJSON(SETTINGS_KEY, null) || defaultSettings(),
    history: loadJSON(HISTORY_KEY, []),
    drafts: loadJSON(DRAFTS_KEY, []),
    qtDrafts: loadJSON(QT_DRAFTS_KEY, [])
  };

  function saveSettings() { saveJSON(SETTINGS_KEY, state.settings); }
  function saveHistory() { saveJSON(HISTORY_KEY, state.history); }
  function saveDrafts() { saveJSON(DRAFTS_KEY, state.drafts); }
  function saveQtDrafts() { saveJSON(QT_DRAFTS_KEY, state.qtDrafts); }

  // ---------- helpers ----------
  function toHalfWidthDigits(str) {
    return String(str).replace(/[0-9]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    });
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function charLen(str) { return Array.from(String(str)).length; } // サロゲートペア対応

  function bigrams(s) {
    var arr = Array.from(String(s).replace(/\s+/g, ""));
    var set = new Set();
    for (var i = 0; i < arr.length - 1; i++) set.add(arr[i] + arr[i + 1]);
    return set;
  }
  function jaccard(a, b) {
    var A = bigrams(a), B = bigrams(b);
    if (A.size === 0 || B.size === 0) return 0;
    var inter = 0;
    A.forEach(function (x) { if (B.has(x)) inter++; });
    var union = A.size + B.size - inter;
    return union === 0 ? 0 : inter / union;
  }

  function extractJsonArray(text) {
    var start = text.indexOf("[");
    var end = text.lastIndexOf("]");
    if (start === -1 || end === -1 || end < start) {
      throw new Error("JSON配列([ ]で囲まれた部分)が見つかりませんでした。Claudeの回答をまるごとコピーして貼り付けてください。");
    }
    var slice = text.slice(start, end + 1);
    return JSON.parse(slice);
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " +
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function isToday(ts) {
    var d = new Date(ts), n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }

  function copyText(text, feedbackEl) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) { showFeedback(feedbackEl, "コピーしました"); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showFeedback(feedbackEl, "コピーしました");
      }).catch(function () {
        showFeedback(feedbackEl, "自動コピーに失敗しました。テキストを長押しで選択してコピーしてください", true);
      });
    } else {
      showFeedback(feedbackEl, "自動コピーに失敗しました。テキストを長押しで選択してコピーしてください", true);
    }
  }
  function showFeedback(el, msg, isWarn) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = isWarn ? "var(--rust)" : "var(--olive)";
    setTimeout(function () { if (el.textContent === msg) el.textContent = ""; }, 4000);
  }

  function xIntentUrl(text, url) {
    var u = "https://x.com/intent/tweet?text=" + encodeURIComponent(text);
    if (url) u += "&url=" + encodeURIComponent(url);
    return u;
  }

  // スマホの「共有」機能(Web Share API)経由で、画像とテキストをまとめてXに渡す。
  // 対応端末ではダウンロード→カメラロール→貼り付け、という手間なしに
  // 共有シートからXを選ぶだけで、画像添付済みの投稿画面を開ける。
  // 非対応の場合はfalseを返し、呼び出し側でダウンロードにフォールバックする。
  function canShareFiles() {
    return !!(navigator.share && navigator.canShare);
  }
  function shareImageToX(dataUrl, text, filename, feedbackEl) {
    return fetch(dataUrl)
      .then(function (res) { return res.blob(); })
      .then(function (blob) {
        var file = new File([blob], filename, { type: "image/png" });
        if (!navigator.canShare({ files: [file] })) return false;
        return navigator.share({ files: [file], text: text }).then(function () { return true; });
      })
      .catch(function (e) {
        if (e && e.name === "AbortError") return true; // 利用者が共有をキャンセルしただけ
        return false;
      });
  }

  // ---------- 画像カード生成(canvas・APIやログイン不要) ----------
  function wrapLinesForCanvas(ctx, text, maxWidth) {
    var paragraphs = String(text).split("\n");
    var lines = [];
    paragraphs.forEach(function (para) {
      if (para === "") { lines.push(""); return; }
      var chars = Array.from(para);
      var line = "";
      for (var i = 0; i < chars.length; i++) {
        var test = line + chars[i];
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          lines.push(line);
          line = chars[i];
        } else {
          line = test;
        }
      }
      if (line !== "") lines.push(line);
    });
    return lines;
  }

  // 比較型(❌⭕)は箇条書きとして見せた方が伝わるため、❌/⭕の直前で改行を入れる
  function preprocessCardText(text, typeKey) {
    if (typeKey !== "contrast") return text;
    var parts = String(text).split(/(?=[❌⭕])/).map(function (s) { return s.trim(); }).filter(Boolean);
    return parts.length > 1 ? parts.join("\n") : text;
  }

  // 白地・カラフルなテキストカードを生成する。
  // cardText: 画像に書く本文。longForm: 400〜500字程度の画像化投稿用に、縦長・小さめフォントで多めの文字量に対応する。
  function buildTextCardDataUrl(d, opts) {
    opts = opts || {};
    var longForm = !!opts.longForm;
    var cardText = opts.cardText || (d.thread ? d.thread.join("\n") : d.text);
    var text = preprocessCardText(cardText, d.type);

    var W = 1200;
    var top = longForm ? 140 : 150;
    var bottomMargin = 90;
    var maxWidth = W - 64 - 64;

    // 文字サイズ・改行位置を先に計測用canvasで求め、その分量にちょうど収まる
    // 高さの画像を作る(短文カードは675固定、長文カードは内容に応じて可変・上限1600)。
    var measure = document.createElement("canvas");
    measure.width = W; measure.height = 10;
    var mctx = measure.getContext("2d");

    var fontSize = longForm ? 44 : 56;
    var floor = longForm ? 28 : 26;
    var fixedH = longForm ? null : 675;
    var maxH = longForm ? 1600 : 675;
    var lineHeight, lines, H;
    while (true) {
      mctx.font = "700 " + fontSize + "px 'Noto Sans JP', sans-serif";
      lineHeight = Math.round(fontSize * (longForm ? 1.6 : 1.5));
      lines = wrapLinesForCanvas(mctx, text, maxWidth);
      var neededH = top + lines.length * lineHeight + bottomMargin;
      H = fixedH || Math.max(700, Math.min(maxH, neededH));
      var fits = fixedH ? neededH <= fixedH : neededH <= maxH;
      if (fits || fontSize <= floor) break;
      fontSize -= 2;
    }

    var canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");

    // 白地(視認性重視)。アクセントバーとラベルはブランドカラーで色を残す。
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#e3b23c";
    ctx.fillRect(0, 0, 12, H);

    ctx.fillStyle = "#a67c1e";
    ctx.font = "600 " + (longForm ? 26 : 28) + "px 'Noto Sans JP', sans-serif";
    ctx.fillText(TYPE_LABEL[d.type] || d.type, 64, longForm ? 76 : 84);

    ctx.fillStyle = "#8a8272";
    ctx.font = "500 " + (longForm ? 22 : 24) + "px 'Noto Sans JP', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("@fluture_74", W - 48, H - 40);
    ctx.textAlign = "left";

    ctx.font = "700 " + fontSize + "px 'Noto Sans JP', sans-serif";
    var startY = top + fontSize;
    // 視認性重視: 本文は濃いチャコールを基本とし、❌⭕やキーワードなどの要点だけ
    // ブランドカラーで色をつける(全文をカラフルにすると逆に読みにくくなるため)。
    lines.forEach(function (line, i) {
      var color = "#1f1b13";
      if (d.type === "contrast" && line.indexOf("❌") === 0) color = "#c4482e";
      else if (d.type === "contrast" && line.indexOf("⭕") === 0) color = "#2f6b3f";
      else if (/^[①②③④⑤⑥⑦⑧⑨]/.test(line)) color = "#a6631e";
      ctx.fillStyle = color;
      ctx.fillText(line, 64, startY + i * lineHeight);
    });
    return canvas.toDataURL("image/png");
  }

  // ---------- 画像生成プロンプト(外部の無料画像生成ツールに貼り付ける用) ----------
  var IMAGE_MOOD_BY_TYPE = {
    company: "オフィスビルや都市の高層ビル群を見上げるような、洗練された雰囲気の写真風イラスト",
    story: "物語の一場面を象徴するような、落ち着いた色合いの写真風イラスト",
    credibility: "達成感や信頼感を象徴する、シンプルで洗練された抽象的なビジュアル",
    news: "最新のビジネストレンドを感じさせる、都会的で洗練された写真風イラスト"
  };
  function buildImagePrompt(d) {
    var mood = IMAGE_MOOD_BY_TYPE[d.type] || "テーマを象徴する、シンプルで洗練された写真風イラスト";
    var text = d.thread ? d.thread.join(" ") : d.text;
    return [
      "以下のX投稿に添える画像を1枚生成してください。",
      "",
      "投稿内容:「" + text + "」",
      "",
      "条件:",
      "- " + mood,
      "- 文字・ロゴ・図表は入れず、雰囲気を伝えるビジュアルのみにする",
      "- 実在の企業ロゴや商標、実在の建物そのものは描かない(著作権・商標に配慮したイメージ画像にする)",
      "- 派手すぎず、就活生向けの真面目で信頼感のあるトーン",
      "- 横長(16:9程度)"
    ].join("\n");
  }

  // ---------- type assignment & frequency gates ----------
  function enabledTypeKeys() {
    return TYPE_DEFS.filter(function (t) { return !!state.settings.types[t.key]; }).map(function (t) { return t.key; });
  }

  function applyFrequencyGates() {
    var now = Date.now();
    var H44 = 44 * 3600 * 1000;
    var enabled = enabledTypeKeys();
    var notes = [];

    var posts = state.history.filter(function (h) { return h.kind === "post"; });

    var lastCta = null;
    for (var i = posts.length - 1; i >= 0; i--) {
      if (posts[i].type === "cta") { lastCta = posts[i]; break; }
    }
    if (lastCta && (now - lastCta.ts) < H44) {
      enabled = enabled.filter(function (k) { return k !== "cta"; });
      notes.push("直近44時間以内に直結型(note誘導)を使用済みのため、今回は直結型を除外しています。");
    }

    if (!state.settings.useWebSearch) {
      enabled = enabled.filter(function (k) { return k !== "company"; });
    }

    var suppressDesign = false;
    for (var j = posts.length - 1; j >= 0; j--) {
      var p = posts[j];
      if ((now - p.ts) < H44 && /デザイン思考|デザシコ|デサシコ|DTT/.test(p.text || "")) { suppressDesign = true; break; }
    }

    return { enabled: enabled, notes: notes, suppressDesign: suppressDesign };
  }

  function assignTypes(enabled, count) {
    if (enabled.length === 0) return [];
    var posts = state.history.filter(function (h) { return h.kind === "post"; }).slice(-15);
    var usage = {};
    enabled.forEach(function (k) { usage[k] = 0; });
    posts.forEach(function (h) { if (usage.hasOwnProperty(h.type)) usage[h.type]++; });

    var shuffled = enabled.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    shuffled.sort(function (a, b) { return usage[a] - usage[b]; });

    var result = [];
    for (var k = 0; k < count; k++) result.push(shuffled[k % shuffled.length]);
    return result;
  }

  // 8件中2件を目安に「文字だけ投稿」、残りを「画像化投稿」にする(利用者の指定比率)。
  // AI任せの「目安」だと守られないことがあったため、タイプ・キーワードと同じく
  // コード側で件数を確定させてから指示文に明記する。
  var TEXT_ONLY_RATIO = 2 / 8;
  function assignFormats(count) {
    var textOnlyCount = Math.max(1, Math.min(count, Math.round(count * TEXT_ONLY_RATIO)));
    var imageCount = count - textOnlyCount;
    var arr = [];
    for (var i = 0; i < imageCount; i++) arr.push("image");
    for (var j = 0; j < textOnlyCount; j++) arr.push("text");
    for (var k = arr.length - 1; k > 0; k--) {
      var r = Math.floor(Math.random() * (k + 1));
      var tmp = arr[k]; arr[k] = arr[r]; arr[r] = tmp;
    }
    return arr;
  }

  // ---------- keyword rotation (話題の偏り防止) ----------
  var KEYWORD_LOOKBACK = 40; // 型の割当(直近15件)より大きい窓で見る。キーワード数が多いため

  function parseKeywordPool(text) {
    var lines = String(text || "").split("\n");
    var timely = [];
    var evergreen = [];
    var currentTimely = false;
    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var headerMatch = line.match(/^\[(.+)\]$/);
      if (headerMatch) {
        currentTimely = /締切|時期トレンド/.test(headerMatch[1]);
        return;
      }
      if (currentTimely) timely.push(line); else evergreen.push(line);
    });
    return { timely: timely, evergreen: evergreen };
  }

  function pickLeastUsedKeywords(list, n, usage, alreadyPicked) {
    if (!list || list.length === 0) return [];
    var shuffled = list.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    shuffled.sort(function (a, b) { return (usage[a] || 0) - (usage[b] || 0); });
    var used = {};
    (alreadyPicked || []).forEach(function (k) { used[k] = true; });
    var picked = [];
    for (var k = 0; k < shuffled.length && picked.length < n; k++) {
      if (!used[shuffled[k]]) { picked.push(shuffled[k]); used[shuffled[k]] = true; }
    }
    // プールがnより小さい場合のみ、やむを得ず重複させて埋める
    var idx = 0;
    while (picked.length < n && shuffled.length > 0) { picked.push(shuffled[idx % shuffled.length]); idx++; }
    return picked;
  }

  // 「タイプ」の自動割当と同じ考え方で、検索キーワードも直近使っていないものを
  // コード側で選んでローテーションする(AI任せの偏り防止)。
  // 締切・時期トレンド系は毎回1枠を優先的に確保しつつ、それ以外は使用頻度の低い順に選ぶ。
  function assignKeywords(count) {
    var pool = parseKeywordPool(state.settings.searchKeywords || DEFAULT_SEARCH_KEYWORDS);
    var posts = state.history.filter(function (h) { return h.kind === "post"; }).slice(-KEYWORD_LOOKBACK);
    var usage = {};
    posts.forEach(function (h) { if (h.keyword) usage[h.keyword] = (usage[h.keyword] || 0) + 1; });

    var result = [];
    if (pool.timely.length > 0 && count > 0) {
      result = result.concat(pickLeastUsedKeywords(pool.timely, 1, usage, []));
    }
    var remaining = count - result.length;
    if (remaining > 0) {
      var evergreenPool = pool.evergreen.length ? pool.evergreen : pool.timely;
      result = result.concat(pickLeastUsedKeywords(evergreenPool, remaining, usage, result));
    }
    while (result.length < count) result.push(null); // キーワード一覧が空の場合の保険
    return result;
  }

  // ---------- prompt building ----------
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }

  function buildMainPrompt() {
    var s = state.settings;
    var gate = applyFrequencyGates();
    var count = parseInt(s.generateCount, 10) || 6;
    var assigned = assignTypes(gate.enabled, count);
    var keywords = s.useWebSearch ? assignKeywords(count) : new Array(count).fill(null);
    var formats = assignFormats(count);
    var imageCountInBatch = formats.filter(function (f) { return f === "image"; }).length;
    var textOnlyCountInBatch = count - imageCountInBatch;

    var typeListText = assigned.map(function (key, idx) {
      var def = TYPE_DEFS.filter(function (t) { return t.key === key; })[0];
      var kw = keywords[idx];
      var kwText = kw ? "／起点キーワード: 「" + kw + "」" : "";
      var fmtText = formats[idx] === "image" ? "／形式: 画像化投稿(400〜500字)" : "／形式: 通常投稿(140字以内・必要ならスレッド)";
      return (idx + 1) + "件目: " + def.label + "（" + def.desc + "）" + kwText + fmtText;
    }).join("\n");

    var recentPosts = state.history.filter(function (h) { return h.kind === "post"; }).slice(-20);
    var recentTopics = recentPosts.map(function (h) { return h.topic; }).filter(Boolean).join("、") || "(まだ履歴はありません)";
    var recentHistoryTexts = recentPosts.length
      ? recentPosts.map(function (h) { return "・" + h.text.replace(/\n/g, " "); }).join("\n")
      : "(まだ使用済み履歴はありません)";
    var recentKwPosts = state.history.filter(function (h) { return h.kind === "post"; }).slice(-KEYWORD_LOOKBACK);
    var recentKeywords = recentKwPosts.map(function (h) { return h.keyword; }).filter(Boolean);
    var recentKeywordsText = recentKeywords.length
      ? Array.from(new Set(recentKeywords)).join("、")
      : "(まだありません)";

    var gateNotesText = gate.notes.length ? gate.notes.join("\n") : "(今回、頻度による除外はありません)";
    var suppressText = gate.suppressDesign
      ? "直近44時間以内にデザイン思考テスト/デザシコに言及済みです。今回はデザイン思考テスト・デザシコに一切言及しないでください。"
      : "";

    return [
      "あなたは就活支援Xアカウント「フルトレ就活」(@fluture_74) 専属のコピーライターです。",
      "本日の日付は" + todayStr() + "です。",
      "以下の情報をもとに、Xに投稿する短文ポストを" + count + "件、新規に考案してください。",
      "",
      "【アカウントの立ち位置】",
      "このアカウントはデザイン思考テスト特化ではなく、ES・ガクチカ・面接・SPI・自己分析・OB訪問・業界研究など就職活動全般を支援する総合アカウントです。デザイン思考テスト（デザシコ）は数ある専門分野の1つという位置づけに留めてください。",
      suppressText,
      "",
      "【ペルソナ・実績・トーン】",
      s.persona,
      "",
      "【過去の投稿例（文体参考のみ。この文章自体の再利用・流用は禁止）】",
      s.pastTweets || "(未登録)",
      "",
      "【誘導したいnote記事】",
      s.noteLinks || "(未登録。直結型は無理に誘導文を作らず、note全般への軽い言及に留める)",
      "",
      "【今回の" + count + "件それぞれに割り当てられた投稿タイプ（システム側が過去の使用頻度から選定済み。この割り当て通りに書くこと。自分で別のタイプに変更しない）】",
      typeListText,
      "",
      "【頻度制限による調整】",
      gateNotesText,
      "",
      "【今よく見かける鉄板テーマ・切り口（あれば参考に。テーマ・切り口レベルの参考であり、他人の文章の再利用ではない）】",
      s.hotThemes || "(未登録)",
      "",
      "【紹介したい本・商品（アフィリエイト・登録がある場合のみアフィリエイト紹介型で使用）】",
      s.affiliateItems || "(未登録。アフィリエイト紹介型は今回割り当てられていても書けません。他のタイプに振り替えてください)",
      "",
      "【今回の検索キーワード割り当て（重要・厳守）】",
      s.useWebSearch
        ? "検索機能が使える場合、上の「投稿タイプ」一覧に書かれている『起点キーワード』を、それぞれの投稿の検索の出発点として必ず使ってください（直近" + KEYWORD_LOOKBACK + "件で使っていないキーワードを、システム側がローテーションで選んでいます。AIの判断で似たようなキーワードに差し替えないこと）。そこから見つかった内容をもとに書き、さらに関連して気になる話題があれば自由に追加で検索してもかまいません。JSON出力の`keyword`には、実際に起点として使ったキーワードを表記を変えずにそのまま入れてください。『起点キーワード』の記載がない投稿(件数がキーワード数を超える場合)は、下の一覧やニュース検索から自分でテーマを選び、`keyword`には自分で選んだ語を入れてください。企業紹介型を書く場合は、実在する具体的な企業名でも検索し、締切・事業内容・年収などの情報を確認してください。"
        : "検索機能がオフのため、この節は無視して手元の情報のみで書いてください。企業紹介型・最新情報型は使えません。JSON出力の`keyword`には話題を表す短い語（例:自己分析）を入れてください。",
      "",
      "【検索キーワード一覧（カテゴリ別の参考資料。起点キーワード以外は補助的に使う）】",
      s.searchKeywords || DEFAULT_SEARCH_KEYWORDS,
      "検索結果を使うときのルール:",
      "- 「日経」「ニュース」等の一般的な言及ではなく、検索で実際に見つかった具体的な出来事・データ・企業名・締切日・傾向を最低1つは拾う。何も具体的な情報が見つからなければ、無理に最新情報型・企業紹介型を書かず、他のタイプに切り替えてよい。",
      "- 記事の文章をそのまま書き写さない。要点を自分の言葉で言い換える。",
      "- 出典に触れる場合は「〇〇の記事によると」程度の軽い言及にとどめ、長い引用はしない。",
      "- 検索で確認できない具体的な数字・日付・事実は書かない。企業紹介型は特にこの点を厳守する。",
      "- 1年以上前の情報など明らかに古いものは「最新情報」として使わない。",
      "- 最新情報型の投稿は、事実の要約だけで終わらせず、必ず「それが就活生にとって何を意味するか」というこのペルソナ自身の解釈・アドバイスを1文以上添える。",
      "",
      "【直近使用した話題タグ・キーワード（できるだけこれと同じ・近い話題は避けること）】",
      "話題タグ: " + recentTopics,
      "キーワード: " + recentKeywordsText,
      "",
      "【直近の使用済み履歴（この内容と同じ・酷似した投稿は禁止）】",
      recentHistoryTexts,
      "",
      "【厳守ルール】",
      "0. 内容がワンパターン化しないよう、各投稿に割り当てられた『起点キーワード』を必ず守ること(自分の判断でES・ガクチカ・面接など使い慣れたテーマに寄せ直さない)。あわせて上の「直近使用した話題タグ・キーワード」も確認し、そこにない新しい話題を選ぶこと。" + count + "件の中でも話題が偏らないようにする。",
      "1. 過去投稿例・使用済み履歴と同じ文章やほぼ同じ言い回しを繰り返さない。文体や熱量は参考にしてよいが、文章自体は必ず新規に書く。",
      "2. 他の就活支援アカウントの特定の投稿を真似ない。",
      "3. ペルソナに書かれていない実績や数字、登録されていない商品を捏造しない。",
      "4. noteの宣伝・購読誘導ができるのは「直結型」の投稿だけです。他のタイプでは、noteへのリンク誘導や購読を促す文言を一切書かないこと。",
      "5. 「アフィリエイト紹介型」を作る場合は、登録済みの商品のみを扱い、誇大な効果効能は書かない。広告であることが一目でわかるよう文中に「#PR」の表記を必ず入れる。",
      "6. 「比較型（❌⭕）」では、❌でよくあるNG行動を2〜4個、⭕でその代わりにやるべきことを箇条書きで示す構成にする。",
      "7. 「企業紹介型」は必ず検索で確認できた実在企業の情報のみを使う。",
      "8. 形式が「通常投稿」の件は、必ず140字以内(目標" + s.targetLen + "字前後)の1投稿として完結させること。スレッドへの分割はしない。ボリュームのある内容を書きたくなった場合は、その内容は無理に140字へ削ったり複数パートに分けたりせず、画像化投稿の方に回すこと(通常投稿の枠では扱わない)。",
      "9. 上の「投稿タイプ」一覧で形式が「画像化投稿」と指定されている件(" + imageCountInBatch + "件/" + count + "件中)は、必ずその形式で書くこと(140字に収めたりスレッドに分割したりしない)。画像化投稿では、①`hookText`(140字以内の導入文)と、②`fullText`(400〜500字程度の本文。そのまま画像化されるので、見出し・箇条書きなど画像で読みやすい構成にしてよい)の両方を書く。形式が「通常投稿」と指定されている件(" + textOnlyCountInBatch + "件/" + count + "件中)は、従来通り140字以内(必要ならスレッド)で書く。指定された形式を自分の判断で変更しないこと。",
      "9-1. `hookText`の質が画像化投稿の生命線。画像は開かれて初めて読まれるため、「続きは画像で」と付け加えるだけの弱いフックにしない。次の型を意識して、開かずにいられない一文にする: (a)具体的な数字・件数を見せる(例:「◯回受けて分かった」「たった◯つの手順」)、(b)結論やノウハウの中身は伏せて『何が得られるか』だけを見せる情報のギャップを作る(例:「みんな知らずに損してる」「9割が見落としてる」)、(c)自分の実体験・実績に紐づける(捏造禁止、ペルソナに書かれている実績の範囲で)。「続きは画像で」のような定型句をそのまま使うのではなく、その回ごとに内容に即した自然な誘導文にする。ただし誇張・煽り(誰でも/絶対に稼げる系、NG表現リスト参照)は禁止で、あくまで内容の価値が正しく伝わる範囲でフックを作ること。",
      "10. 内容に合う、著作権フリーで商用利用可能な実在の画像(Unsplash・Pexels・Pixabayなど)が検索で見つかった場合のみ、直接アクセスできるURLを`imageUrl`に入れてよい(任意・全ての投稿で省略可)。見つからない/確信が持てない場合は絶対に入れない。実在しないURLを作り上げることは絶対にしない。実在の企業ロゴや商標そのものの画像は選ばない。",
      "11. 出力は説明文やMarkdown記法（コードブロック含む）を一切含めず、次のJSON配列のみを出力すること。前置きの説明も理由の説明も一切書かない。出力の最初の文字は必ず [ 、最後の文字は必ず ] にすること。",
      "",
      "出力形式（これ以外は絶対に出力しない）:",
      "通常投稿（形式が「通常投稿」に指定されている件）: {\"type\":\"投稿タイプ名\",\"topic\":\"話題タグ（2〜8字程度）\",\"keyword\":\"実際に起点にした検索キーワード\",\"text\":\"投稿本文（必ず140字以内）\",\"imageUrl\":\"(任意)\"}",
      "画像化投稿（形式が「画像化投稿」に指定されている件）: {\"type\":\"投稿タイプ名\",\"topic\":\"話題タグ\",\"keyword\":\"実際に起点にした検索キーワード\",\"mode\":\"image\",\"hookText\":\"導入文(140字以内)\",\"fullText\":\"本文(400〜500字程度)\",\"imageUrl\":\"(任意)\"}",
      "指定された形式の通りに1件ずつ書き、配列にして出力する: [{...}, {...}]"
    ].join("\n");
  }

  function buildQtPrompt() {
    var s = state.settings;
    var count = parseInt(s.qtCount, 10) || 2;
    var url = $("#qtUrl").value.trim();
    var gist = $("#qtGist").value.trim();
    return [
      "あなたは就活支援Xアカウント「フルトレ就活」の中の人として、他アカウントの投稿に対する引用リツイート用の一言コメントを" + count + "件考えてください。",
      "",
      "【元投稿URL（自分用メモ。内容の推測には使わない）】",
      url || "(未指定)",
      "",
      "【対象ポストの内容】",
      gist || "(未指定。想定されるテーマに対して汎用的に使えるコメントにする)",
      "",
      "【このアカウントのペルソナ・実績・トーン】",
      s.persona,
      "",
      "【厳守ルール】",
      "1. 対象ポストの文章をそのまま書き写したり、内容をなぞっただけの要約で終わらせたりしない。かわりに「フルトレ就活」自身の視点・経験・切り口を必ず加える。",
      "2. 「わかります」「その通りだと思います」のような中身のない相槌だけで終わらせない。次のうち少なくとも1つを必ず含め、読んだ人が「見て得した」と思える具体性を持たせる：①自分の実体験・具体的な数字（デザシコ受験回数、内定社数など）、②元の投稿では触れられていない補足の切り口や別の視点、③今日から使える具体的なアクション、④軽い異論とその理由。",
      "3. 各コメントは140字以内という制約の中で、120字前後（110〜130字を目安）を狙って、上記②の付加価値をしっかり書き込む。短い相槌で字数を余らせない。",
      "4. note記事への誘導は無理に入れない。文脈上自然な場合のみ、" + count + "件中1件までにとどめる。",
      "5. 対象ポストの具体的な中身が分からない場合（未指定の場合）でも、当たり障りのない一般論で終わらせず、想定されるテーマに対して具体的で実用的な一言になるようにする。",
      "6. 出力は説明文やMarkdown記法を一切含めず、次のJSON配列のみを出力すること。前置きの説明も書かない。出力の最初の文字は必ず [ 、最後の文字は必ず ] にすること。",
      "",
      "出力形式（これ以外は絶対に出力しない）:",
      "[{\"angle\":\"一言ラベル\",\"text\":\"コメント本文\"}]"
    ].join("\n");
  }

  // ---------- rendering: settings ----------
  function fillSettingsForm() {
    var s = state.settings;
    $("#persona").value = s.persona;
    $("#pastTweets").value = s.pastTweets;
    $("#noteLinks").value = s.noteLinks;
    $("#hotThemes").value = s.hotThemes;
    $("#watchAccounts").value = s.watchAccounts;
    $("#affiliateItems").value = s.affiliateItems;
    $("#useWebSearch").checked = !!s.useWebSearch;
    $("#searchKeywords").value = s.searchKeywords;
    TYPE_DEFS.forEach(function (t) {
      var el = document.getElementById("t_" + t.key);
      if (el) el.checked = !!s.types[t.key];
    });
    $("#targetLen").value = s.targetLen;
    $("#generateCount").value = String(s.generateCount);
    $("#qtCountSelect").value = String(s.qtCount);
  }

  function readSettingsForm() {
    var s = state.settings;
    s.persona = $("#persona").value;
    s.pastTweets = $("#pastTweets").value;
    s.noteLinks = $("#noteLinks").value;
    s.hotThemes = $("#hotThemes").value;
    s.watchAccounts = $("#watchAccounts").value;
    s.affiliateItems = $("#affiliateItems").value;
    s.useWebSearch = $("#useWebSearch").checked;
    s.searchKeywords = $("#searchKeywords").value;
    TYPE_DEFS.forEach(function (t) {
      var el = document.getElementById("t_" + t.key);
      s.types[t.key] = el ? el.checked : false;
    });
    var lenRaw = toHalfWidthDigits($("#targetLen").value).replace(/[^0-9]/g, "");
    var len = clamp(parseInt(lenRaw, 10) || 130, 40, 400);
    s.targetLen = len;
    $("#targetLen").value = len;
    s.generateCount = parseInt($("#generateCount").value, 10) || 6;
    s.qtCount = parseInt($("#qtCountSelect").value, 10) || 2;
  }

  // ---------- rendering: stats / history ----------
  function renderStats() {
    var posts = state.history.filter(function (h) { return h.kind === "post"; });
    var quotes = state.history.filter(function (h) { return h.kind === "quote"; });
    $("#statTotal").textContent = posts.length;
    $("#statToday").textContent = state.history.filter(function (h) { return isToday(h.ts); }).length;
    $("#statQuote").textContent = quotes.length;
    if (posts.length) {
      var last = posts[posts.length - 1];
      var d = new Date(last.ts);
      $("#statLast").textContent = (d.getMonth() + 1) + "/" + d.getDate();
    } else {
      $("#statLast").textContent = "–";
    }
  }

  function renderHistory() {
    var list = $("#historyList");
    list.innerHTML = "";
    var items = state.history.slice().reverse().slice(0, 100);
    if (items.length === 0) {
      list.innerHTML = '<div class="empty-state">まだ履歴はありません。</div>';
      return;
    }
    items.forEach(function (h) {
      var row = document.createElement("div");
      row.className = "history-item";
      var label = h.kind === "quote" ? "引用RT" : (TYPE_LABEL[h.type] || h.type);
      row.innerHTML =
        '<div style="flex:1; min-width:0;">' +
        '<div class="meta">' + fmtDate(h.ts) + ' ・ ' + label + '</div>' +
        '<div class="txt">' + escapeHtml(h.text.slice(0, 60)) + (h.text.length > 60 ? "…" : "") + '</div>' +
        '</div>' +
        '<button data-id="' + h.id + '">削除</button>';
      row.querySelector("button").addEventListener("click", function () {
        state.history = state.history.filter(function (x) { return x.id !== h.id; });
        saveHistory();
        renderStats();
        renderHistory();
      });
      list.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- draft cards: main posts ----------
  function dupScoreAgainstHistoryAndBatch(text, excludeIndex) {
    var texts = state.history.filter(function (h) { return h.kind === "post"; }).map(function (h) { return h.text; });
    state.drafts.forEach(function (d, i) {
      if (i === excludeIndex) return;
      texts.push(d.thread ? d.thread.join(" ") : d.text);
    });
    var best = 0;
    texts.forEach(function (t) {
      var score = jaccard(text, t);
      if (score > best) best = score;
    });
    return best;
  }

  function renderDrafts() {
    var area = $("#draftsArea");
    var empty = document.getElementById("emptyState");
    if (state.drafts.length === 0) {
      area.innerHTML = '<div class="empty-state" id="emptyState">初めての場合はこの順番で進めてください。' +
        '<ol>' +
        '<li>上の「トレーニング設定」を開き、内容を自分の言葉に整えて「設定を保存」</li>' +
        '<li>STEP1「指示文を作る」→「指示文をコピー」</li>' +
        '<li>「Claudeを新しいタブで開く」→ 貼り付けて送信(検索がONだとなお良い)</li>' +
        '<li>Claudeの回答をコピーし、STEP2に貼り付けて「解析してカード表示」</li>' +
        '<li>気に入った案をコピー、またはXで下書きを開いて投稿し、「使用済みにする」</li>' +
        '</ol></div>';
      return;
    }
    area.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "draft-grid";
    state.drafts.forEach(function (d, idx) {
      var card = document.createElement("div");
      card.className = "draft-card" + (d.used ? " used" : "");

      var isImageMode = d.mode === "image";
      var fullText = isImageMode ? d.fullText : (d.thread ? d.thread.join("\n続き↓\n") : d.text);
      // 使用済みにした投稿は、自分自身が履歴に追加された直後の再描画で「自分自身」と
      // 比較されて100%一致してしまうため、使用済みカードでは重複チェックを行わない。
      var dup = d.used ? 0 : dupScoreAgainstHistoryAndBatch(fullText, idx);

      var top = document.createElement("div");
      top.className = "draft-top";
      var topicLabel = [d.topic, d.keyword].filter(Boolean).join(" ・ ");
      if (isImageMode) topicLabel = "画像化投稿" + (topicLabel ? " ・ " + topicLabel : "");
      top.innerHTML = '<span class="type-tag">' + escapeHtml(TYPE_LABEL[d.type] || d.type) + '</span>' +
        '<span class="char-count">' + escapeHtml(topicLabel) + '</span>';
      card.appendChild(top);

      if (isImageMode) {
        var hookLen = charLen(d.hookText);
        var hookLenLine = document.createElement("div");
        hookLenLine.className = "char-count" + (hookLen > 140 ? " over" : "");
        hookLenLine.textContent = "ツイート本文: " + hookLen + "字";
        card.appendChild(hookLenLine);
        var hookEl = document.createElement("div");
        hookEl.className = "draft-text";
        hookEl.textContent = d.hookText;
        card.appendChild(hookEl);

        var fullWrap = document.createElement("div");
        fullWrap.className = "thread-part";
        fullWrap.innerHTML = '<div class="pnum">画像に入る本文(' + charLen(d.fullText) + '字)</div>' +
          '<div class="draft-text">' + escapeHtml(d.fullText) + '</div>';
        card.appendChild(fullWrap);

        var cardWrap = document.createElement("div");
        cardWrap.className = "image-panel";
        var cardImg = document.createElement("img");
        cardImg.src = buildTextCardDataUrl(d, { longForm: true, cardText: d.fullText });
        cardWrap.appendChild(cardImg);
        var cardBtnRow = document.createElement("div");
        cardBtnRow.className = "row";
        var cardFb = document.createElement("span");
        cardFb.className = "feedback";
        if (canShareFiles()) {
          var cardShareBtn = document.createElement("button");
          cardShareBtn.className = "btn btn-x btn-small";
          cardShareBtn.textContent = "画像を共有してXへ";
          cardShareBtn.addEventListener("click", function () {
            shareImageToX(cardImg.src, d.hookText, "furutore-card.png", cardFb).then(function (ok) {
              if (!ok) showFeedback(cardFb, "共有できませんでした。下のダウンロードから保存して貼り付けてください", true);
            });
          });
          cardBtnRow.appendChild(cardShareBtn);
        }
        var cardDl = document.createElement("a");
        cardDl.className = "btn btn-ghost btn-small";
        cardDl.textContent = "画像をダウンロード";
        cardDl.href = cardImg.src;
        cardDl.download = "furutore-card.png";
        cardBtnRow.appendChild(cardDl);
        cardBtnRow.appendChild(cardFb);
        cardWrap.appendChild(cardBtnRow);
        card.appendChild(cardWrap);
      } else if (d.thread && d.thread.length) {
        d.thread.forEach(function (part, pi) {
          var wrap = document.createElement("div");
          wrap.className = "thread-part";
          var len = charLen(part);
          wrap.innerHTML = '<div class="pnum">パート' + (pi + 1) + ' / ' + d.thread.length +
            ' <span class="char-count' + (len > 140 ? " over" : "") + '">' + len + '字</span></div>' +
            '<div class="draft-text">' + escapeHtml(part) + '</div>';
          var copyBtn = document.createElement("button");
          copyBtn.className = "btn btn-x btn-small";
          copyBtn.textContent = "このパートをコピー";
          var fb = document.createElement("span");
          fb.className = "feedback";
          copyBtn.addEventListener("click", function () { copyText(part, fb); });
          wrap.appendChild(copyBtn);
          wrap.appendChild(fb);
          card.appendChild(wrap);
        });
      } else {
        var len = charLen(d.text);
        var lenLine = document.createElement("div");
        lenLine.className = "char-count" + (len > 140 ? " over" : "");
        lenLine.textContent = len + "字";
        card.appendChild(lenLine);
        var textEl = document.createElement("div");
        textEl.className = "draft-text";
        textEl.textContent = d.text;
        card.appendChild(textEl);
      }

      if (d.imageUrl) {
        var foundWrap = document.createElement("div");
        foundWrap.className = "image-panel";
        var foundLabel = document.createElement("div");
        foundLabel.className = "pnum";
        foundLabel.textContent = "AIが見つけた著作権フリー画像の候補(内容を確認してからお使いください)";
        foundWrap.appendChild(foundLabel);
        var foundImg = document.createElement("img");
        foundImg.src = d.imageUrl;
        foundImg.referrerPolicy = "no-referrer";
        foundImg.addEventListener("error", function () {
          foundWrap.innerHTML = "";
          var errMsg = document.createElement("div");
          errMsg.className = "dup-warn";
          errMsg.textContent = "画像を読み込めませんでした。URLが無効か、期限切れの可能性があります: " + d.imageUrl;
          foundWrap.appendChild(errMsg);
        });
        foundWrap.appendChild(foundImg);
        var foundLink = document.createElement("a");
        foundLink.className = "btn btn-ghost btn-small";
        foundLink.textContent = "元画像を開く";
        foundLink.href = d.imageUrl;
        foundLink.target = "_blank"; foundLink.rel = "noopener noreferrer";
        foundWrap.appendChild(foundLink);
        card.appendChild(foundWrap);
      }

      if (dup >= 0.35) {
        var warn = document.createElement("div");
        warn.className = "dup-warn";
        warn.textContent = "⚠ 既存の投稿と似ている可能性があります(類似度 " + Math.round(dup * 100) + "%)。内容を見直すか、使用を見送ってください。";
        card.appendChild(warn);
      }

      var actions = document.createElement("div");
      actions.className = "draft-actions";

      if (!d.thread) {
        var tweetText = isImageMode ? d.hookText : d.text;
        var copyAllBtn = document.createElement("button");
        copyAllBtn.className = "btn btn-x btn-small";
        copyAllBtn.textContent = "コピー";
        var fbAll = document.createElement("span");
        fbAll.className = "feedback";
        copyAllBtn.addEventListener("click", function () { copyText(tweetText, fbAll); });
        actions.appendChild(copyAllBtn);

        var xBtn = document.createElement("a");
        xBtn.className = "btn btn-ghost btn-small";
        xBtn.textContent = "Xで下書きを開く";
        xBtn.href = xIntentUrl(tweetText);
        xBtn.target = "_blank";
        xBtn.rel = "noopener";
        actions.appendChild(xBtn);
        actions.appendChild(fbAll);
      }

      if (!d.thread && !isImageMode) {
        var imagePanel = document.createElement("div");
        imagePanel.className = "image-panel";
        imagePanel.style.display = "none";

        var cardImgBtn = document.createElement("button");
        cardImgBtn.className = "btn btn-ghost btn-small";
        cardImgBtn.textContent = "画像カードを作る";
        cardImgBtn.addEventListener("click", function () {
          var dataUrl = buildTextCardDataUrl(d);
          imagePanel.innerHTML = "";
          var img = document.createElement("img");
          img.src = dataUrl;
          imagePanel.appendChild(img);
          var btnRow = document.createElement("div");
          btnRow.className = "row";
          var fb = document.createElement("span");
          fb.className = "feedback";
          if (canShareFiles()) {
            var shareBtn = document.createElement("button");
            shareBtn.className = "btn btn-x btn-small";
            shareBtn.textContent = "画像を共有してXへ";
            shareBtn.addEventListener("click", function () {
              shareImageToX(dataUrl, tweetText, "furutore-card.png", fb).then(function (ok) {
                if (!ok) showFeedback(fb, "共有できませんでした。下のダウンロードから保存して貼り付けてください", true);
              });
            });
            btnRow.appendChild(shareBtn);
          }
          var dl = document.createElement("a");
          dl.className = "btn btn-ghost btn-small";
          dl.textContent = "画像をダウンロード";
          dl.href = dataUrl;
          dl.download = "furutore-card.png";
          btnRow.appendChild(dl);
          btnRow.appendChild(fb);
          imagePanel.appendChild(btnRow);
          imagePanel.style.display = "block";
        });
        actions.appendChild(cardImgBtn);

        var imgPromptBtn = document.createElement("button");
        imgPromptBtn.className = "btn btn-ghost btn-small";
        imgPromptBtn.textContent = "画像生成プロンプト";
        imgPromptBtn.addEventListener("click", function () {
          imagePanel.innerHTML = "";
          var ta = document.createElement("textarea");
          ta.rows = 6;
          ta.readOnly = true;
          ta.value = buildImagePrompt(d);
          imagePanel.appendChild(ta);
          var row = document.createElement("div");
          row.className = "row";
          row.style.marginTop = "6px";
          var copyPromptBtn = document.createElement("button");
          copyPromptBtn.className = "btn btn-x btn-small";
          copyPromptBtn.textContent = "プロンプトをコピー";
          var fbImg = document.createElement("span");
          fbImg.className = "feedback";
          copyPromptBtn.addEventListener("click", function () { copyText(ta.value, fbImg); });
          row.appendChild(copyPromptBtn);
          var bingLink = document.createElement("a");
          bingLink.className = "btn btn-ghost btn-small";
          bingLink.textContent = "Bing Image Creatorを開く";
          bingLink.href = "https://www.bing.com/images/create";
          bingLink.target = "_blank"; bingLink.rel = "noopener";
          row.appendChild(bingLink);
          var canvaLink = document.createElement("a");
          canvaLink.className = "btn btn-ghost btn-small";
          canvaLink.textContent = "Canvaを開く";
          canvaLink.href = "https://www.canva.com/ai-image-generator/";
          canvaLink.target = "_blank"; canvaLink.rel = "noopener";
          row.appendChild(canvaLink);
          row.appendChild(fbImg);
          imagePanel.appendChild(row);
          imagePanel.style.display = "block";
        });
        actions.appendChild(imgPromptBtn);
      }

      var usedBtn = document.createElement("button");
      usedBtn.className = "btn btn-ghost btn-small";
      usedBtn.textContent = d.used ? "使用済み" : "使用済みにする";
      usedBtn.disabled = !!d.used;
      usedBtn.addEventListener("click", function () {
        d.used = true;
        state.history.push({
          id: "h" + Date.now() + Math.random().toString(36).slice(2, 7),
          ts: Date.now(),
          kind: "post",
          type: d.type,
          topic: d.topic || "",
          keyword: d.keyword || "",
          text: fullText
        });
        saveHistory();
        saveDrafts();
        renderStats();
        renderHistory();
        renderDrafts();
      });
      actions.appendChild(usedBtn);

      card.appendChild(actions);
      if (!d.thread && !isImageMode) card.appendChild(imagePanel);
      grid.appendChild(card);
    });
    area.appendChild(grid);
  }

  // ---------- draft cards: quote-RT ----------
  function renderQtDrafts() {
    var area = $("#qtDraftsArea");
    if (state.qtDrafts.length === 0) {
      area.innerHTML = '<div class="empty-state" id="qtEmptyState">上のリンクから伸びている投稿を探して引用RTしましょう。</div>';
      return;
    }
    area.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "draft-grid";
    var qtUrl = $("#qtUrl").value.trim();
    state.qtDrafts.forEach(function (d) {
      var card = document.createElement("div");
      card.className = "draft-card" + (d.used ? " used" : "");
      var len = charLen(d.text);
      card.innerHTML =
        '<div class="draft-top"><span class="type-tag">' + escapeHtml(d.angle || "引用RT") + '</span>' +
        '<span class="char-count' + (len > 140 ? " over" : "") + '">' + len + '字</span></div>' +
        '<div class="draft-text">' + escapeHtml(d.text) + '</div>';
      var actions = document.createElement("div");
      actions.className = "draft-actions";

      var copyBtn = document.createElement("button");
      copyBtn.className = "btn btn-x btn-small";
      copyBtn.textContent = "コピー";
      var fb = document.createElement("span");
      fb.className = "feedback";
      copyBtn.addEventListener("click", function () { copyText(d.text, fb); });
      actions.appendChild(copyBtn);

      var xBtn = document.createElement("a");
      xBtn.className = "btn btn-ghost btn-small";
      xBtn.textContent = "Xで下書きを開く";
      xBtn.href = xIntentUrl(d.text, qtUrl || undefined);
      xBtn.target = "_blank";
      xBtn.rel = "noopener";
      actions.appendChild(xBtn);
      actions.appendChild(fb);

      var usedBtn = document.createElement("button");
      usedBtn.className = "btn btn-ghost btn-small";
      usedBtn.textContent = d.used ? "使用済み" : "使用済みにする";
      usedBtn.disabled = !!d.used;
      usedBtn.addEventListener("click", function () {
        d.used = true;
        state.history.push({
          id: "h" + Date.now() + Math.random().toString(36).slice(2, 7),
          ts: Date.now(),
          kind: "quote",
          type: "quote",
          topic: d.angle || "",
          text: d.text
        });
        saveHistory();
        saveQtDrafts();
        renderStats();
        renderHistory();
        renderQtDrafts();
      });
      actions.appendChild(usedBtn);

      card.appendChild(actions);
      grid.appendChild(card);
    });
    area.appendChild(grid);
  }

  // ---------- quick links ----------
  function renderQtQuickLinks() {
    var wrap = $("#qtQuickLinks");
    wrap.innerHTML = "";
    var accounts = (state.settings.watchAccounts || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    accounts.forEach(function (name) {
      var a = document.createElement("a");
      a.className = "btn btn-ghost btn-small";
      a.textContent = "@" + name;
      a.href = "https://x.com/" + encodeURIComponent(name);
      a.target = "_blank"; a.rel = "noopener";
      wrap.appendChild(a);
    });
    var themes = (state.settings.hotThemes || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 3);
    themes.forEach(function (theme) {
      var a = document.createElement("a");
      a.className = "btn btn-ghost btn-small";
      a.textContent = "検索: " + theme;
      a.href = "https://x.com/search?q=" + encodeURIComponent(theme) + "&src=typed_query&f=top";
      a.target = "_blank"; a.rel = "noopener";
      wrap.appendChild(a);
    });
    var home = document.createElement("a");
    home.className = "btn btn-ghost btn-small";
    home.textContent = "フォロー中TL";
    home.href = "https://x.com/home";
    home.target = "_blank"; home.rel = "noopener";
    wrap.appendChild(home);
  }

  // ---------- error banner ----------
  function showError(containerId, msg) {
    var el = document.getElementById(containerId);
    el.innerHTML = msg ? '<div class="error-banner">' + escapeHtml(msg) + '</div>' : "";
  }

  // ---------- event wiring ----------
  function init() {
    fillSettingsForm();
    renderStats();
    renderHistory();
    renderDrafts();
    renderQtDrafts();
    renderQtQuickLinks();

    $("#saveBtn").addEventListener("click", function () {
      readSettingsForm();
      saveSettings();
      renderQtQuickLinks();
      var note = $("#saveNote");
      note.textContent = "保存しました";
      setTimeout(function () { note.textContent = ""; }, 3000);
    });

    $("#buildPromptBtn").addEventListener("click", function () {
      showError("errorArea", "");
      readSettingsForm();
      saveSettings();
      try {
        var prompt = buildMainPrompt();
        $("#promptText").value = prompt;
        $("#promptArea").style.display = "block";
      } catch (e) {
        showError("errorArea", "指示文の作成に失敗しました: " + e.message);
      }
    });
    $("#copyPromptBtn").addEventListener("click", function () {
      copyText($("#promptText").value, $("#copyPromptFeedback"));
    });
    $("#parseBtn").addEventListener("click", function () {
      showError("errorArea", "");
      var raw = $("#pasteArea").value;
      if (!raw.trim()) { showError("errorArea", "貼り付け欄が空です。"); return; }
      try {
        var arr = extractJsonArray(raw);
        if (!Array.isArray(arr) || arr.length === 0) throw new Error("配列が空、または形式が正しくありません。");
        state.drafts = arr.map(function (item) {
          var isImageMode = item.mode === "image";
          return {
            type: normalizeTypeKey(item.type),
            topic: item.topic || "",
            keyword: item.keyword || "",
            mode: isImageMode ? "image" : undefined,
            hookText: isImageMode ? (item.hookText || "") : undefined,
            fullText: isImageMode ? (item.fullText || "") : undefined,
            text: isImageMode || item.thread ? undefined : (item.text || ""),
            thread: !isImageMode && Array.isArray(item.thread) ? item.thread : undefined,
            imageUrl: item.imageUrl || "",
            used: false
          };
        });
        saveDrafts();
        renderDrafts();
      } catch (e) {
        showError("errorArea", "解析に失敗しました: " + e.message);
      }
    });

    $("#qtBuildPromptBtn").addEventListener("click", function () {
      showError("qtErrorArea", "");
      readSettingsForm();
      saveSettings();
      var prompt = buildQtPrompt();
      $("#qtPromptText").value = prompt;
      $("#qtPromptArea").style.display = "block";
    });
    $("#qtCopyPromptBtn").addEventListener("click", function () {
      copyText($("#qtPromptText").value, $("#qtCopyPromptFeedback"));
    });
    $("#qtParseBtn").addEventListener("click", function () {
      showError("qtErrorArea", "");
      var raw = $("#qtPasteArea").value;
      if (!raw.trim()) { showError("qtErrorArea", "貼り付け欄が空です。"); return; }
      try {
        var arr = extractJsonArray(raw);
        if (!Array.isArray(arr) || arr.length === 0) throw new Error("配列が空、または形式が正しくありません。");
        state.qtDrafts = arr.map(function (item) {
          return { angle: item.angle || "", text: item.text || "", used: false };
        });
        saveQtDrafts();
        renderQtDrafts();
      } catch (e) {
        showError("qtErrorArea", "解析に失敗しました: " + e.message);
      }
    });

    $("#clearHistoryBtn").addEventListener("click", function () {
      if (!confirm("履歴を全て削除します。よろしいですか？")) return;
      state.history = [];
      saveHistory();
      renderStats();
      renderHistory();
    });

    $("#exportBtn").addEventListener("click", function () {
      readSettingsForm();
      var blob = JSON.stringify({ settings: state.settings, history: state.history }, null, 0);
      var ta = $("#exportArea");
      ta.style.display = "block";
      ta.value = blob;
      ta.focus();
      ta.select();
    });
    $("#importBtn").addEventListener("click", function () {
      var raw = $("#importArea").value.trim();
      if (!raw) return;
      if (!confirm("現在の設定・履歴を上書きします。よろしいですか？")) return;
      try {
        var obj = JSON.parse(raw);
        if (obj.settings) { state.settings = obj.settings; saveSettings(); fillSettingsForm(); }
        if (obj.history) { state.history = obj.history; saveHistory(); }
        renderStats();
        renderHistory();
        renderQtQuickLinks();
        alert("復元しました。");
      } catch (e) {
        alert("復元に失敗しました: " + e.message);
      }
    });

    // 生成件数・鉄板テーマ・巡回アカウントの変更をクイックリンクに即時反映
    ["hotThemes", "watchAccounts"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", function () {
        readSettingsForm();
        saveSettings();
        renderQtQuickLinks();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
