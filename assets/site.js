// 言語ボタンで選んだ言語を覚える（英語版の自動切り替えで使う）
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a.lang");
  if (!a) return;
  try { localStorage.setItem("amaneku-lang", a.getAttribute("hreflang")); } catch (err) {}
  // 絞り込み（?artist=）や位置（#dates）を保ったまま切り替える
  if (location.search || location.hash) { e.preventDefault(); location.href = a.getAttribute("href").split(/[?#]/)[0] + location.search + location.hash; }
});
