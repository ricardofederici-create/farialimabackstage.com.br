// Faria Lima Backstage — script.js
// Interações básicas. Tudo opcional, o site funciona sem JS.

(function() {
  'use strict';

  // Menu mobile
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Smooth scroll para âncoras internas
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Header com sombra quando rolar
  const header = document.querySelector('.site-header');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > 100) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
    } else {
      header.style.boxShadow = 'none';
    }
    lastScroll = current;
  });

  // Atualização "ao vivo" do ticker (mock - na produção, conectar API real tipo b3.com.br ou yahoo finance)
  // Por enquanto, apenas decorativo

  // Console egg pra galera do mercado que vai abrir o devtools
  console.log('%cFARIA LIMA / BACKSTAGE', 'font-family: Georgia, serif; font-size: 32px; color: #FAC775; font-weight: 500;');
  console.log('%cTem furo bom? Manda no Signal: +55 11 9XXXX-XXXX', 'color: #aaa; font-size: 12px;');
  console.log('%cContato seguro: contato@farialimabackstage.com.br', 'color: #aaa; font-size: 12px;');

})();
