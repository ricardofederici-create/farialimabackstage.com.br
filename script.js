// =============================================================
// Faria Lima Backstage — script.js
// Inclui: menu, smooth scroll, header shadow, ticker financeiro
// com dados REAIS via APIs públicas gratuitas.
// =============================================================

(function() {
  'use strict';

  // ------- Menu mobile -------
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // ------- Smooth scroll -------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ------- Sombra no header ao rolar -------
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // ------- Console egg -------
  console.log('%cFARIA LIMA / BACKSTAGE', 'font-family: Georgia, serif; font-size: 28px; color: #FAC775;');
  console.log('%cAnálise e contexto do mercado financeiro brasileiro.', 'color: #aaa;');
  console.log('%cContato: contato@farialimabackstage.com.br', 'color: #aaa;');

  // =============================================================
  // TICKER DE COTAÇÕES — DADOS REAIS
  // =============================================================
  // Fontes:
  // - AwesomeAPI (https://docs.awesomeapi.com.br/api-de-moedas) — câmbio + cripto, grátis, sem token
  // - brapi.dev (https://brapi.dev) — ações BR e IBOV, grátis sem token p/ ativos básicos
  // - Banco Central via AwesomeAPI ou hardcoded fallback (SELIC muda raramente)
  // =============================================================

  const formatBRL = (n, casas = 2) =>
    Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

  const formatPct = (n) => {
    const num = Number(n);
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const classForPct = (n) => {
    const num = Number(n);
    if (num > 0.001) return 'up';
    if (num < -0.001) return 'down';
    return 'flat';
  };

  // Monta um <span class="ticker"> com a estrutura visual padrão
  function makeTickerItem(label, value, pct) {
    const cls = pct === null ? 'flat' : classForPct(pct);
    const pctText = pct === null ? '—' : formatPct(pct);
    const span = document.createElement('span');
    span.className = 'ticker';
    span.innerHTML = `<strong>${label}</strong> ${value} <em class="${cls}">${pctText}</em>`;
    return span;
  }

  // Renderiza o ticker (com duplicação pro loop infinito do CSS)
  function renderTicker(items) {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    track.innerHTML = '';
    // Duplica os itens pra criar efeito de loop contínuo
    const all = [...items, ...items];
    all.forEach(it => track.appendChild(it.cloneNode(true)));
  }

  // ------- Coleta dados das APIs -------
  async function fetchMarketData() {
    const items = [];

    // 1) Câmbio + algumas cripto via AwesomeAPI (1 request só)
    try {
      const r = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-USD,ETH-USD');
      if (r.ok) {
        const data = await r.json();

        if (data.USDBRL) {
          items.push(makeTickerItem(
            'USD/BRL',
            'R$ ' + formatBRL(parseFloat(data.USDBRL.bid)),
            parseFloat(data.USDBRL.pctChange)
          ));
        }
        if (data.EURBRL) {
          items.push(makeTickerItem(
            'EUR/BRL',
            'R$ ' + formatBRL(parseFloat(data.EURBRL.bid)),
            parseFloat(data.EURBRL.pctChange)
          ));
        }
        if (data.BTCUSD) {
          items.push(makeTickerItem(
            'BTC',
            'US$ ' + formatBRL(parseFloat(data.BTCUSD.bid), 0),
            parseFloat(data.BTCUSD.pctChange)
          ));
        }
        if (data.ETHUSD) {
          items.push(makeTickerItem(
            'ETH',
            'US$ ' + formatBRL(parseFloat(data.ETHUSD.bid), 0),
            parseFloat(data.ETHUSD.pctChange)
          ));
        }
      }
    } catch (e) {
      console.warn('AwesomeAPI falhou:', e);
    }

    // 2) IBOV e ações via brapi.dev (sem token funciona pra alguns ativos básicos)
    try {
      const r = await fetch('https://brapi.dev/api/quote/^BVSP,PETR4,VALE3,ITUB4');
      if (r.ok) {
        const data = await r.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach(stock => {
            const label = stock.symbol === '^BVSP' ? 'IBOV' : stock.symbol;
            const value = stock.symbol === '^BVSP'
              ? formatBRL(stock.regularMarketPrice, 0)
              : 'R$ ' + formatBRL(stock.regularMarketPrice);
            items.push(makeTickerItem(label, value, stock.regularMarketChangePercent));
          });
        }
      }
    } catch (e) {
      console.warn('brapi.dev falhou:', e);
    }

    // 3) Indicadores BCB (SELIC, CDI) — valores institucionais que mudam pouco
    // Para precisão diária, esses valores devem ser atualizados manualmente ou via API paga.
    // Por ora, mostramos como informação institucional sem variação percentual.
    items.push(makeTickerItem('SELIC', '15,00% a.a.', null));
    items.push(makeTickerItem('CDI', '14,90% a.a.', null));

    return items;
  }

  async function updateTicker() {
    try {
      const items = await fetchMarketData();
      if (items.length > 0) {
        renderTicker(items);
      } else {
        // Fallback se tudo falhar
        const track = document.getElementById('ticker-track');
        if (track) {
          track.innerHTML = '<span class="ticker"><strong>Cotações indisponíveis no momento</strong></span>';
        }
      }
    } catch (e) {
      console.error('Erro ao atualizar ticker:', e);
    }
  }

  // Atualiza ao carregar e a cada 60 segundos
  updateTicker();
  setInterval(updateTicker, 60000);

})();
