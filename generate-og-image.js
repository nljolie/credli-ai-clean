const puppeteer = require('puppeteer');
const path = require('path');

async function generateOGImage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to Open Graph image size
  await page.setViewport({ width: 1200, height: 630 });
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'public', 'og-image.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for any fonts to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(__dirname, 'public', 'og-image.png'),
    width: 1200,
    height: 630
  });
  
  await browser.close();
  console.log('✅ Open Graph image generated successfully!');
}

generateOGImage().catch(console.error);