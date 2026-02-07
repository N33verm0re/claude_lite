const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SIZES = {
  screenshots: { width: 1280, height: 800, dir: 'store-assets/screenshots-1280x800' },
  screenshots_small: { width: 640, height: 400, dir: 'store-assets/screenshots-640x400' },
  promo_small: { width: 440, height: 280, dir: 'store-assets/promo-small-440x280' },
  promo_large: { width: 1400, height: 560, dir: 'store-assets/promo-large-1400x560' }
};

const SLIDES = [
  { id: 1, name: 'hero' },
  { id: 2, name: 'in-action' },
  { id: 3, name: 'before-after' },
  { id: 4, name: 'features' },
  { id: 5, name: 'languages' }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  // Create directories
  Object.values(SIZES).forEach(s => {
    fs.mkdirSync(s.dir, { recursive: true });
  });
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const htmlPath = `file://${path.resolve(__dirname, 'screenshots.html')}`;
  
  // Generate screenshots for each size
  for (const [sizeKey, sizeConfig] of Object.entries(SIZES)) {
    console.log(`\n📐 Generating ${sizeKey} (${sizeConfig.width}x${sizeConfig.height})...`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: sizeConfig.width, height: sizeConfig.height });
    
    for (const slide of SLIDES) {
      await page.goto(htmlPath);
      
      // Activate slide and resize content
      await page.evaluate((slideNum, w, h) => {
        document.querySelectorAll('.screenshot').forEach(s => {
          s.classList.remove('active');
          s.style.width = w + 'px';
          s.style.height = h + 'px';
        });
        const el = document.getElementById('s' + slideNum);
        if (el) el.classList.add('active');
      }, slide.id, sizeConfig.width, sizeConfig.height);
      
      await sleep(300);
      
      const filename = `${sizeConfig.dir}/${slide.id}-${slide.name}.png`;
      await page.screenshot({
        path: filename,
        clip: { x: 0, y: 0, width: sizeConfig.width, height: sizeConfig.height }
      });
      
      console.log(`  ✅ ${filename}`);
    }
    
    await page.close();
  }
  
  await browser.close();
  
  // Create README
  fs.writeFileSync('store-assets/README.txt', `
CHROME WEB STORE ASSETS
=======================

📁 screenshots-1280x800/
   Main screenshots (upload up to 5)
   Format: 1280x800 PNG
   
📁 screenshots-640x400/
   Alternative smaller screenshots
   Format: 640x400 PNG

📁 promo-small-440x280/
   Small promotional tile
   Format: 440x280 PNG
   Use: 1-hero.png recommended

📁 promo-large-1400x560/
   Large promotional banner (marquee)
   Format: 1400x560 PNG
   Use: 1-hero.png or 3-before-after.png recommended

FILES:
1-hero.png        - Main branding with popup preview
2-in-action.png   - Extension working on Claude.ai
3-before-after.png - Memory comparison (2.4GB vs 285MB)
4-features.png    - Feature cards overview
5-languages.png   - 9 supported languages
`);

  console.log('\n🎉 All assets generated in store-assets/');
  console.log('📄 See store-assets/README.txt for upload guide');
})();
