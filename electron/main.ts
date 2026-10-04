import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LIBRARY_FILE = () => path.join(app.getPath('userData'), 'library.json')

let win: BrowserWindow | null = null

const isWin = process.platform === 'win32'

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 940,
    minHeight: 620,
    // Windows draws its own chrome (the kit's WindowButtons) because the
    // native Win10 frame is square and would clip the app's rounded corner;
    // macOS keeps the traffic lights, inset into our 52px titlebar.
    frame: !isWin,
    titleBarStyle: isWin ? 'default' : 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#12100d',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  // Mirrors the maximized state to the renderer so the kit's window
  // buttons can flip Maximize <-> Restore, and its chrome CSS can flatten
  // the app's rounded corner when it fills the screen.
  win.on('maximize', () => win?.webContents.send('win:maximized', true))
  win.on('unmaximize', () => win?.webContents.send('win:maximized', false))

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
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
})

// Serialize writes and replace the file atomically so older saves cannot
// finish last and an interrupted write cannot truncate the library.
let libraryWrite: Promise<boolean> = Promise.resolve(true)
ipcMain.handle('library:write', (_e, data: string): Promise<boolean> => {
  libraryWrite = libraryWrite.then(async () => {
    try {
      const file = LIBRARY_FILE()
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file + '.tmp', data, 'utf8')
      await fs.rename(file + '.tmp', file)
      return true
    } catch {
      return false
    }
  })
  return libraryWrite
})

ipcMain.handle('win:isMaximized', (): boolean => win?.isMaximized() ?? false)
ipcMain.on('win:minimize', () => win?.minimize())
ipcMain.on('win:maximizeToggle', () => {
  if (!win) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
})
ipcMain.on('win:close', () => win?.close())

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
