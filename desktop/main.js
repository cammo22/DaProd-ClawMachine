// DaProd Claw Machine per Windows e Mac: il gioco web in una finestra Electron.
// I file stanno in "www" e vengono serviti dal protocollo app:// (i moduli JavaScript non si
// caricano da file://); il salvataggio resta nel localStorage dell'origine app://gioco.
const { app, BrowserWindow, protocol, net, Menu, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);
const WWW = path.join(__dirname, 'www');

function creaFinestra() {
  const w = new BrowserWindow({
    width: 1280, height: 860, minWidth: 480, minHeight: 600,
    backgroundColor: '#07060d', title: 'DaProd Claw Machine', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  w.loadURL('app://gioco/index.html');
  // link esterni nel browser, non dentro il gioco
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  w.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); shell.openExternal(url); } });
  // F11 = schermo intero
  w.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { w.setFullScreen(!w.isFullScreen()); e.preventDefault(); }
  });
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p === '/' || p === '') p = '/index.html';
    const f = path.normalize(path.join(WWW, p));
    if (!f.startsWith(WWW)) return new Response('no', { status: 404 });
    return net.fetch(pathToFileURL(f).toString());
  });
  Menu.setApplicationMenu(null);
  creaFinestra();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) creaFinestra(); });
});
app.on('window-all-closed', () => app.quit());
