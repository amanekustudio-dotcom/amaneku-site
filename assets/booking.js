// 予約カレンダー（見本）
// 日程・演奏家・会場は Supabase（get_available_slots）から読み込む。予約・決済はまだつないでいない。
(function () {
  var LANG = document.documentElement.lang === "ja" ? "ja" : "en";
  var IMG = "../assets/img/";

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
      readMore: "インタビューを読む", loading: "日程を読み込んでいます…", loadError: "日程を読み込めませんでした。時間をおいて、もう一度開いてください。", only: function (n) { return n + " の日程だけを表示しています"; }, showAll: "すべての演奏家を表示", close: "閉じる", sample: "※ 表示している日程・演奏家・場所はダミーです（架空の人物です）。"
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
      readMore: "Read the interview", loading: "Loading dates…", loadError: "We couldn't load the dates. Please try again in a moment.", only: function (n) { return "Showing dates with " + n + " only"; }, showAll: "Show all artists", close: "Close", sample: "Dates, artists and places shown here are placeholders (fictional people)."
    }
  }[LANG];

  // ---- データ（Supabase から読み込む） ----
  // anon（公開用）の鍵。空き状況を見ることしかできない（予約やお客さまの情報は読めない）。
  var SUPABASE_URL = "https://enoiaitbavewiusniakv.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2lhaXRiYXZld2l1c25pYWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NjQ1OTEsImV4cCI6MjEwODA0MDU5MX0._7AKNLPYlJF07OljkDuGnpaGzaNeQOh64putvoms-uw";
  var ARTISTS = {}, PLACES = {}, SLOTS = [];

  // 日本時間の日付と時刻
  function jst(iso) {
    var p = {};
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date(iso)).forEach(function (x) { p[x.type] = x.value; });
    return { d: p.year + "-" + p.month + "-" + p.day, t: (p.hour === "24" ? "00" : p.hour) + ":" + p.minute };
  }
  function addRow(r) {
    var years = r.artist_playing_since ? new Date().getFullYear() - r.artist_playing_since : null;
    ARTISTS[r.artist_slug] = {
      photo: r.artist_photo_url,
      name: { ja: r.artist_name_ja, en: r.artist_name_en },
      school: {
        ja: (r.artist_role_ja || "長唄") + (years ? " · 演奏歴" + years + "年" : ""),
        en: (r.artist_role_en || "Nagauta") + (years ? " · " + years + " years" : "")
      },
      bio: { ja: r.artist_bio_ja || "", en: r.artist_bio_en || "" }
    };
    PLACES[r.venue_slug] = { name: { ja: r.area_ja, en: r.area_en }, note: { ja: r.access_ja || "", en: r.access_en || "" } };
    var st = jst(r.starts_at), en = jst(r.ends_at);
    SLOTS.push({ id: r.slot_id, d: st.d, t: st.t, e: en.t, a: r.artist_slug, p: r.venue_slug, booked: !r.is_available,
      languages: r.languages, price: r.price_jpy, maxGuests: r.max_guests, minGuests: r.min_guests });
  }

  var root = document.getElementById("booking-app");
  if (!root) return;
  var am = /[?&]artist=([\w-]+)/.exec(location.search);
  var onlySlug = am ? am[1] : null;
  root.innerHTML = '<p class="muted">' + T.loading + "</p>";
  fetch(SUPABASE_URL + "/rest/v1/rpc/get_available_slots", {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(onlySlug ? { p_artist_slug: onlySlug } : {})
  })
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (rows) { rows.forEach(addRow); init(); })
    .catch(function () { root.innerHTML = '<p class="muted">' + T.loadError + "</p>"; });

  function init() {
  // ---- 準備 ----
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function yen(n) { return "¥" + n.toLocaleString("en-US"); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var only = onlySlug;
  var byDay = {};
  SLOTS.filter(function (s) { return !only || s.a === only; }).forEach(function (s) { (byDay[s.d] = byDay[s.d] || []).push(s); });
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
    var chip = el("div", "bk-filter", "<span>" + T.only(ARTISTS[only] ? ARTISTS[only].name[LANG] : only) + "</span>");
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
          '<div class="row1"><span class="time">' + s.t + '<small>–' + s.e + '</small></span><span class="badge' + (s.booked ? " is-full" : "") + '">' + T.status(!s.booked) + '</span></div>' +
          '<div class="nm">' + a.name[LANG] + '</div>' +
          '<div class="meta"><span>' + p.name[LANG] + '</span><span>' + T.minutes + '</span><span>' + T.private + '</span><span>' + yen(s.price) + ' ' + T.perPerson + '</span></div>' +
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
    for (var n = (s.minGuests || 1); n <= (s.maxGuests || 2); n++) opts += '<option value="' + n + '">' + T.guestN(n) + "</option>";
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
          '<dt>' + T.when + '</dt><dd>' + T.dateLong(d) + '　' + s.t + '–' + s.e + '</dd>' +
          '<dt>' + T.length + '</dt><dd>' + T.minutes + '</dd>' +
          '<dt>' + T.where + '</dt><dd>' + p.name[LANG] + '<small>' + p.note[LANG] + '<br>' + T.addr + '</small></dd>' +
          '<dt>' + T.lang + '</dt><dd><div class="seg">' + T.langOpts.filter(function (o) { return s.languages.indexOf(o[0]) >= 0; }).map(function (o, i) { return '<label><input type="radio" name="bk-lang" value="' + o[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + o[1] + '</span></label>'; }).join('') + '</div></dd>' +
          '<dt>' + T.incl + '</dt><dd>' + T.inclText + '</dd>' +
          '<dt>' + T.cancel + '</dt><dd>' + T.cancelText + '</dd>' +
          '<dt>' + T.price + '</dt><dd>' + yen(s.price) + ' ' + T.perPerson + '</dd>' +
        '</dl>' +
        '<div class="bk-total"><label>' + T.guests + ' <select>' + opts + '</select></label>' +
          '<div><span class="muted">' + T.total + '</span> <strong class="sum">' + yen(s.price * (s.minGuests || 1)) + '</strong></div></div>' +
        '<button type="button" class="btn" disabled aria-disabled="true">' + T.book + '</button>' +
        '<p class="muted bk-note">' + T.notReady + '</p>' +
      '</div>';
    dlg.querySelector(".bk-close").onclick = function () { dlg.close(); };
    var sel = dlg.querySelector("select"), sum = dlg.querySelector(".sum");
    sel.onchange = function () { sum.textContent = yen(s.price * +sel.value); };
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  renderCal();
  renderList(false);
  root.insertAdjacentElement("afterend", el("p", "muted bk-sample", T.sample));
  }
})();
