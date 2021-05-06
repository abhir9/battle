const puppeteer = require('puppeteer');
const one = "http://idweb.direct";
const two ='https://whites-foodequip.co.uk';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(two);
  await page.screenshot({ path: 'pic2.png' });
  await page.goto(one);
  await page.screenshot({ path: 'pic1.png' });
console.log("done");
  await browser.close();
})();