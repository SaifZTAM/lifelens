"use strict";
(() => {
  // extension/popup.ts
  var API_BASE = "http://localhost:3000";
  async function init() {
    const { lifelens_token } = await chrome.storage.local.get("lifelens_token");
    const mainSection = document.getElementById("main-section");
    const loginSection = document.getElementById("login-section");
    const statusBadge = document.getElementById("status-badge");
    if (lifelens_token) {
      mainSection.style.display = "block";
      loginSection.style.display = "none";
      document.getElementById("open-dashboard").addEventListener("click", () => {
        chrome.tabs.create({ url: `${API_BASE}/dashboard` });
      });
      document.getElementById("sign-out").addEventListener("click", async () => {
        await chrome.storage.local.remove("lifelens_token");
        window.location.reload();
      });
    } else {
      mainSection.style.display = "none";
      loginSection.style.display = "block";
      statusBadge.textContent = "Inactive";
      statusBadge.classList.add("off");
      document.getElementById("sign-in").addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorEl = document.getElementById("error");
        const res = await fetch(`${API_BASE}/api/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
          errorEl.textContent = "Invalid email or password.";
          return;
        }
        const { access_token } = await res.json();
        await chrome.storage.local.set({ lifelens_token: access_token });
        window.location.reload();
      });
    }
  }
  init();
})();
