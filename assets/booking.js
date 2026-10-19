// 予約カレンダー（見本）
// 日程・演奏家・場所はすべて見本データ。予約システムをつなぐときは SLOTS を実データに置き換える。
(function () {
  var LANG = document.documentElement.lang === "ja" ? "ja" : "en";
  var IMG = "../assets/img/";
  var PRICE = 20000;

  var DOW_JA = ["日", "月", "火", "水", "木", "金", "土"];
  var DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function MONTH_EN(y, m) { return MONTHS_EN[m] + " " + y; }
  var T = {
    ja: {
      dow: ["日", "月", "火", "水", "木", "金", "土"],
      month: function (y, m) { return y + "年" + (m + 1) + "月"; },
      dayTitle: function (d) { return (d.getMonth() + 1) + "月" + d.getDate() + "日（" + DOW_JA[d.getDay()] + "）の回"; },
      dateLong: function (d) { return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日（" + DOW_JA[d.getDay()] + "）"; },
      prev: "前の月", next: "次の月",
      open: "予約できる日", full: "予約済み", off: "開催なし", noneMonth: "この月の回はありません。", private: "貸切 · 1〜2名",
      pick: "カレンダーから日付を選んでください。",
      none: "この日の回はありません。",
      status: function (ok) { return ok ? "予約できます" : "予約済み"; },
      perPerson: "/ 1名",
      minutes: "60分",
      title: "長唄三味線 ― 歌舞伎の音楽を弾く",
      when: "日時", length: "所要時間", where: "場所", artist: "演奏家", price: "料金", guests: "人数", total: "合計",
      addr: "詳しい住所は、予約の確定後にメールでお知らせします。",
      guestN: function (n) { return n + "名"; },
      incl: "含まれるもの", inclText: "60分の貸切体験、三味線と道具一式、お茶、解説カード、持ち帰り用カード",
      cancel: "キャンセル", cancelText: "キャンセル規定は準備中です。",
      lang: "言語", langOpts: [["ja", "日本語"], ["en", "英語"]],
      book: "この内容で予約する", notReady: "予約システムは準備中です（この画面は見本です）。",
      readMore: "インタビューを読む", only: function (n) { return n + " の日程だけを表示しています"; }, showAll: "すべての演奏家を表示", close: "閉じる", sample: "※ 表示している日程・演奏家・場所はダミーです（架空の人物です）。"
    },
    en: {
      dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      month: function (y, m) { return ["January","February","March","April","May","June","July","August","September","October","November","December"][m] + " " + y; },
      dayTitle: function (d) { return "Sessions on " + DOW_EN[d.getDay()] + ", " + d.getDate() + " " + MONTH_EN(d.getFullYear(), d.getMonth()).split(" ")[0]; },
      dateLong: function (d) { return DOW_EN[d.getDay()] + ", " + d.getDate() + " " + MONTH_EN(d.getFullYear(), d.getMonth()); },
      prev: "Previous month", next: "Next month",
      open: "Available", full: "Booked", off: "No sessions", noneMonth: "No sessions this month.", private: "Private · 1–2 guests",
      pick: "Choose a date on the calendar.",
      none: "No sessions on this day.",
      status: function (ok) { return ok ? "Available" : "Booked"; },
      perPerson: "/ person",
      minutes: "60 min",
      title: "Nagauta Shamisen: Play the Music of Kabuki",
      when: "Date", length: "Duration", where: "Place", artist: "Artist", price: "Price", guests: "Guests", total: "Total",
      addr: "The exact address is emailed to you after your booking is confirmed.",
      guestN: function (n) { return n + (n === 1 ? " guest" : " guests"); },
      incl: "Included", inclText: "Private 60-minute session, shamisen and accessories, Japanese tea, guide card, take-home card",
      cancel: "Cancellation", cancelText: "Cancellation terms coming soon.",
      lang: "Language", langOpts: [["en", "English"], ["ja", "Japanese"]],
      book: "Book this session", notReady: "Online booking is not open yet (this screen is a sample).",
      readMore: "Read the interview", only: function (n) { return "Showing dates with " + n + " only"; }, showAll: "Show all artists", close: "Close", sample: "Dates, artists and places shown here are placeholders (fictional people)."
    }
  }[LANG];

  // ---- 見本データ ----
  // 演奏家・会場は架空（ダミー）。実在の人物ではない。
  var ARTISTS = {
    a: { photo: "sample-artist-a.jpg",
      name: { ja: "山科 宗一郎", en: "Soichiro Yamashina" },
      school: { ja: "長唄三味線 · 演奏歴30年", en: "Nagauta shamisen · 30 years" },
      bio: { ja: "8歳で三味線を始め、歌舞伎の地方（じかた）として東京と大阪の劇場に出演。現在は神戸を拠点に、舞台と稽古場を行き来している。", en: "Began the shamisen at eight and has played for kabuki theatres in Tokyo and Osaka. Now based in Kobe, between the stage and the practice room." } },
    b: { photo: "sample-artist-b.jpg",
      name: { ja: "早瀬 千鶴", en: "Chizuru Hayase" },
      school: { ja: "長唄（唄・三味線）· 演奏歴18年", en: "Nagauta song & shamisen · 18 years" },
      bio: { ja: "唄と三味線の両方を受け持つ。音大で西洋音楽を学んだのち長唄の道へ。初めての人に、音の面白さから伝えるのが得意。", en: "Sings and plays. Studied Western music before turning to nagauta, and loves showing first-timers what makes the sound special." } },
    c: { photo: "sample-artist-c.jpg",
      name: { ja: "藤代 律", en: "Ritsu Fujishiro" },
      school: { ja: "長唄三味線 · 演奏歴12年", en: "Nagauta shamisen · 12 years" },
      bio: { ja: "大学の邦楽部で長唄に出会い、卒業後に本格的に修業。英語での指導経験があり、海外公演にも参加している。", en: "Discovered nagauta in a university club and trained seriously after graduating. Teaches in English and has performed abroad." } },
    d: { photo: "sample-artist-d.jpg",
      name: { ja: "小野寺 はる", en: "Haru Onodera" },
      school: { ja: "長唄三味線 · 演奏歴40年", en: "Nagauta shamisen · 40 years" },
      bio: { ja: "神戸生まれ。半世紀近く長唄とともに暮らしてきた。自宅の稽古場で、お茶を飲みながらゆっくり進める時間を大切にしている。", en: "Born in Kobe, and has lived with nagauta for almost half a century. Prefers an unhurried session over tea in a home studio." } }
  };
  var PLACES = {
    motomachi: { name: { ja: "神戸・元町", en: "Motomachi, Kobe" }, note: { ja: "JR元町駅から徒歩5分ほど", en: "About 5 min on foot from JR Motomachi Station" } },
    sannomiya: { name: { ja: "神戸・三宮", en: "Sannomiya, Kobe" }, note: { ja: "三宮駅から徒歩8分ほど", en: "About 8 min on foot from Sannomiya Station" } },
    kitano: { name: { ja: "神戸・北野", en: "Kitano, Kobe" }, note: { ja: "異人館街の近く。三宮駅から徒歩15分ほど", en: "Near the old foreign quarter. About 15 min on foot from Sannomiya" } },
    okamoto: { name: { ja: "神戸・岡本", en: "Okamoto, Kobe" }, note: { ja: "阪急岡本駅から徒歩7分ほど", en: "About 7 min on foot from Hankyu Okamoto Station" } }
  };
  var SLOTS = [
    { d: "2026-11-01", t: "10:30", a: "c", p: "kitano" },
    { d: "2026-11-01", t: "14:00", a: "d", p: "okamoto" },
    { d: "2026-11-01", t: "16:00", a: "a", p: "motomachi" },
    { d: "2026-11-03", t: "10:30", a: "a", p: "motomachi" },
    { d: "2026-11-03", t: "14:00", a: "c", p: "kitano" },
    { d: "2026-11-07", t: "10:30", a: "b", p: "sannomiya" },
    { d: "2026-11-07", t: "14:00", a: "a", p: "motomachi" },
    { d: "2026-11-07", t: "16:00", a: "c", p: "kitano" },
    { d: "2026-11-08", t: "10:30", a: "d", p: "okamoto" },
    { d: "2026-11-08", t: "15:00", a: "b", p: "sannomiya", booked: true },
    { d: "2026-11-11", t: "18:30", a: "c", p: "kitano" },
    { d: "2026-11-14", t: "14:00", a: "a", p: "motomachi", booked: true },
    { d: "2026-11-14", t: "16:30", a: "b", p: "sannomiya", booked: true },
    { d: "2026-11-15", t: "10:30", a: "d", p: "okamoto" },
    { d: "2026-11-15", t: "14:00", a: "b", p: "sannomiya" },
    { d: "2026-11-19", t: "18:30", a: "c", p: "kitano" },
    { d: "2026-11-21", t: "10:30", a: "a", p: "motomachi" },
    { d: "2026-11-21", t: "13:00", a: "d", p: "okamoto" },
    { d: "2026-11-21", t: "14:00", a: "b", p: "sannomiya" },
    { d: "2026-11-21", t: "16:30", a: "c", p: "kitano" },
    { d: "2026-11-22", t: "10:30", a: "b", p: "sannomiya" },
    { d: "2026-11-23", t: "14:00", a: "a", p: "motomachi" },
    { d: "2026-11-28", t: "14:00", a: "a", p: "motomachi" },
    { d: "2026-11-28", t: "15:30", a: "d", p: "okamoto" },
    { d: "2026-11-29", t: "14:00", a: "b", p: "sannomiya", booked: true },
    { d: "2026-12-05", t: "14:00", a: "a", p: "motomachi" },
    { d: "2026-12-05", t: "16:00", a: "c", p: "kitano" },
    { d: "2026-12-06", t: "10:30", a: "b", p: "sannomiya" },
    { d: "2026-12-12", t: "14:00", a: "d", p: "okamoto" },
    { d: "2026-12-13", t: "10:30", a: "a", p: "motomachi" },
    { d: "2026-12-19", t: "14:00", a: "c", p: "kitano" },
    { d: "2026-12-20", t: "14:00", a: "b", p: "sannomiya" }
  ];

  // ---- 準備 ----
  var root = document.getElementById("booking-app");
  if (!root) return;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function yen(n) { return "¥" + n.toLocaleString("en-US"); }
  function endTime(t) { var p = t.split(":"); var m = +p[0] * 60 + +p[1] + 60; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var m = /[?&]artist=(\w+)/.exec(location.search);
  var only = m && ARTISTS[m[1]] ? m[1] : null;
  var byDay = {};
  SLOTS.filter(function (s) { return !only || s.a === only; }).forEach(function (s, i) { s.id = i; (byDay[s.d] = byDay[s.d] || []).push(s); });
  Object.keys(byDay).forEach(function (k) { byDay[k].sort(function (x, y) { return x.t < y.t ? -1 : 1; }); });

  var today = new Date(); today.setHours(0, 0, 0, 0);
  function state(k) {
    var list = byDay[k];
    if (!list || parse(k) < today) return "off";
    return list.some(function (s) { return !s.booked; }) ? "open" : "full";
  }
  var openDays = Object.keys(byDay).filter(function (k) { return state(k) === "open"; }).sort();
  var selected = openDays[0] || null;
  var first = selected ? parse(selected) : today;
  var view = { y: first.getFullYear(), m: first.getMonth() };
  var minView = { y: today.getFullYear(), m: today.getMonth() };
  var lastKey = Object.keys(byDay).sort().pop();
  var maxView = lastKey ? { y: parse(lastKey).getFullYear(), m: parse(lastKey).getMonth() } : minView;
  function vnum(v) { return v.y * 12 + v.m; }

  // ---- 骨組み ----
  root.innerHTML = "";
  if (only) {
    var chip = el("div", "bk-filter", "<span>" + T.only(ARTISTS[only].name[LANG]) + "</span>");
    var all = el("a", null, T.showAll); all.href = location.pathname + "#dates";
    chip.appendChild(all); root.parentNode.insertBefore(chip, root);
  }
  var cal = el("div", "cal");
  var list = el("div", "bk-list");
  root.appendChild(cal); root.appendChild(list);

  var dlg = el("dialog", "bk-modal");
  dlg.setAttribute("aria-label", T.title);
  document.body.appendChild(dlg);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // 表示中の月の、最初の予約できる日（なければ予約済みの日）を選ぶ
  function pickInView() {
    var prefix = view.y + "-" + pad(view.m + 1) + "-";
    var days = Object.keys(byDay).filter(function (k) { return k.indexOf(prefix) === 0 && state(k) !== "off"; }).sort();
    var open = days.filter(function (k) { return state(k) === "open"; });
    selected = open[0] || days[0] || null;
    renderCal(); renderList(false);
  }

  // ---- カレンダー ----
  function renderCal() {
    cal.innerHTML = "";
    var head = el("div", "cal-head");
    var prev = el("button", "cal-nav", "←"); prev.type = "button"; prev.setAttribute("aria-label", T.prev);
    var next = el("button", "cal-nav", "→"); next.type = "button"; next.setAttribute("aria-label", T.next);
    prev.disabled = vnum(view) <= vnum(minView);
    next.disabled = vnum(view) >= vnum(maxView);
    prev.onclick = function () { view.m--; if (view.m < 0) { view.m = 11; view.y--; } pickInView(); };
    next.onclick = function () { view.m++; if (view.m > 11) { view.m = 0; view.y++; } pickInView(); };
    var h = el("h3", null, T.month(view.y, view.m));
    head.appendChild(prev); head.appendChild(h); head.appendChild(next);
    cal.appendChild(head);

    var grid = el("div", "cal-grid");
    T.dow.forEach(function (w, i) { grid.appendChild(el("div", "cal-dow" + (i === 0 ? " sun" : i === 6 ? " sat" : ""), w)); });
    var start = new Date(view.y, view.m, 1).getDay();
    var days = new Date(view.y, view.m + 1, 0).getDate();
    for (var i = 0; i < start; i++) grid.appendChild(el("div", "cal-blank"));
    for (var d = 1; d <= days; d++) {
      var date = new Date(view.y, view.m, d), k = key(date), st = state(k);
      var b = el("button", "cal-day " + st, "<span>" + d + "</span>");
      b.type = "button";
      if (+date === +today) b.classList.add("today");
      if (k === selected) { b.classList.add("selected"); b.setAttribute("aria-pressed", "true"); }
      b.setAttribute("aria-label", T.dateLong(date) + " · " + T[st]);
      if (st === "off") { b.disabled = true; }
      else { b.dataset.key = k; b.onclick = function () { selected = this.dataset.key; renderCal(); renderList(true); }; }
      if (st === "full") b.dataset.label = T.full;
      grid.appendChild(b);
    }
    cal.appendChild(grid);
    cal.appendChild(el("div", "cal-legend",
      '<span><i class="sw open"></i>' + T.open + '</span><span><i class="sw full"></i>' + T.full + '</span><span><i class="sw off"></i>' + T.off + '</span>'));
  }

  // ---- その日の回 ----
  function renderList(scroll) {
    list.innerHTML = "";
    if (!selected) { list.appendChild(el("p", "muted bk-empty", T.noneMonth)); return; }
    list.appendChild(el("h3", "bk-day", T.dayTitle(parse(selected))));
    var items = byDay[selected] || [];
    if (!items.length) { list.appendChild(el("p", "muted", T.none)); return; }
    var wrap = el("div", "slot-list");
    items.forEach(function (s) {
      var a = ARTISTS[s.a], p = PLACES[s.p];
      var c = el("button", "slot-card");
      c.type = "button";
      if (s.booked) c.setAttribute("aria-disabled", "true");
      c.innerHTML =
        '<img src="' + IMG + a.photo + '" alt="">' +
        '<div class="info">' +
          '<div class="row1"><span class="time">' + s.t + '<small>–' + endTime(s.t) + '</small></span><span class="badge' + (s.booked ? " is-full" : "") + '">' + T.status(!s.booked) + '</span></div>' +
          '<div class="nm">' + a.name[LANG] + '</div>' +
          '<div class="meta"><span>' + p.name[LANG] + '</span><span>' + T.minutes + '</span><span>' + T.private + '</span><span>' + yen(PRICE) + ' ' + T.perPerson + '</span></div>' +
        '</div>' +
        '<span class="chev" aria-hidden="true">→</span>';
      c.onclick = function () { if (!s.booked) openDetail(s); };
      wrap.appendChild(c);
    });
    list.appendChild(wrap);
    if (scroll && window.matchMedia("(max-width: 900px)").matches) list.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- 詳細 ----
  function openDetail(s) {
    var a = ARTISTS[s.a], p = PLACES[s.p], d = parse(s.d);
    var opts = "";
    for (var n = 1; n <= 2; n++) opts += '<option value="' + n + '">' + T.guestN(n) + "</option>";
    dlg.innerHTML =
      '<button type="button" class="bk-close" aria-label="' + T.close + '">×</button>' +
      '<div class="bk-top">' +
        '<img src="' + IMG + a.photo + '" alt="">' +
        '<div><div class="eyebrow">' + a.school[LANG] + '</div><div class="nm">' + a.name[LANG] + '</div>' +
        '<p>' + a.bio[LANG] + '</p><a href="artist.html#artist-' + s.a + '">' + T.readMore + ' →</a></div>' +
      '</div>' +
      '<div class="bk-body">' +
        '<h3>' + T.title + '</h3>' +
        '<dl>' +
          '<dt>' + T.when + '</dt><dd>' + T.dateLong(d) + '　' + s.t + '–' + endTime(s.t) + '</dd>' +
          '<dt>' + T.length + '</dt><dd>' + T.minutes + '</dd>' +
          '<dt>' + T.where + '</dt><dd>' + p.name[LANG] + '<small>' + p.note[LANG] + '<br>' + T.addr + '</small></dd>' +
          '<dt>' + T.lang + '</dt><dd><div class="seg">' + T.langOpts.map(function (o, i) { return '<label><input type="radio" name="bk-lang" value="' + o[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + o[1] + '</span></label>'; }).join('') + '</div></dd>' +
          '<dt>' + T.incl + '</dt><dd>' + T.inclText + '</dd>' +
          '<dt>' + T.cancel + '</dt><dd>' + T.cancelText + '</dd>' +
          '<dt>' + T.price + '</dt><dd>' + yen(PRICE) + ' ' + T.perPerson + '</dd>' +
        '</dl>' +
        '<div class="bk-total"><label>' + T.guests + ' <select>' + opts + '</select></label>' +
          '<div><span class="muted">' + T.total + '</span> <strong class="sum">' + yen(PRICE) + '</strong></div></div>' +
        '<button type="button" class="btn" disabled aria-disabled="true">' + T.book + '</button>' +
        '<p class="muted bk-note">' + T.notReady + '</p>' +
      '</div>';
    dlg.querySelector(".bk-close").onclick = function () { dlg.close(); };
    var sel = dlg.querySelector("select"), sum = dlg.querySelector(".sum");
    sel.onchange = function () { sum.textContent = yen(PRICE * +sel.value); };
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  renderCal();
  renderList(false);
  root.insertAdjacentElement("afterend", el("p", "muted bk-sample", T.sample));
})();
