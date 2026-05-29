// Service worker — tracks active tab, batches events, sends to backend

const API_BASE = 'http://localhost:3000'
const BATCH_INTERVAL_SECONDS = 30
const NUDGE_CHECK_INTERVAL_SECONDS = 120

type EventBatch = {
  timestamp: string
  domain: string
  duration_sec: number
  activity_type: 'active' | 'idle' | 'switching'
  tab_switches: number
}

let activeTabId: number | null = null
let activeStart: number = Date.now()
let tabSwitchCount = 0
let eventQueue: EventBatch[] = []
let authToken: string | null = null

// Load auth token from storage
chrome.storage.local.get(['lifelens_token'], (result) => {
  authToken = result.lifelens_token ?? null
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.lifelens_token) {
    authToken = changes.lifelens_token.newValue ?? null
  }
})

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

function flushActiveTab() {
  if (activeTabId === null) return
  chrome.tabs.get(activeTabId, (tab) => {
    if (chrome.runtime.lastError || !tab?.url) return
    const domain = getDomain(tab.url)
    if (!domain || domain === 'newtab' || domain === 'unknown') return

    const duration = Math.round((Date.now() - activeStart) / 1000)
    if (duration < 2) return

    eventQueue.push({
      timestamp: new Date().toISOString(),
      domain,
      duration_sec: duration,
      activity_type: 'active',
      tab_switches: tabSwitchCount,
    })

    tabSwitchCount = 0
    activeStart = Date.now()
  })
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  flushActiveTab()
  activeTabId = tabId
  activeStart = Date.now()
  tabSwitchCount += 1
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' && tabId === activeTabId) {
    flushActiveTab()
    activeStart = Date.now()
  }
})

async function sendEvents() {
  if (!authToken || eventQueue.length === 0) return
  const batch = [...eventQueue]
  eventQueue = []

  try {
    const res = await fetch(`${API_BASE}/api/events/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ events: batch }),
    })
    if (!res.ok) {
      // Put events back on failure
      eventQueue = [...batch, ...eventQueue]
    }
  } catch {
    eventQueue = [...batch, ...eventQueue]
  }
}

async function checkForNudge() {
  if (!authToken) return

  try {
    const res = await fetch(`${API_BASE}/api/nudges/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!res.ok) return

    const data = await res.json()
    if (data.nudge) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'LifeLens',
        message: data.nudge.message,
        priority: 1,
      })
    }
  } catch {
    // silently ignore network errors
  }
}

// Set up alarms
chrome.alarms.create('sendEvents', { periodInMinutes: BATCH_INTERVAL_SECONDS / 60 })
chrome.alarms.create('checkNudge', { periodInMinutes: NUDGE_CHECK_INTERVAL_SECONDS / 60 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sendEvents') {
    flushActiveTab()
    sendEvents()
  }
  if (alarm.name === 'checkNudge') {
    checkForNudge()
  }
})
