// 「予約を確認する」ページ：予約番号とメールアドレスから、予約確認ページ（confirm.html?t=…）へ案内する
(function () {
  var LANG = document.documentElement.lang === "ja" ? "ja" : "en";
  // anon（公開用）の鍵（booking.js と同じ値）
  var SUPABASE_URL = "https://enoiaitbavewiusniakv.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2lhaXRiYXZld2l1c25pYWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NjQ1OTEsImV4cCI6MjEwODA0MDU5MX0._7AKNLPYlJF07OljkDuGnpaGzaNeQOh64putvoms-uw";
  var T = {
    ja: {
      searching: "探しています…", submit: "予約を確認する",
      invalid: "予約番号とメールアドレスを入力してください。",
      not_found: "予約が見つかりませんでした。予約番号と、予約のときに入力したメールアドレスをご確認ください。",
      too_many_attempts: "確認の回数が上限に達しました。1時間ほどたってから、もう一度お試しください。",
      error: "うまくいきませんでした。時間をおいて、もう一度お試しください。"
    },
    en: {
      searching: "Searching…", submit: "Find my booking",
      invalid: "Please enter your booking number and email.",
      not_found: "We couldn't find that booking. Please check the booking number and the email you used when booking.",
      too_many_attempts: "Too many attempts. Please try again in about an hour.",
      error: "Something went wrong. Please try again in a moment."
    }
  }[LANG];

  var form = document.getElementById("lookup-form");
  if (!form) return;
  var err = form.querySelector(".bk-error"), btn = form.querySelector("button[type=submit]");
  function fail(msg) { err.textContent = msg; err.hidden = false; btn.disabled = false; btn.textContent = T.submit; }
  form.addEventListener("input", function () { err.hidden = true; });
  form.onsubmit = function (e) {
    e.preventDefault();
    var ref = form.elements.reference.value.replace(/\s+/g, ""), email = form.elements.email.value.trim();
    if (!ref || !email) { fail(T.invalid); return; }
    err.hidden = true; btn.disabled = true; btn.textContent = T.searching;
    fetch(SUPABASE_URL + "/functions/v1/find-booking", {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref, email: email })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (res.token) { location.href = "confirm.html?t=" + encodeURIComponent(res.token); return; }
        fail(T[res.error] || (res.error === "invalid_input" ? T.invalid : T.error));
      })
      .catch(function () { fail(T.error); });
  };
})();
