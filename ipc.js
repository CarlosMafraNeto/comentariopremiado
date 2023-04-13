const puppeteer = require('puppeteer');
const login = require('./modules/login.js');
const goToPost = require('./modules/goToPost.js');
const comment = require('./modules/comment');
const os = require('os');
const { spawn } = require('child_process');
const userInfo = os.userInfo();
const username = userInfo.username;


module.exports = (ipc, window) => {
  ipc.on("start", async (event, config, messages) => {
    try {
      window.webContents.send("starting");

      const browser = await puppeteer.launch({
        executablePath: `C:\\Users\\${username}\\AppData\\Local\\Chromium\\Application\\chrome.exe`, // Substitua pelo caminho do executável do Chrome na sua máquina
        headless: false,
        defaultViewport: null
      });

      const page = (await browser.pages())[0];

      window.webContents.send("wait_auth");
      await login(page);

      window.webContents.send("logged");
      await goToPost(page, config.url);

      window.webContents.send("loaded");
      await comment(page, messages, config.max_comments, config.delay, (args) => {
        window.webContents.send("message-sended", args);
      });

      page.close();
      window.webContents.send("finished");
    } catch (error) {
      window.webContents.send("error", error.toString());
    }
  });
}