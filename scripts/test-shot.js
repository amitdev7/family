const puppeteer = require('puppeteer-core');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
  await page.setContent('<body style="background:#eef3f8;font-family:sans-serif;padding:40px;"><h1>Puppeteer Test</h1></body>');
  const outPath = path.resolve('public', 'previews', 'puppeteer-test.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('SUCCESS:', outPath);
}

run().catch(console.error);
