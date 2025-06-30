
const puppeteer = require('puppeteer');

async function capturarCoresDoGrafico() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://betify1.co/pt/play/149677-bac-bo', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.scoreboard-history__items');

  const cores = await page.evaluate(() => {
    const bolas = document.querySelectorAll('.scoreboard-history__items .scoreboard-history__item');
    return Array.from(bolas).map(el => {
      if (el.classList.contains('scoreboard-history__item--player')) return 'azul';
      if (el.classList.contains('scoreboard-history__item--banker')) return 'vermelho';
      if (el.classList.contains('scoreboard-history__item--tie')) return 'empate';
      return 'desconhecido';
    });
  });

  await browser.close();
  return cores;
}

module.exports = capturarCoresDoGrafico;
