// 予約カレンダーと予約フォーム
// 日程・演奏家・会場は Supabase（get_available_slots）から読み込む。
// 予約は Edge Function（create-checkout）で仮押さえ → Stripe の支払い画面へ移る。
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
      minutes: "60分", min: function (n) { return n + "分"; }, piece: "曲", fromArtist: "演奏家より",
      title: "長唄三味線 ― 歌舞伎の音楽を弾く",
      when: "日時", length: "所要時間", where: "場所", artist: "演奏家", price: "料金", guests: "人数", total: "合計",
      addr: "詳しい住所は、予約の確定後にメールでお知らせします。",
      guestN: function (n) { return n + "名"; },
      incl: "含まれるもの", inclText: "60分の貸切体験、三味線と道具一式、お茶、解説カード、持ち帰り用カード",
      cancel: "キャンセル", cancelText: '4日前まで全額返金、3日前〜前日は50%、当日は返金なし。<a href="legal.html#cancel">くわしく</a>',
      lang: "言語", langOpts: [["ja", "日本語"], ["en", "英語"]],
      book: "お支払いへ進む", sending: "お支払いの画面を準備しています…",
      formTitle: "ご予約の方", name: "お名前", email: "メールアドレス", country: "お住まいの国・地域（任意）", required: "必須", needAll: "お名前・メールアドレスを入力し、同意にチェックすると進めます。", phone: "電話番号（任意）", message: "ご要望（任意）",
      messageHint: "正座が難しい、など。当日の配慮に必要なことだけで大丈夫です。",
      shareNote: 'お名前・人数・言語・ご要望は、担当の演奏家にお伝えします（<a href="legal.html#privacy" target="_blank">プライバシーポリシー</a>）。',
      agree: '<a href="legal.html#cancel" target="_blank">キャンセル規定</a>と<a href="legal.html#terms" target="_blank">利用規約</a>に同意します',
      payNote: "次の画面（Stripe）でカード情報を入力し、お支払いが完了した時点で予約が確定します。30分以内にお手続きください。",
      errors: { slot_unavailable: "申し訳ありません。この回は、ちょうど別の方が予約の手続き中です。別の日時をお選びください。", booking_closed: "この回の受付は締め切りました。", terms_required: "キャンセル規定と利用規約への同意が必要です。", invalid_input: "お名前とメールアドレスを確認してください。", too_many_holds: "短い時間に何度もお手続きいただいたため、受付を一時的に止めています。1時間ほどたってから、もう一度お試しください。", error: "うまくいきませんでした。時間をおいて、もう一度お試しください。" },
      released: "お支払いを中止しました。この回の仮押さえは外れています。",
      readMore: "プロフィールを読む", loading: "日程を読み込んでいます…", loadError: "日程を読み込めませんでした。時間をおいて、もう一度開いてください。", only: function (n) { return n + " の日程だけを表示しています"; }, showAll: "すべての演奏家を表示", close: "閉じる", sample: "※ 表示している日程・演奏家・場所はダミーです（架空の人物です）。"
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
      minutes: "60 min", min: function (n) { return n + " min"; }, piece: "Piece", fromArtist: "From the artist",
      title: "Nagauta Shamisen: Play the Music of Kabuki",
      when: "Date", length: "Duration", where: "Place", artist: "Artist", price: "Price", guests: "Guests", total: "Total",
      addr: "The exact address is emailed to you after your booking is confirmed.",
      guestN: function (n) { return n + (n === 1 ? " guest" : " guests"); },
      incl: "Included", inclText: "Private 60-minute session, shamisen and accessories, Japanese tea, guide card, take-home card",
      cancel: "Cancellation", cancelText: 'Full refund up to 4 days before; 50% from 1–3 days before; no refund on the day. <a href="legal.html#cancel">Details</a>',
      lang: "Language", langOpts: [["en", "English"], ["ja", "Japanese"]],
      book: "Continue to payment", sending: "Preparing the payment page…",
      formTitle: "Your details", name: "Full name", email: "Email", country: "Country or region (optional)", required: "Required", needAll: "Enter your name and email and tick the box to continue.", phone: "Phone (optional)", message: "Anything we should know? (optional)",
      messageHint: "For example, if sitting on the floor is difficult. Only what helps us on the day.",
      shareNote: 'We share your name, number of guests, language and requests with your artist (<a href="legal.html#privacy" target="_blank">Privacy policy</a>).',
      agree: 'I agree to the <a href="legal.html#cancel" target="_blank">cancellation policy</a> and <a href="legal.html#terms" target="_blank">terms of service</a>',
      payNote: "You'll enter your card details on the next screen (Stripe). Your booking is confirmed once payment is complete. Please finish within 30 minutes.",
      errors: { slot_unavailable: "Sorry, someone else is booking this session right now. Please choose another time.", booking_closed: "Bookings for this session have closed.", terms_required: "Please agree to the cancellation policy and terms of service.", invalid_input: "Please check your name and email.", too_many_holds: "Too many booking attempts in a short time. Please try again in about an hour.", error: "Something went wrong. Please try again in a moment." },
      released: "Payment was cancelled. This session is no longer held for you.",
      readMore: "Read her profile", loading: "Loading dates…", loadError: "We couldn't load the dates. Please try again in a moment.", only: function (n) { return "Showing dates with " + n + " only"; }, showAll: "Show all artists", close: "Close", sample: "Dates, artists and places shown here are placeholders (fictional people)."
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
  // データベースの文字は、画面に入れる前に無害化する（< > & " ' を文字として扱う）
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function slug(v) { return /^[\w-]{1,80}$/.test(v || "") ? v : "x"; }
  function photo(v) { v = v || ""; return esc(/^https:\/\//.test(v) ? v : IMG + v.replace(/[^\w.-]/g, "")); }
  function addRow(r) {
    r.artist_slug = slug(r.artist_slug); r.venue_slug = slug(r.venue_slug);
    var years = r.artist_playing_since ? new Date().getFullYear() - r.artist_playing_since : null;
    ARTISTS[r.artist_slug] = {
      photo: photo(r.artist_photo_url),
      name: { ja: esc(r.artist_name_ja), en: esc(r.artist_name_en) },
      school: {
        ja: esc(r.artist_role_ja || "長唄") + (years ? " · 演奏歴" + years + "年" : ""),
        en: esc(r.artist_role_en || "Nagauta") + (years ? " · " + years + " years" : "")
      },
      bio: { ja: esc(r.artist_bio_ja), en: esc(r.artist_bio_en) }
    };
    PLACES[r.venue_slug] = { name: { ja: esc(r.area_ja), en: esc(r.area_en) }, note: { ja: esc(r.access_ja), en: esc(r.access_en) } };
    var st = jst(r.starts_at), en = jst(r.ends_at);
    SLOTS.push({ id: esc(r.slot_id), d: st.d, t: st.t, e: en.t, a: r.artist_slug, p: r.venue_slug, booked: !r.is_available,
      languages: (r.languages || []).filter(function (l) { return l === "ja" || l === "en"; }), price: +r.price_jpy || 0, maxGuests: +r.max_guests || 2, minGuests: +r.min_guests || 1,
      // 体験の型・曲・演奏家のひとこと（演奏家ページで選んだもの）
      title: { ja: esc(r.title_ja), en: esc(r.title_en) }, dur: +r.duration_min || 60, kanji: esc(r.experience_kanji),
      piece: { ja: esc(r.piece_name_ja), en: esc(r.piece_name_en) }, pieceAbout: { ja: esc(r.piece_about_ja), en: esc(r.piece_about_en) },
      msg: { ja: esc(r.message_ja), en: esc(r.message_en) } });
  }

  var root = document.getElementById("booking-app");
  if (!root) return;
  var am = /[?&]artist=([\w-]+)/.exec(location.search);
  var onlySlug = am ? am[1] : null;
  root.innerHTML = '<p class="muted">' + T.loading + "</p>";
  function sb(path, body) {
    return fetch(SUPABASE_URL + path, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }
  var rel = /[?&]released=([0-9a-f-]{36})/i.exec(location.search);
  if (rel && history.replaceState) {
    var q = location.search.replace(/([?&])released=[^&]*&?/, "$1").replace(/[?&]$/, "");
    history.replaceState(null, "", location.pathname + q + location.hash);
  }
  (rel ? sb("/functions/v1/release-hold", { token: rel[1] }).catch(function () {}) : Promise.resolve())
    .then(function () { return sb("/rest/v1/rpc/get_available_slots", onlySlug ? { p_artist_slug: onlySlug } : {}); })
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (rows) {
      rows.forEach(addRow); init();
      if (rel) root.parentNode.insertBefore(el0("p", "bk-flash", T.released), root.previousSibling && root.previousSibling.className === "bk-filter" ? root.previousSibling : root);
    })
    .catch(function () { root.innerHTML = '<p class="muted">' + T.loadError + "</p>"; });
  function el0(tag, cls, text) { var e = document.createElement(tag); e.className = cls; e.textContent = text; return e; }

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
  // ?date=YYYY-MM-DD で開いたら、その日を選んだ状態にする（演奏家ページの「予約ページで見る」から）
  var dm = /[?&]date=(\d{4}-\d{2}-\d{2})/.exec(location.search);
  if (dm && byDay[dm[1]]) selected = dm[1];
  // ?slot=<枠のid> で開いたら、その枠の日を選び、詳細の画面まで開く（演奏家ページで枠を押したとき）
  var sm = /[?&]slot=([0-9a-f-]{36})/i.exec(location.search);
  var focusSlot = sm ? SLOTS.filter(function (x) { return x.id === sm[1]; })[0] : null;
  if (focusSlot) selected = focusSlot.d;
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
        '<img src="' + a.photo + '" alt="">' +
        '<div class="info">' +
          '<div class="row1"><span class="time">' + s.t + '<small>–' + s.e + '</small></span><span class="badge' + (s.booked ? " is-full" : "") + '">' + T.status(!s.booked) + '</span></div>' +
          '<div class="nm">' + a.name[LANG] + '</div>' +
          '<div class="exp-line">' + (s.kanji ? '<b>' + s.kanji + '</b> ' : '') + s.title[LANG] + (s.piece[LANG] ? ' ・ 「' + s.piece[LANG] + '」' : '') + '</div>' +
          '<div class="meta"><span>' + p.name[LANG] + '</span><span>' + T.min(s.dur) + '</span><span>' + T.private + '</span><span>' + yen(s.price) + ' ' + T.perPerson + '</span></div>' +
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
        '<img src="' + a.photo + '" alt="">' +
        '<div><div class="eyebrow">' + a.school[LANG] + '</div><div class="nm">' + a.name[LANG] + '</div>' +
        '<p>' + a.bio[LANG] + '</p><a href="artist.html#artist-' + s.a + '">' + T.readMore + ' →</a></div>' +
      '</div>' +
      '<div class="bk-body">' +
        '<h3>' + (s.title[LANG] || T.title) + '</h3>' +
        '<dl>' +
          '<dt>' + T.when + '</dt><dd>' + T.dateLong(d) + '　' + s.t + '–' + s.e + '</dd>' +
          '<dt>' + T.length + '</dt><dd>' + T.min(s.dur) + '</dd>' +
          (s.piece[LANG] ? '<dt>' + T.piece + '</dt><dd>「' + s.piece[LANG] + '」' + (s.pieceAbout[LANG] ? '<small>' + s.pieceAbout[LANG] + '</small>' : '') + '</dd>' : '') +
          ((s.msg[LANG] || s.msg.ja) ? '<dt>' + T.fromArtist + '</dt><dd>' + (s.msg[LANG] || s.msg.ja) + '</dd>' : '') +
          '<dt>' + T.where + '</dt><dd>' + p.name[LANG] + '<small>' + p.note[LANG] + '<br>' + T.addr + '</small></dd>' +
          '<dt>' + T.lang + '</dt><dd><div class="seg">' + T.langOpts.filter(function (o) { return s.languages.indexOf(o[0]) >= 0; }).map(function (o, i) { return '<label><input type="radio" name="bk-lang" value="' + o[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + o[1] + '</span></label>'; }).join('') + '</div></dd>' +
          '<dt>' + T.incl + '</dt><dd>' + T.inclText + '</dd>' +
          '<dt>' + T.cancel + '</dt><dd>' + T.cancelText + '</dd>' +
          '<dt>' + T.price + '</dt><dd>' + yen(s.price) + ' ' + T.perPerson + '</dd>' +
        '</dl>' +
        '<div class="bk-total"><label>' + T.guests + ' <select>' + opts + '</select></label>' +
          '<div><span class="muted">' + T.total + '</span> <strong class="sum">' + yen(s.price * (s.minGuests || 1)) + '</strong></div></div>' +
        '<form class="bk-form" novalidate>' +
          '<h4>' + T.formTitle + '</h4>' +
          '<label class="fld"><span>' + T.name + ' <em class="req">' + T.required + '</em></span><input name="name" required maxlength="200" autocomplete="name"></label>' +
          '<label class="fld"><span>' + T.email + ' <em class="req">' + T.required + '</em></span><input name="email" type="email" required maxlength="254" autocomplete="email"></label>' +
          '<div class="fld-row">' +
            '<label class="fld"><span>' + T.country + '</span><input name="country" maxlength="100" autocomplete="country-name"></label>' +
            '<label class="fld"><span>' + T.phone + '</span><input name="phone" type="tel" maxlength="50" autocomplete="tel"></label>' +
          '</div>' +
          '<label class="fld"><span>' + T.message + '</span><textarea name="message" rows="2" maxlength="2000" placeholder="' + T.messageHint + '"></textarea></label>' +
          '<p class="muted bk-note">' + T.shareNote + '</p>' +
          '<label class="bk-agree"><input type="checkbox" name="agree"> <span>' + T.agree + ' <em class="req">' + T.required + '</em></span></label>' +
          '<p class="bk-error" role="alert" hidden></p>' +
          '<button type="submit" class="btn" disabled>' + T.book + '</button>' +
          '<p class="muted bk-note bk-need">' + T.needAll + '</p>' +
          '<p class="muted bk-note">' + T.payNote + '</p>' +
        '</form>' +
      '</div>';
    dlg.querySelector(".bk-close").onclick = function () { dlg.close(); };
    var sel = dlg.querySelector("select"), sum = dlg.querySelector(".sum");
    sel.onchange = function () { sum.textContent = yen(s.price * +sel.value); };
    var form = dlg.querySelector(".bk-form"), err = form.querySelector(".bk-error"), btn = form.querySelector("button[type=submit]");
    function showErr(msg) { err.textContent = msg; err.hidden = false; }
    var need = form.querySelector(".bk-need");
    function ready() {
      var f = form.elements;
      return !!f.name.value.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim()) && f.agree.checked;
    }
    function update() { var ok = ready(); btn.disabled = !ok; need.hidden = ok; }
    function reset() { update(); btn.textContent = T.book; }
    form.addEventListener("input", function () { err.hidden = true; });
    form.addEventListener("change", function () { err.hidden = true; });
    var agree = form.elements.agree;
    form.addEventListener("input", update);
    agree.addEventListener("change", update);
    form.onsubmit = function (e) {
      e.preventDefault();
      err.hidden = true;
      var f = form.elements;
      if (!f.name.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) { showErr(T.errors.invalid_input); return; }
      if (!f.agree.checked) { showErr(T.errors.terms_required); return; }
      var langEl = dlg.querySelector('input[name="bk-lang"]:checked');
      btn.disabled = true; btn.textContent = T.sending;
      sb("/functions/v1/create-checkout", {
        slot_id: s.id, guests: +sel.value, language: langEl ? langEl.value : LANG,
        name: f.name.value, email: f.email.value, country: f.country.value, phone: f.phone.value, message: f.message.value,
        agree: true, page_lang: LANG
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res.url) { location.href = res.url; return; }
          showErr(T.errors[res.error] || T.errors.error); reset();
        })
        .catch(function () { showErr(T.errors.error); reset(); });
    };
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  renderCal();
  renderList(false);
  if (focusSlot && !focusSlot.booked && (!only || focusSlot.a === only)) openDetail(focusSlot);
  // 2026-10-22 から本物の演奏家・日程になったので、「ダミーです」の注記は出さない
  }
})();
