const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  const file = path.resolve(__dirname, '..', 'index.html');
  await page.goto('file://' + file);
  // wait a moment for animations
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.resolve(__dirname, 'screenshot.png'), fullPage: true });
  console.log('screenshot saved to tests/screenshot.png');
  await browser.close();
})();
