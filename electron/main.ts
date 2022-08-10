import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { Config, process as engine} from './process';
import * as path from 'path';
var win: BrowserWindow;
const createWindow = () => {
   win = new BrowserWindow({
      width: 1200,
      height: 600,
      webPreferences: {
         preload: path.join(__dirname, 'preload.js'),
         devTools:false
      }
   });

   win.loadFile(path.join(__dirname, '../destination/index.html'));
   // win.webContents.openDevTools();
}


app.whenReady().then(() => {
   createWindow()

   app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
   })
})

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('selectDirectory', async () => {
   const dir = await dialog.showOpenDialog(win, {
      title: 'Select a Directory',
      properties: ['openDirectory']
   });
   if (dir.canceled === false) {
      return dir.filePaths[0];
   }
   return undefined;
})

ipcMain.handle('filesSplitter', async (e, config: Config) => {
   try {
      return { success: true, message: (await engine(config)) }
   } catch (e) {
      return { success: false, message: e };
   }
   
})