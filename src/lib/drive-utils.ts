export function extractDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null

  // If it doesn't contain a slash and looks like a typical drive ID (25+ chars)
  if (!urlOrId.includes('/') && urlOrId.length > 20) {
    return urlOrId
  }

  // Match /file/d/ID/
  const fileDMatch = urlOrId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1]
  }

  // Match ?id=ID
  const idParamMatch = urlOrId.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1]
  }

  // Match /folders/ID just in case
  const folderMatch = urlOrId.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1]
  }

  return null
}

export function getDriveEmbedUrl(idOrUrl: string): string | null {
  const id = extractDriveId(idOrUrl)
  if (!id) return null
  return `https://drive.google.com/file/d/${id}/preview`
}

export function getDriveViewUrl(idOrUrl: string): string | null {
  const id = extractDriveId(idOrUrl)
  if (!id) return null
  return `https://drive.google.com/file/d/${id}/view`
}

export function getDriveThumbnailUrl(idOrUrl: string, size = 'w1280'): string | null {
  const id = extractDriveId(idOrUrl)
  if (!id) return null
  return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`
}

export function formatDuration(seconds: number | undefined | null): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00'
  }

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const pad = (num: number) => num.toString().padStart(2, '0')

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }
  return `${pad(m)}:${pad(s)}`
}
