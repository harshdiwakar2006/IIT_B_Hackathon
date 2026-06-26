/* =============================================
   LOADER — dismiss within 500ms budget
============================================= */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  // Ensure total orchestration stays within 500ms
  setTimeout(() => {
    loader.classList.add('hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    initEntryAnimations();
  }, 400);
});

/* =============================================
   ENTRY ANIMATIONS — IntersectionObserver
============================================= */
function initEntryAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
}

/* =============================================
   HEADER SCROLL STATE
============================================= */
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* =============================================
   PRICING ENGINE
   Multi-dimensional config matrix.
   Currency/billing changes update ONLY text nodes
   inside [data-price-amount] and [data-price-symbol]
   — zero parent re-renders, zero layout reflow.
============================================= */
const PRICING_MATRIX = {
  // Base monthly rates per tier per currency
  // Regional tariff variables baked in (INR 1x, USD 0.012x, EUR 0.011x relative to base)
  starter: {
    INR: { base: 1999,  symbol: '₹' },
    USD: { base: 24,    symbol: '$' },
    EUR: { base: 22,    symbol: '€' },
  },
  pro: {
    INR: { base: 7499,  symbol: '₹' },
    USD: { base: 89,    symbol: '$' },
    EUR: { base: 82,    symbol: '€' },
  },
  enterprise: {
    INR: { base: 24999, symbol: '₹' },
    USD: { base: 299,   symbol: '$' },
    EUR: { base: 275,   symbol: '€' },
  },
};

const ANNUAL_DISCOUNT = 0.20; // 20% off
const TIERS = ['starter', 'pro', 'enterprise'];

// Cached DOM text nodes — accessed directly, no layout queries
const priceNodes   = {};
const symbolNodes  = {};
const savingsNodes = {};
TIERS.forEach(tier => {
  priceNodes[tier]   = document.querySelector(`[data-price-amount="${tier}"]`);
  symbolNodes[tier]  = document.querySelector(`[data-price-symbol="${tier}"]`);
  savingsNodes[tier] = document.querySelector(`[data-savings="${tier}"]`);
});

function formatNumber(n, currency) {
  // Locale-aware number formatting, no layout ops
  if (currency === 'INR') return n.toLocaleString('en-IN');
  return n.toLocaleString('en-US');
}

function computePrice(tier, currency, isAnnual) {
  const config = PRICING_MATRIX[tier][currency];
  const monthly = config.base;
  const effective = isAnnual
    ? Math.round(monthly * (1 - ANNUAL_DISCOUNT))
    : monthly;
  return { effective, monthly, symbol: config.symbol };
}

// Isolated DOM text node update — touches ONLY the relevant text nodes
function updatePrices() {
  const currency = document.getElementById('currency-select').value;
  const isAnnual = document.getElementById('billing-toggle').checked;

  TIERS.forEach(tier => {
    const { effective, monthly, symbol } = computePrice(tier, currency, isAnnual);

    // Direct text content mutation — no createElement, no innerHTML, no reflow
    priceNodes[tier].textContent  = formatNumber(effective, currency);
    symbolNodes[tier].textContent = symbol;

    if (isAnnual) {
      const saved = Math.round(monthly * ANNUAL_DISCOUNT * 12);
      savingsNodes[tier].textContent = `Save ${symbol}${formatNumber(saved, currency)}/year`;
    } else {
      savingsNodes[tier].textContent = '';
    }
  });
}

// Toggle label active state (visual only, no pricing reflow)
const billingToggle = document.getElementById('billing-toggle');
billingToggle.addEventListener('change', () => {
  const isAnnual = billingToggle.checked;
  document.getElementById('label-monthly').classList.toggle('active', !isAnnual);
  document.getElementById('label-annual').classList.toggle('active', isAnnual);
  billingToggle.setAttribute('aria-checked', String(isAnnual));
  updatePrices();
});

document.getElementById('currency-select').addEventListener('change', updatePrices);

/* =============================================
   BENTO GRID — active state tracking
============================================= */
let activeBentoIndex = null;

const bentoNodes = document.querySelectorAll('.bento-node');
bentoNodes.forEach((node, i) => {
  node.addEventListener('mouseenter', () => {
    activeBentoIndex = i;
    node.classList.add('active');
  });
  node.addEventListener('mouseleave', () => {
    node.classList.remove('active');
    // Keep track of last hovered for resize transfer
  });
  node.addEventListener('focus', () => {
    activeBentoIndex = i;
  });
});

