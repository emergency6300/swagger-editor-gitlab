const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');
let win;

const template = [{
  label: "Application",
  submenu: [
    {label: "About Swagger Editor", selector: "orderFrontStandardAboutPanel:"},
    {type: "separator"},
    {
      label: "Quit", accelerator: "Command+Q", click: function() {
        app.quit();
      }
    }
  ]
}, {
  label: "Edit",
  submenu: [
    {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
    {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
    {type: "separator"},
    {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
    {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
    {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
    {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
  ]
}
];

const createWindow = function() {
  win = new BrowserWindow({
    useContentSize: true
  });
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  win.on('closed', () => {
    win = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

