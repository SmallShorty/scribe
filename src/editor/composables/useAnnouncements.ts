import { ref } from 'vue'

export interface Announcement {
  id: string
  title: string
  body: string
}

// Update these to your actual URLs before shipping
export const GITHUB_CHANGELOG_URL =
  'https://raw.githubusercontent.com/YOUR_USERNAME/scribe/main/announcements/changelog.json'
export const NEWS_ENDPOINT_URL = 'https://your-server.com/api/scribe/news'

const SEEN_KEY = 'scribe:seen-announcements'

function getSeenIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

async function fetchAnnouncement(url: string): Promise<Announcement | null> {
  try {
    const r = await fetch(url, { cache: 'no-cache' })
    if (!r.ok) return null
    return (await r.json()) as Announcement
  } catch {
    return null
  }
}

export function useAnnouncements() {
  const pending = ref<Announcement[]>([])

  async function load() {
    const [changelog, news] = await Promise.all([
      fetchAnnouncement(GITHUB_CHANGELOG_URL),
      fetchAnnouncement(NEWS_ENDPOINT_URL),
    ])

    const seen = getSeenIds()
    pending.value = [changelog, news].filter(
      (a): a is Announcement => a !== null && !seen.has(a.id),
    )
  }

  function dismiss() {
    const ids = pending.value.map(a => a.id)
    const seen = getSeenIds()
    ids.forEach(id => seen.add(id))
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
    pending.value = []
  }

  return { pending, load, dismiss }
}