/* =============================================
   BENTO → ACCORDION
   Feature 2: Responsive layout switch with
   active context transfer on window resize.
============================================= */
const FEATURE_DATA = [
  {
    tag: 'Pipeline Engine',
    title: 'AI-Orchestrated Pipelines',
    desc: 'Describe your workflow in plain language. NeuralFlow generates, validates, and deploys the entire pipeline graph—no YAML, no Airflow DAGs.',
    svgPath: `<path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>`
  },
  {
    tag: 'Analytics',
    title: 'Real-Time Insight Engine',
    desc: 'Sub-15ms query latency across billions of events. Stream anomaly detection baked in.',
    svgPath: `<path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>`
  },
  {
    tag: 'Connectors',
    title: '200+ Native Connectors',
    desc: 'Plug into any data source—databases, SaaS tools, event streams—in under 60 seconds.',
    svgPath: `<path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>`
  },
  {
    tag: 'Automation',
    title: 'Adaptive Schema Evolution',
    desc: 'Schema drift? NeuralFlow detects, adapts, and migrates downstream consumers automatically—zero manual intervention.',
    svgPath: `<path d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93c.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204c.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78c-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107c-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93c-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204c-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78c.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107c.397-.165.71-.505.78-.929l.15-.894Z"/><path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z"/>`
  },
  {
    tag: 'Observability',
    title: 'Deep Pipeline Observability',
    desc: 'Full trace visibility, latency heatmaps, and cost attribution per transformation node—live.',
    svgPath: `<path d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"/><path d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"/>`
  }
];

const accordionList = document.getElementById('accordion-list');
let activeAccordionIndex = null;

function buildAccordion() {
  if (accordionList.children.length > 0) return; // already built
  FEATURE_DATA.forEach((feat, i) => {
    const item = document.createElement('article');
    item.className = 'accordion-item';
    item.setAttribute('role', 'listitem');
    item.dataset.index = i;
    item.setAttribute('aria-labelledby', `accordion-title-${i}`);

    item.innerHTML = `
      <button
        class="accordion-trigger"
        type="button"
        aria-expanded="false"
        aria-controls="accordion-content-${i}"
        id="accordion-btn-${i}"
      >
        <div class="accordion-trigger-left">
          <div class="accordion-icon-wrap" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">${feat.svgPath}</svg>
          </div>
          <span class="accordion-trigger-title" id="accordion-title-${i}">${feat.title}</span>
        </div>
        <svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
        </svg>
      </button>
      <div class="accordion-content" id="accordion-content-${i}" role="region" aria-labelledby="accordion-btn-${i}">
        <div class="accordion-inner">
          <p>${feat.desc}</p>
        </div>
      </div>
    `;

    item.querySelector('.accordion-trigger').addEventListener('click', () => {
      toggleAccordion(i);
    });

    accordionList.appendChild(item);
  });
}

function toggleAccordion(index) {
  const items = accordionList.querySelectorAll('.accordion-item');
  const clickedItem = items[index];
  const isOpen = clickedItem.classList.contains('open');

  // Close all — transition is CSS ease-in-out 350ms
  items.forEach(item => {
    item.classList.remove('open');
    item.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    clickedItem.classList.add('open');
    clickedItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'true');
    activeAccordionIndex = index;
  } else {
    activeAccordionIndex = null;
  }
}

function openAccordionAt(index) {
  const items = accordionList.querySelectorAll('.accordion-item');
  items.forEach(item => {
    item.classList.remove('open');
    item.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
  });
  if (index !== null && items[index]) {
    items[index].classList.add('open');
    items[index].querySelector('.accordion-trigger').setAttribute('aria-expanded', 'true');
    activeAccordionIndex = index;
  }
}

/* =============================================
   CONTEXT TRANSFER ON RESIZE
   Transfers active bento hover index → accordion
   when crossing the 768px mobile breakpoint.
============================================= */
const MOBILE_BP = 768;
let prevIsMobile = window.innerWidth <= MOBILE_BP;

if (prevIsMobile) {
  buildAccordion();
}

const resizeObserver = new ResizeObserver(() => {
  const isMobile = window.innerWidth <= MOBILE_BP;

  if (isMobile && !prevIsMobile) {
    // Desktop → Mobile transition
    buildAccordion();
    if (activeBentoIndex !== null) {
      // Transfer context — open the accordion panel matching the hovered bento node
      requestAnimationFrame(() => openAccordionAt(activeBentoIndex));
    }
  }

  if (!isMobile && prevIsMobile) {
    // Mobile → Desktop transition
    // Transfer accordion context back to bento active state
    if (activeAccordionIndex !== null) {
      activeBentoIndex = activeAccordionIndex;
    }
  }

  prevIsMobile = isMobile;
});

resizeObserver.observe(document.body);

// Init pricing on load
updatePrices();
