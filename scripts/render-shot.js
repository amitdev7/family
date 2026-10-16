const puppeteer = require('puppeteer-core');
const path = require('path');

async function renderFile(htmlFileName, outputPngName) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });
  const htmlPath = 'file:///' + path.resolve('scripts', htmlFileName).replace(/\\/g, '/');
  console.log('Rendering:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const outPath = path.resolve('public', 'previews', outputPngName);
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('SUCCESS:', outPath);
}

async function main() {
  await renderFile('render-invoices-exact.html', 'dashboard-exact-reference-match.png');
  await renderFile('render-family-exact.html', 'family-dashboard-exact-match.png');
}

main().catch(console.error);
