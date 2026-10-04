/**
 * Platform-agnostic bridge. The renderer ONLY uses this module to touch
 * native capabilities. On Electron, `window.chordz` is injected by preload.
 * On web/mobile, a local fallback is used. This keeps the React tree
 * portable when we later wrap the app for iOS/Android.
 */

import type { WindowControlsApi } from '@singz/ui'

export type Platform = 'electron' | 'web' | 'mobile'

export interface Bridge {
  platform: Platform
  os: string
  loadLibrary(): Promise<string | null>
  saveLibrary(data: string): Promise<boolean>
  openAudioFile(): Promise<string | null>
  /** Frameless-window chrome. Absent on the web, and on macOS the window
   *  keeps its native traffic lights, so the kit's buttons stay unmounted. */
  windowControls?: WindowControlsApi
}

const STORAGE_KEY = 'chordz:library'

const webFallback: Bridge = {
  platform: 'web',
  os: typeof navigator !== 'undefined' ? navigator.platform : 'web',
  async loadLibrary() {
    return localStorage.getItem(STORAGE_KEY)
  },
  async saveLibrary(data) {
    try {
      localStorage.setItem(STORAGE_KEY, data)
      return true
    } catch {
      return false
    }
  },
  async openAudioFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'audio/*'
      input.onchange = () => {
        const f = input.files?.[0]
        if (!f) return resolve(null)
        resolve(URL.createObjectURL(f))
      }
      input.oncancel = () => resolve(null)
      input.click()
    })
  },
}

declare global {
  interface Window {
    chordz?: Bridge
  }
}

export const bridge: Bridge =
  typeof window !== 'undefined' && window.chordz ? window.chordz : webFallback
