import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('chordz', {
  platform: 'electron' as const,
  os: process.platform,
  loadLibrary: (): Promise<string | null> => ipcRenderer.invoke('library:read'),
  saveLibrary: (data: string): Promise<boolean> => ipcRenderer.invoke('library:write', data),
  openAudioFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:openAudio'),
  windowControls: {
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('win:isMaximized'),
    onMaximized: (cb: (v: boolean) => void): (() => void) => {
      const handler = (_e: unknown, v: boolean): void => cb(v)
      ipcRenderer.on('win:maximized', handler)
      return () => ipcRenderer.off('win:maximized', handler)
    },
    minimize: (): void => ipcRenderer.send('win:minimize'),
    maximizeToggle: (): void => ipcRenderer.send('win:maximizeToggle'),
    close: (): void => ipcRenderer.send('win:close'),
  },
})
