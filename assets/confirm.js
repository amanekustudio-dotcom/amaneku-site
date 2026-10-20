// 予約確認ページ（confirm.html?t=<予約ごとの合言葉>）
// Stripe で支払った後にここへ戻ってくる。支払いの確認（webhook）が少し遅れることがあるので、確定するまで数回読み直す。
(function () {
  var LANG = document.documentElement.lang === "ja" ? "ja" : "en";
  // anon（公開用）の鍵。合言葉を知っている予約の内容しか読めない（booking.js と同じ値）
  var SUPABASE_URL = "https://enoiaitbavewiusniakv.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2lhaXRiYXZld2l1c25pYWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NjQ1OTEsImV4cCI6MjEwODA0MDU5MX0._7AKNLPYlJF07OljkDuGnpaGzaNeQOh64putvoms-uw";

  var T = {
    ja: {
      checking: "お支払いを確認しています…",
      slow: "お支払いの確認に時間がかかっています。数分後にこのページを開き直してください。",
      notFound: "予約が見つかりませんでした。URLをご確認ください。",
      error: "読み込めませんでした。時間をおいて、もう一度開いてください。",
      confirmed: "ご予約が確定しました",
      thanks: function (n) { return n + " 様、ご予約ありがとうございます。神戸でお待ちしています。"; },
      expired: "このご予約は、お支払いが完了しなかったため取り消されました。",
      cancelled: "このご予約は取り消されています。",
      again: "日程を選び直す",
      ref: "予約番号", when: "日時", artist: "演奏家", guests: "人数", lang: "言語", paid: "お支払い",
      where: "会場", map: "地図を開く", how: "行き方",
      guestN: function (n) { return n + "名"; }, langName: { ja: "日本語", en: "英語" },
      keep: '予約の内容と会場の情報は、いつでもこのページで確認できます。URLをなくしても、予約番号とメールアドレスがあれば、<a href="lookup.html">予約の確認</a>から開けます。',
      cancelInfo: '<a href="legal.html#cancel">キャンセル規定</a>　ご変更・キャンセルは、予約番号を添えてご連絡ください。',
      date: function (d) { return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(d); }
    },
    en: {
      checking: "Confirming your payment…",
      slow: "Confirming your payment is taking longer than usual. Please reopen this page in a few minutes.",
      notFound: "We couldn't find this booking. Please check the link.",
      error: "We couldn't load this page. Please try again in a moment.",
      confirmed: "Your booking is confirmed",
      thanks: function (n) { return "Thank you, " + n + ". We look forward to seeing you in Kobe."; },
      expired: "This booking was released because payment wasn't completed.",
      cancelled: "This booking has been cancelled.",
      again: "Choose a date again",
      ref: "Booking number", when: "Date", artist: "Artist", guests: "Guests", lang: "Language", paid: "Paid",
      where: "Venue", map: "Open map", how: "Getting there",
      guestN: function (n) { return n + (n === 1 ? " guest" : " guests"); }, langName: { ja: "Japanese", en: "English" },
      keep: 'You can check your booking and the venue details on this page at any time. If you lose the link, use <a href="lookup.html">Find your booking</a> with your booking number and email.',
      cancelInfo: '<a href="legal.html#cancel">Cancellation policy</a>. To change or cancel, contact us with your booking number.',
      date: function (d) { return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d) + " (Japan time)"; }
    }
  }[LANG];

  var root = document.getElementById("confirm-app");
  if (!root) return;
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function yen(n) { return "¥" + Number(n).toLocaleString("en-US"); }
  function say(msg) { root.innerHTML = '<p class="muted cf-status">' + msg + "</p>"; }

  var m = /[?&]t=([0-9a-f-]{36})/i.exec(location.search);
  if (!m) { say(T.notFound); return; }
  var token = m[1], tries = 0;
  say(T.checking);

  function load() {
    fetch(SUPABASE_URL + "/rest/v1/rpc/get_booking_by_token", {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: token })
    })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (rows) {
        var b = rows[0];
        if (!b) { say(T.notFound); return; }
        if (b.status === "pending") {
          if (++tries < 15) { setTimeout(load, 2000); } else { say(T.slow); }
          return;
        }
        if (b.status !== "confirmed") {
          root.innerHTML = '<p class="cf-status">' + (b.status === "expired" ? T.expired : T.cancelled) + '</p><p><a class="btn" href="booking.html#dates">' + T.again + "</a></p>";
          return;
        }
        render(b);
      })
      .catch(function () { say(T.error); });
  }

  function render(b) {
    var L = LANG;
    var venue = esc(L === "ja" ? b.area_ja : b.area_en);
    var access = esc(L === "ja" ? b.access_ja : b.access_en);
    var how = esc(L === "ja" ? b.directions_ja : b.directions_en);
    root.innerHTML =
      '<h2 class="cf-title">' + T.confirmed + "</h2>" +
      "<p>" + esc(T.thanks(b.customer_name)) + "</p>" +
      '<dl class="legal-table cf-table">' +
        "<dt>" + T.ref + '</dt><dd class="cf-ref">' + esc(b.reference) + "</dd>" +
        "<dt>" + T.when + "</dt><dd>" + esc(T.date(new Date(b.starts_at))) + "</dd>" +
        "<dt>" + T.artist + "</dt><dd>" + esc(L === "ja" ? b.artist_name_ja : b.artist_name_en) + "</dd>" +
        "<dt>" + T.guests + "</dt><dd>" + esc(T.guestN(b.guest_count)) + "</dd>" +
        "<dt>" + T.lang + "</dt><dd>" + esc(T.langName[b.language] || b.language) + "</dd>" +
        "<dt>" + T.paid + "</dt><dd>" + yen(b.amount_jpy) + "</dd>" +
        "<dt>" + T.where + "</dt><dd>" + venue + (access ? "<br><small class=\"muted\">" + access + "</small>" : "") +
          (b.address ? "<br>" + esc(b.address) : "") +
          (b.map_url && /^https:\/\//.test(b.map_url) ? '<br><a href="' + esc(b.map_url) + '" target="_blank" rel="noopener">' + T.map + " →</a>" : "") + "</dd>" +
        (how ? "<dt>" + T.how + "</dt><dd>" + how.replace(/\n/g, "<br>") + "</dd>" : "") +
      "</dl>" +
      '<p class="cf-keep">' + T.keep + "</p>" +
      '<p class="muted">' + T.cancelInfo + "</p>";
  }

  load();
})();
