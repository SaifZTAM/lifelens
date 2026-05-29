// Content script — injects nudge overlay when triggered via chrome.runtime.sendMessage

function createNudgeOverlay(message: string) {
  const existing = document.getElementById('lifelens-nudge')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.id = 'lifelens-nudge'
  overlay.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    background: #111113;
    border: 1px solid #27272a;
    border-radius: 12px;
    padding: 16px 20px;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: lifelens-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `

  const style = document.createElement('style')
  style.textContent = `
    @keyframes lifelens-slide-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(style)

  const header = document.createElement('div')
  header.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;'

  const label = document.createElement('span')
  label.textContent = 'LifeLens'
  label.style.cssText = 'font-size:11px; font-weight:600; color:#14b8a6; letter-spacing:0.02em;'

  const close = document.createElement('button')
  close.textContent = '×'
  close.style.cssText = 'background:none; border:none; cursor:pointer; font-size:16px; color:#71717a; line-height:1; padding:0;'
  close.onclick = () => overlay.remove()

  header.appendChild(label)
  header.appendChild(close)

  const text = document.createElement('p')
  text.textContent = message
  text.style.cssText = 'font-size:13px; color:#fafafa; line-height:1.5; margin:0;'

  overlay.appendChild(header)
  overlay.appendChild(text)
  document.body.appendChild(overlay)

  // Auto-dismiss after 12 seconds
  setTimeout(() => overlay?.remove(), 12000)
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SHOW_NUDGE' && msg.message) {
    createNudgeOverlay(msg.message)
  }
})
