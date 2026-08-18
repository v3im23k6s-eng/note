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

  var DEFAULT_PERSONA =
    "「フルトレ就活」/ @fluture_74\n" +
    "ES・ガクチカ・面接・SPI・自己分析・OB訪問・業界研究など、就職活動全般を実体験ベースで支援するアカウント。専門分野の一つとしてデザイン思考テスト(デザシコ)も扱うが、投稿全体の1〜2割程度に留め、話題を独占しない。\n" +
    "実績: デザイン思考テストを29回受験し16回SS評価を獲得(3回目以降は9割がA/S/SS)。日系大手4社から内定(50社ES提出→43社通過(総合商社5社含む)→15社最終面接→4社内定)。ES通過率90%(総合商社含む)。就活攻略noteを500円で200名以上に販売。TOEICは900点台。\n" +
    "トーン: 断定口調でテンポよく、短文中心。締めは「〜べき」「〜ましょう」「〜できる」のような行動喚起で終えることが多い。見出しは【】、構成は①②③や・の箇条書きで可視化する。誇張・煽り表現(誰でも/絶対に稼げる系)は使わない。\n" +
    "ハッシュタグは対象の卒業年度(複数学年可)+就活+就職活動を末尾にまとめて付ける。";

  var DEFAULT_PAST_TWEETS =
    "TOEIC900点ぐらいの時に on the same page って表現をAtsu さんから初めての聞いた。\nニュースや映画見てるとバンバン出てくるから思い切ってDistinction 1,2,3まとめ買いした\n\n---\n\nデザイン思考テストでSS（上位1%）を取りました私が2000字ほどで高得点を取るために意識していること、ポイントをまとめました。\n\nこのツイートのリツイートとフォローで3名の方にプレゼントします！\n\n#デザイン思考　#デザイン思考テスト\n#22卒　#23卒\n\n---\n\nまたまた23卒へのアドバイス。\n新聞は読んだほうがいい。新聞の知識あるだけで頭が良い印象を与えれます。\n\n僕は面接で何度も新聞に書いてあることそのまま言って、褒められたことあります。\n\n#23卒　#就活\n\n---\n\n人を巻き込むガクチカが多いが、「どうやって巻き込んだ？」という想定される質問に対ししっかり答えられない人が多い。\n\n解答例)　人は①論理で動く人と②情熱で動く人がいると思います。巻き込みたい人がどちらのタイプかを見極めてアプローチしました。　論理タイプには彼らのメリットを理路整然↓\n\n#23卒　#24卒　#就職活動　#就活　#デザイン思考テスト　#デザシニ\n\n---\n\n総合商社も含めてES通過率90%だったのですが、ガクチカだけで1.8万文字書きなぐり、熟考を重ねました。\n\n①エピソードを細かいところまで書き出し\n②アピールできそうなところを残す。\n③PREP法に従い1000字ぐらいで書いてみる\n④言葉を一つ一つ変え、短くしていく。\n\nこの作業をしました。\n\n---\n\n三菱に内定した先輩の【最後に一言】\n\n私は「毎日自分との約束を守り続けること」を大切にしています。150人のOB訪問の中でそんな社員の方が一番多いと感じたのが御社です。御社でも毎日自分との約束を守り続け成長することを約束します。\n\n1番熱を込めて語ったそう\n\n#25卒　#24卒　#就活　#就職活動\n\n---\n\n【ESなしでSPIが受けられる企業】\n①ミルボン\n②アフラック\n③東レ\n④野村総合研究所\n⑤JCB\n⑥NTT系列\n⑦キーエンス\n⑧日本郵送\n\n年末年始にSPIは勉強して年明けに一気に受ける。高得点を取ってそれを使いまわす。\n\n#26卒　#25卒　#就活　#就職活動\n\n---\n\n自分の大切にしてきた価値観は思わぬところに転がっている。\n\n(例)\nアルバイトを辞めた理由が店長の理不尽な叱責\n→人間関係重視\n\nアルバイトを辞めた理由が時給が低く、仕事にやる気が起きないから\n→給料\n\n#26卒 #就職活動　#就活";

  var DEFAULT_SEARCH_KEYWORDS =
    "就活 最新ニュース\n大学4年生 就職活動\n\n[思考法・シンキング系]\nロジカルシンキング／論理的思考\nクリティカルシンキング／批判的思考\nデザイン思考／デザインシンキング\nラテラルシンキング／水平思考\n仮説思考\nシステム思考\nゼロベース思考\n\n[分析フレームワーク・伝える技術]\nMECE\nロジックツリー／イシューツリー\nPREP法\n3C分析／SWOT分析\nPDCAサイクル／OODAループ\nフェルミ推定\n\n[選考・適性テスト・評価手法]\nデザイン思考テスト（DTT）\nケース面接\nSTAR面接法\nコンピテンシー\n構造化面接\n\n[社会人基礎力・ポータブルスキル]\nポータブルスキル\n社会人基礎力\nファシリテーション\nアサーティブコミュニケーション\nネゴシエーション／交渉力\n\n[トレンド・実務リテラシー]\nDX（デジタルトランスフォーメーション）\n生成AI活用／プロンプトエンジニアリング\nデータリテラシー\n\n[ケース・地頭選考系（問題解決）]\nイシュー／本質的課題\nボトルネック\nドライバー（変数分解）\nトレードオフ\n売上向上・市場規模推計\n\n[WEBテスト・選考プロセス系]\n玉手箱／TG-WEB／C-GAB\nジョブ（選考型インターン）\nエレベーターピッチ\n逆質問\n\n[自己分析・ガクチカ作成系]\nWILL・CAN・MUST\n原体験\n抽象化と具体化\nキャリアアンカー\n\n[ビジネス・業界理解系]\nLTV／CAC\nジョブ型雇用 vs メンバーシップ型雇用\n\n[締切・時期トレンド系（優先度高め・毎回1つはここから検索）]\nサマーインターン 締切\n秋冬インターン 選考スケジュール\nES締切 今週\n早期選考 エントリー締切\n26卒 27卒 就活スケジュール";

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
      allowThreads: true,
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

    var typeListText = assigned.map(function (key, idx) {
      var def = TYPE_DEFS.filter(function (t) { return t.key === key; })[0];
      return (idx + 1) + "件目: " + def.label + "（" + def.desc + "）";
    }).join("\n");

    var recentPosts = state.history.filter(function (h) { return h.kind === "post"; }).slice(-20);
    var recentTopics = recentPosts.map(function (h) { return h.topic; }).filter(Boolean).join("、") || "(まだ履歴はありません)";
    var recentHistoryTexts = recentPosts.length
      ? recentPosts.map(function (h) { return "・" + h.text.replace(/\n/g, " "); }).join("\n")
      : "(まだ使用済み履歴はありません)";

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
      "【最新情報の検索・学習について（重要）】",
      "このチャットで検索機能が使える場合は、投稿を書く前に必ず「今、就活生の間で話題になっていること」を調べてください。下のキーワードリストは出発点であり、これに縛られる必要はありません。ニュースサイトの見出しや検索結果から気になる話題が見つかれば、リストにない言葉でも自由に追加で検索してください。" + count + "件の中で使う話題・切り口はできるだけ幅広く分散させ、同じような検索キーワード・同じような切り口に偏らないようにしてください。",
      "1回目の検索: 下のリストの「締切・時期トレンド系」から1つ、または本日の日付に合いそうな独自のキーワードで、締切や選考スケジュールなど今すぐ役立つ時期情報を検索する（優先度高め）。",
      "2回目以降の検索: リスト内の思考法・フレームワーク・選考手法・ビジネス理解などから、直近の話題タグでまだ扱っていない分野を意識して検索する。リストにない新しいキーワードも自分で考えて検索してよい。企業紹介型を書く場合は、実在する具体的な企業名で検索し、締切・事業内容・年収などの情報を確認する。",
      s.searchKeywords || DEFAULT_SEARCH_KEYWORDS,
      "検索結果を使うときのルール:",
      "- 「日経」「ニュース」等の一般的な言及ではなく、検索で実際に見つかった具体的な出来事・データ・企業名・締切日・傾向を最低1つは拾う。何も具体的な情報が見つからなければ、無理に最新情報型・企業紹介型を書かず、他のタイプに切り替えてよい。",
      "- 記事の文章をそのまま書き写さない。要点を自分の言葉で言い換える。",
      "- 出典に触れる場合は「〇〇の記事によると」程度の軽い言及にとどめ、長い引用はしない。",
      "- 検索で確認できない具体的な数字・日付・事実は書かない。企業紹介型は特にこの点を厳守する。",
      "- 1年以上前の情報など明らかに古いものは「最新情報」として使わない。",
      "- 最新情報型の投稿は、事実の要約だけで終わらせず、必ず「それが就活生にとって何を意味するか」というこのペルソナ自身の解釈・アドバイスを1文以上添える。",
      "- 検索で得た「今の空気感」は最新情報型・企業紹介型以外の投稿の話題選びにも自由に活かしてよい。",
      "（検索機能が使えない/オフの場合は、手元の情報のみで書いてください。企業紹介型・最新情報型は使えません。）",
      "",
      "【直近使用した話題タグ（できるだけこれと同じ・近い話題は避けること）】",
      recentTopics,
      "",
      "【直近の使用済み履歴（この内容と同じ・酷似した投稿は禁止）】",
      recentHistoryTexts,
      "",
      "【厳守ルール】",
      "0. 内容がワンパターン化しないよう、上の「話題タグ」一覧を確認し、そこにない新しい話題を選ぶこと。ES・ガクチカ・面接などの定番テーマばかりに逃げず、思考法・フレームワーク・締切トレンドなど幅広いカテゴリからローテーションする。" + count + "件の中でも話題が偏らないようにする。",
      "1. 過去投稿例・使用済み履歴と同じ文章やほぼ同じ言い回しを繰り返さない。文体や熱量は参考にしてよいが、文章自体は必ず新規に書く。",
      "2. 他の就活支援アカウントの特定の投稿を真似ない。",
      "3. ペルソナに書かれていない実績や数字、登録されていない商品を捏造しない。",
      "4. noteの宣伝・購読誘導ができるのは「直結型」の投稿だけです。他のタイプでは、noteへのリンク誘導や購読を促す文言を一切書かないこと。",
      "5. 「アフィリエイト紹介型」を作る場合は、登録済みの商品のみを扱い、誇大な効果効能は書かない。広告であることが一目でわかるよう文中に「#PR」の表記を必ず入れる。",
      "6. 「比較型（❌⭕）」では、❌でよくあるNG行動を2〜4個、⭕でその代わりにやるべきことを箇条書きで示す構成にする。",
      "7. 「企業紹介型」は必ず検索で確認できた実在企業の情報のみを使う。",
      "8. 各投稿は目標" + s.targetLen + "字前後を意識する。ただしXの無料アカウントは1投稿140字までしか投稿できない。140字を超えても伝えたい内容が濃い場合" + (s.allowThreads ? "（スレッド機能ON）" : "") + "は、140字以内の複数パートに分割し、返信で繋げる「スレッド」として書いてよい（2〜4パート程度が目安）。" + (s.allowThreads ? "" : "ただしスレッド機能はOFFなので、必ず140字以内の1投稿に収めること。"),
      "9. 出力は説明文やMarkdown記法（コードブロック含む）を一切含めず、次のJSON配列のみを出力すること。前置きの説明も理由の説明も一切書かない。出力の最初の文字は必ず [ 、最後の文字は必ず ] にすること。",
      "",
      "出力形式（これ以外は絶対に出力しない）:",
      "通常投稿: {\"type\":\"投稿タイプ名\",\"topic\":\"話題タグ（2〜8字程度）\",\"text\":\"投稿本文（140字以内）\"}",
      "スレッド投稿（スレッド機能ONの場合のみ）: {\"type\":\"投稿タイプ名\",\"topic\":\"話題タグ\",\"thread\":[\"1パート目(140字以内)\",\"2パート目(140字以内)\"]}",
      "上記のどちらかの形式を1件ずつ選び、配列にして出力する: [{...}, {...}]"
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
    $("#allowThreads").checked = !!s.allowThreads;
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
    s.allowThreads = $("#allowThreads").checked;
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

      var fullText = d.thread ? d.thread.join("\n続き↓\n") : d.text;
      // 使用済みにした投稿は、自分自身が履歴に追加された直後の再描画で「自分自身」と
      // 比較されて100%一致してしまうため、使用済みカードでは重複チェックを行わない。
      var dup = d.used ? 0 : dupScoreAgainstHistoryAndBatch(fullText, idx);

      var top = document.createElement("div");
      top.className = "draft-top";
      top.innerHTML = '<span class="type-tag">' + escapeHtml(TYPE_LABEL[d.type] || d.type) + '</span>' +
        '<span class="char-count">' + (d.topic ? escapeHtml(d.topic) : "") + '</span>';
      card.appendChild(top);

      if (d.thread && d.thread.length) {
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

      if (dup >= 0.35) {
        var warn = document.createElement("div");
        warn.className = "dup-warn";
        warn.textContent = "⚠ 既存の投稿と似ている可能性があります(類似度 " + Math.round(dup * 100) + "%)。内容を見直すか、使用を見送ってください。";
        card.appendChild(warn);
      }

      var actions = document.createElement("div");
      actions.className = "draft-actions";

      if (!d.thread) {
        var copyAllBtn = document.createElement("button");
        copyAllBtn.className = "btn btn-x btn-small";
        copyAllBtn.textContent = "コピー";
        var fbAll = document.createElement("span");
        fbAll.className = "feedback";
        copyAllBtn.addEventListener("click", function () { copyText(d.text, fbAll); });
        actions.appendChild(copyAllBtn);

        var xBtn = document.createElement("a");
        xBtn.className = "btn btn-ghost btn-small";
        xBtn.textContent = "Xで下書きを開く";
        xBtn.href = xIntentUrl(d.text);
        xBtn.target = "_blank";
        xBtn.rel = "noopener";
        actions.appendChild(xBtn);
        actions.appendChild(fbAll);
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
          return {
            type: item.type || "empathy",
            topic: item.topic || "",
            text: item.thread ? undefined : (item.text || ""),
            thread: Array.isArray(item.thread) ? item.thread : undefined,
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
