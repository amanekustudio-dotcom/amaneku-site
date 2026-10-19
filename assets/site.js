// 言語ボタンで選んだ言語を覚える（英語版の自動切り替えで使う）
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a.lang");
  if (!a) return;
  try { localStorage.setItem("amaneku-lang", a.getAttribute("hreflang")); } catch (err) {}
  // 絞り込み（?artist=）や位置（#dates）を保ったまま切り替える
  if (location.search || location.hash) { e.preventDefault(); location.href = a.getAttribute("href").split(/[?#]/)[0] + location.search + location.hash; }
});

// 未定メモの表示切り替え（運営用）。公開前にこのボタンは外す。
(function () {
  var KEY = "amaneku-show-tbd";
  var root = document.documentElement;
  try { if (localStorage.getItem(KEY) === "1") root.classList.add("show-tbd"); } catch (e) {}

  var btn = document.createElement("button");
  btn.className = "tbd-toggle";
  btn.type = "button";
  function label() {
    var on = root.classList.contains("show-tbd");
    var n = document.querySelectorAll(".tbd").length;
    btn.textContent = on ? "未定メモを隠す" : "未定メモを表示（" + n + "）";
  }
  btn.addEventListener("click", function () {
    root.classList.toggle("show-tbd");
    try { localStorage.setItem(KEY, root.classList.contains("show-tbd") ? "1" : "0"); } catch (e) {}
    label();
  });
  document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(btn); label(); });
})();
