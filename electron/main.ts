import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LIBRARY_FILE = () => path.join(app.getPath('userData'), 'library.json')

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 940,
    minHeight: 620,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#F6F0E4',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    win.loadURL(devUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('library:read', async (): Promise<string | null> => {
  try {
    return await fs.readFile(LIBRARY_FILE(), 'utf8')
  } catch {
    return null
  }
})

ipcMain.handle('library:write', async (_e, data: string): Promise<boolean> => {
  try {
    await fs.mkdir(path.dirname(LIBRARY_FILE()), { recursive: true })
    await fs.writeFile(LIBRARY_FILE(), data, 'utf8')
    return true
  } catch {
    return false
  }
})

ipcMain.handle('dialog:openAudio', async (): Promise<string | null> => {
  if (!win) return null
  const res = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'ogg', 'flac'] }],
  })
  if (res.canceled || !res.filePaths[0]) return null
  return 'file://' + res.filePaths[0]
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
