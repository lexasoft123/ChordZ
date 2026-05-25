import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('chordz', {
  platform: 'electron' as const,
  os: process.platform,
  loadLibrary: (): Promise<string | null> => ipcRenderer.invoke('library:read'),
  saveLibrary: (data: string): Promise<boolean> => ipcRenderer.invoke('library:write', data),
  openAudioFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:openAudio'),
})
