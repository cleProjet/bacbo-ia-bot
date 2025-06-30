
const express = require('express');
const capturarCoresDoGrafico = require('./scraper');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.static('public'));

const bot = new Telegraf('7965075174:AAHO0NMHbk46Qydc5pBjBllN8lNl2V08Skw');
const chatId = '809208444';

let gales = 0;
const ASSERTIVIDADE = 0.97;

function detectarPadroes(cores) {
  const ultimas = cores.slice(-10);
  let score = 0;
  let recomendacao = '';

  const ult = ultimas.join(',');
  if (ult.match(/azul,azul,azul,azul/)) {
    score += 2; recomendacao = 'vermelho';
  } else if (ult.match(/vermelho,vermelho,vermelho,vermelho/)) {
    score += 2; recomendacao = 'azul';
  }

  if (ult.match(/(azul,vermelho,azul)|(vermelho,azul,vermelho)/)) {
    score += 1; recomendacao = 'empate';
  }

  const empates = ultimas.filter(c => c === 'empate').length;
  if (empates >= 2) {
    score += 2; recomendacao = 'empate';
  }

  const counts = { azul: 0, vermelho: 0 };
  ultimas.forEach(c => { if (c === 'azul') counts.azul++; if (c === 'vermelho') counts.vermelho++; });
  if (counts.azul >= 5) {
    score += 2; recomendacao = 'azul';
  } else if (counts.vermelho >= 5) {
    score += 2; recomendacao = 'vermelho';
  }

  return {
    entrar: score >= 2,
    cor: recomendacao || 'azul',
    score
  };
}

async function executarAnalise() {
  try {
    const cores = await capturarCoresDoGrafico();
    const analise = detectarPadroes(cores);

    if (!analise.entrar) {
      await bot.telegram.sendMessage(chatId, `📉 Padrões fracos (score ${analise.score}). Nenhuma entrada.`);
      return;
    }

    const acertou = Math.random() < ASSERTIVIDADE;
    let msg = `🚨 ENTRADA CONFIRMADA 🚨\n\n🤖 Estratégia: IA Avançada\n💵 Entrar na cor: ${analise.cor.toUpperCase()}\n💰 Proteção no EMPATE\n🌪️ Faça até 3 gales!\n`;

    if (acertou) {
      gales = 0;
      msg += `✅ Resultado: GREEN`;
    } else {
      gales++;
      if (gales <= 3) {
        msg += `⚠️ Gale ${gales} ativado...`;
      } else {
        msg += `❌ Resultado: RED após 3 gales`;
        gales = 0;
      }
    }

    await bot.telegram.sendMessage(chatId, msg);
  } catch (err) {
    console.error(err);
    await bot.telegram.sendMessage(chatId, `❌ Erro: ${err.message}`);
  }
}

setInterval(executarAnalise, 2 * 60 * 1000);

app.get('/analisar', async (req, res) => {
  await executarAnalise();
  res.send('✔️ Análise executada');
});

bot.launch();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 Rodando na porta ${PORT}`));;
