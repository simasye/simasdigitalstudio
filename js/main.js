/* ==========================================================
   Sima's Digital Studio — site script (no frameworks).
   Everything on the website is built from js/content.js
   (which the admin dashboard writes for you).
   You normally do NOT need to edit this file.
   ========================================================== */
(function () {
  'use strict';

  var C = window.SITE_CONTENT || {};
  var FONTS = window.SITE_FONTS || null;
  var PREVIEW = !!window.__PREVIEW__;   // true only inside the dashboard preview
  var IMG = {
    hero: 'assets/images/hero-placeholder.svg',
    product: 'assets/images/placeholder-product.svg',
    portrait: 'assets/images/placeholder-portrait.svg'
  };

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function textOf(v) { return String(v == null ? '' : v).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(); }
  function filled(v) { return textOf(v) !== '' && !/\[INSERT/i.test(String(v)); }
  // Unfinished content: shown highlighted in the dashboard preview, hidden on the live website.
  function ph(label) { return PREVIEW ? '<span class="placeholder">[INSERT ' + esc(label) + ']</span>' : ''; }
  function txt(v, label) { return filled(v) ? esc(v) : ph(label); }
  function rich(v, label) { return filled(v) ? String(v) : ph(label); }
  function isRealUrl(u) { return /^https:\/\/[^\s]+$/i.test(u || '') && !/INSERT/i.test(u); }
  function isRealEmail(e) { return /^[^\s@\[\]]+@[^\s@\[\]]+\.[^\s@\[\]]+$/.test(e || ''); }
  function slugify(s) { return String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function query() { return window.__QUERY__ != null ? window.__QUERY__ : window.location.search; }
  function param(name) { return new URLSearchParams(query()).get(name); }
  function isExternal(u) { return /^https?:\/\//i.test(u || ''); }
  function linkAttrs(u) { return 'href="' + esc(u) + '"' + (isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : ''); }
  function btn(text, url, cls) {
    if (!filled(text)) return PREVIEW ? '<span class="placeholder">[INSERT BUTTON TEXT]</span>' : '';
    return '<a class="btn ' + (cls || '') + '" ' + linkAttrs(url || '#') + '>' + esc(text) + '</a>';
  }
  function brandName() { return (C.brand && C.brand.name) || "Sima's Digital Studio"; }
  function imgTag(im, kind, attrs) {
    var has = im && im.src;
    var src = has ? im.src : IMG[kind || 'portrait'];
    var alt = has ? (im.alt || '') : '';
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '"' + (!has && PREVIEW ? ' class="is-placeholder"' : '') + (attrs ? ' ' + attrs : '') + '>';
  }
  function categories() { return C.categories || []; }
  function categoryBySlug(slug) { var r = null; categories().forEach(function (c) { if (c.slug === slug) r = c; }); return r; }
  function catName(slug) { var c = categoryBySlug(slug); return c ? c.name : ''; }
  function products() { return (C.products || []).filter(function (p) { return PREVIEW || p.status !== 'draft'; }); }
  function productUrl(p) { return 'product.html?p=' + encodeURIComponent(p.slug); }
  function productImages(p) {
    var arr = [];
    if (p.cover && p.cover.src) arr.push(p.cover);
    (p.gallery || []).forEach(function (g) { if (g && g.src) arr.push(g); });
    return arr;
  }
  function setMeta(title, desc) {
    document.title = title;
    var m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute('content', desc);
  }
  function replaceTokens(html) {
    var e = C.contact && C.contact.email;
    var rep = isRealEmail(e) ? '<a href="mailto:' + esc(e) + '">' + esc(e) + '</a>' : (PREVIEW ? '<span class="placeholder">[INSERT CONTACT EMAIL]</span>' : 'us through the Contact page');
    return String(html || '').replace(/\{\{\s*CONTACT_EMAIL\s*\}\}/g, rep);
  }

  // If an image file is missing, fall back to a placeholder (never a broken icon).
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fallback) { t.dataset.fallback = '1'; t.src = IMG.product; }
  }, true);

  /* ---------- theme: colours + fonts ---------- */
  function hex2rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var n = parseInt(h, 16);
    return isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(r) { return '#' + r.map(function (x) { return ('0' + Math.round(x).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { var A = hex2rgb(a), B = hex2rgb(b); return rgb2hex([0, 1, 2].map(function (i) { return A[i] * (1 - t) + B[i] * t; })); }
  function isDark(h) { var c = hex2rgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) < 150; }

  function applyTheme() {
    var A = C.appearance || {}, col = A.colors || {}, v = [];
    if (col.brand) { v.push('--sage:' + col.brand, '--sage-dark:' + mix(col.brand, '#000000', 0.2), '--sage-soft:' + mix(col.brand, '#ffffff', 0.85), '--on-brand:' + (isDark(col.brand) ? '#ffffff' : '#1f1f1f')); }
    if (col.background) v.push('--white:' + col.background);
    if (col.backgroundSoft) v.push('--beige:' + col.backgroundSoft, '--beige-deep:' + mix(col.backgroundSoft, '#000000', 0.04));
    if (col.text) v.push('--charcoal:' + col.text, '--muted:' + mix(col.text, '#ffffff', 0.28));
    if (col.buttonBg) v.push('--btn-bg:' + col.buttonBg, '--btn-bg-hover:' + mix(col.buttonBg, '#000000', 0.18));
    if (col.buttonText) v.push('--btn-text:' + col.buttonText);
    if (col.accent) v.push('--rose:' + col.accent);
    var need = [];
    ['headingFont', 'bodyFont', 'navFont'].forEach(function (k) {
      var n = A[k]; if (!n || !FONTS) return;
      var st = FONTS.stack(n); if (!st) return;
      v.push((k === 'headingFont' ? '--font-head' : k === 'bodyFont' ? '--font-body' : '--font-nav') + ':' + st);
      if (FONTS.builtIn.indexOf(n) < 0) need.push(n);
    });
    if (C.brand && C.brand.font && FONTS && FONTS.builtIn.indexOf(C.brand.font) < 0) need.push(C.brand.font);
    if (v.length) {
      var s = document.createElement('style'); s.id = 'theme-vars';
      s.textContent = ':root{' + v.join(';') + '}';
      document.head.appendChild(s);
    }
    if (need.length && FONTS) {
      var u = FONTS.url(need);
      if (u) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = u; document.head.appendChild(l); }
    }
  }

  /* ---------- brand (text or logo) ---------- */
  function brandMarkup(where) {
    var B = C.brand || {};
    var name = brandName().replace(/'/g, '’');
    var logo = where === 'footer' ? (B.footerLogo || B.headerLogo) : B.headerLogo;
    if (B.displayMode === 'logo' && logo) {
      var h = where === 'footer' ? (B.footerLogoHeight || B.logoHeight || 40) : (B.logoHeight || 44);
      return '<img class="brand__logo" src="' + esc(logo) + '" alt="' + esc(B.logoAlt || name) + '" style="height:' + h + 'px">';
    }
    var st = 'font-size:' + (B.size || 30) + 'px;font-weight:' + (B.weight || 500) + ';letter-spacing:' + (B.letterSpacing == null ? 0.01 : B.letterSpacing) + 'em' +
      (B.color ? ';color:' + B.color : '') + (B.font && FONTS && FONTS.stack(B.font) ? ';font-family:' + FONTS.stack(B.font) : '');
    var style = B.textStyle || 'two-line';
    if (style === 'two-line') {
      var i = name.indexOf(' ');
      var first = i < 0 ? name : name.slice(0, i), rest = i < 0 ? '' : name.slice(i + 1);
      return '<span class="brand__name" style="' + st + '">' + esc(first) + '</span>' + (rest ? '<span class="brand__sub">' + esc(rest) + '</span>' : '');
    }
    var t = name;
    if (style === 'upper') t = name.toUpperCase();
    else if (style === 'first-upper') { var j = name.indexOf(' '); t = j < 0 ? name.toUpperCase() : name.slice(0, j).toUpperCase() + name.slice(j); }
    return '<span class="brand__name brand__name--line" style="' + st + '">' + esc(t) + '</span>';
  }

  /* ---------- header / footer ---------- */
  function renderHeader() {
    var mount = document.getElementById('site-header');
    if (!mount) return;
    var page = document.body.getAttribute('data-page') || '';
    var links = [['home', 'index.html', 'Home'], ['shop', 'shop.html', 'Shop'], ['about', 'about.html', 'About'], ['contact', 'contact.html', 'Contact']];
    var items = links.map(function (l) {
      var cur = (l[0] === page || (l[0] === 'shop' && page === 'product')) ? ' aria-current="page"' : '';
      return '<li><a href="' + l[1] + '"' + cur + '>' + l[2] + '</a></li>';
    }).join('');
    var ann = C.brand && C.brand.announcement;
    mount.innerHTML =
      (filled(ann) ? '<div class="announce">' + esc(ann) + '</div>' : '') +
      '<header class="site-header" id="top"><div class="container header-inner">' +
      '<a class="brand" href="index.html" aria-label="' + esc(brandName()) + ' — home">' + brandMarkup('header') + '</a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>' +
      '<nav class="site-nav" id="primary-nav" aria-label="Main"><ul class="nav-list">' + items + '</ul></nav></div></header>';
    var header = mount.querySelector('.site-header'), b = mount.querySelector('.nav-toggle');
    function setOpen(open) { header.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Close' : 'Menu'; }
    b.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  function renderFooter() {
    var mount = document.getElementById('site-footer');
    if (!mount) return;
    var ct = C.contact || {}, email = ct.email;
    var emailHtml = isRealEmail(email) ? '<p><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></p>' : (PREVIEW ? '<p><span class="placeholder">[INSERT CONTACT EMAIL]</span></p>' : '<p><a href="contact.html">Contact us</a></p>');
    var social = ct.social || {};
    var names = { instagram: 'Instagram', pinterest: 'Pinterest', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
    var sl = Object.keys(names).filter(function (k) { return isRealUrl(social[k]); }).map(function (k) {
      return '<li><a href="' + esc(social[k]) + '" target="_blank" rel="noopener noreferrer">' + names[k] + '</a></li>';
    }).join('');
    var socialHtml = sl ? '<ul>' + sl + '</ul>' : (PREVIEW ? '<p><span class="placeholder">[INSERT SOCIAL MEDIA LINKS]</span></p>' : '');
    var cats = categories().map(function (c) { return '<li><a href="shop.html?category=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + '</a></li>'; }).join('');
    var desc = (C.brand && C.brand.footerDescription) || '';
    mount.innerHTML =
      '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
      '<div class="footer-brand"><a class="brand" href="index.html">' + brandMarkup('footer') + '</a>' + (filled(desc) ? '<p>' + esc(desc) + '</p>' : '') + '</div>' +
      '<div><h2>Explore</h2><ul><li><a href="index.html">Home</a></li><li><a href="shop.html">Shop</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li></ul></div>' +
      '<div><h2>Shop</h2><ul><li><a href="shop.html">All products</a></li>' + cats + '</ul></div>' +
      '<div><h2>Contact</h2>' + emailHtml + socialHtml + '</div></div>' +
      '<div class="footer-bottom"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(brandName()) + '. All rights reserved.</span>' +
      '<ul><li><a href="privacy-policy.html">Privacy Policy</a></li><li><a href="terms-of-service.html">Terms of Service</a></li><li><a href="refund-policy.html">Refund Policy</a></li></ul></div>' +
      '</div></footer>';
  }

  /* ---------- product card ---------- */
  function cardHtml(p) {
    var ims = productImages(p);
    var im = ims[0] || { src: '' };
    var draft = PREVIEW && p.status === 'draft' ? '<span class="draft-tag">Draft &mdash; not published</span>' : '';
    return '<article class="product-card">' +
      '<a class="product-card__media" href="' + productUrl(p) + '" tabindex="-1" aria-hidden="true">' +
      imgTag(im.src ? im : null, 'product', 'width="800" height="1000" loading="lazy"') + '</a>' +
      '<div class="product-card__body">' + draft +
      '<span class="product-card__cat">' + esc(catName(p.category)) + '</span>' +
      '<h3 class="product-card__title"><a href="' + productUrl(p) + '">' + txt(p.name, 'PRODUCT NAME') + '</a></h3>' +
      '<p class="product-card__desc">' + txt(p.shortDescription, 'SHORT DESCRIPTION') + '</p>' +
      '<div class="product-card__foot"><span class="price">' + txt(p.price, 'PRODUCT PRICE') + '</span>' +
      '<a class="btn btn--outline btn--small" href="' + productUrl(p) + '">View Product</a></div></div></article>';
  }

  /* ---------- home ---------- */
  function faqList(list) {
    return (list || []).filter(function (f) { return filled(f.q); }).map(function (f) {
      return '<details><summary>' + esc(f.q) + '</summary><div class="faq__a">' + (f.answerHtml || '') + '</div></details>';
    }).join('');
  }

  function renderHome(main) {
    var H = C.home || {}, I = H.intro || {}, W = H.why || {}, K = H.cta || {};
    var list = products().filter(function (p) { return p.featured; }).slice(0, 3);
    if (!list.length) list = products().slice(0, 3);   // none ticked: show the first products
    var featured = list.length ? list.map(cardHtml).join('') : '<p class="empty-state">New products are coming soon.</p>';
    var cats = categories().map(function (c, i) {
      var n = i + 1 < 10 ? '0' + (i + 1) : String(i + 1);
      return '<a class="category-card" href="shop.html?category=' + encodeURIComponent(c.slug) + '"><span class="category-card__num">' + n + '</span><h3>' + esc(c.name) + '</h3>' + (filled(c.description) ? '<p>' + esc(c.description) + '</p>' : '') + '</a>';
    }).join('');
    var why = (W.items || []).map(function (it, i) {
      var n = i + 1 < 10 ? '0' + (i + 1) : String(i + 1);
      return '<div class="feature"><span class="feature__num">' + n + '</span><h3>' + esc(it.title) + '</h3><p>' + esc(it.text) + '</p></div>';
    }).join('');
    var faqs = faqList(C.faqs);
    main.innerHTML =
      '<section class="hero" aria-labelledby="hero-title"><div class="hero__grid"><div class="hero__text">' +
      (filled(H.eyebrow) ? '<span class="eyebrow">' + esc(H.eyebrow) + '</span>' : '') +
      '<h1 id="hero-title">' + rich(H.heroHeadingHtml, 'HERO HEADING') + '</h1>' +
      '<div class="lead">' + rich(H.heroTextHtml, 'HERO TEXT') + '</div>' +
      '<div class="hero__actions">' + btn(H.buttonText, H.buttonUrl) +
      (filled(H.secondaryText) ? '<a class="text-link" ' + linkAttrs(H.secondaryUrl || 'about.html') + '>' + esc(H.secondaryText) + '</a>' : '') + '</div></div>' +
      '<div class="hero__media">' + imgTag(H.heroImage, 'hero', 'width="1200" height="1000" fetchpriority="high"') + '</div></div></section>' +

      '<section class="section" aria-labelledby="featured-title"><div class="container"><div class="section-head section-head--row">' +
      '<div><span class="eyebrow">Featured</span><h2 id="featured-title">' + txt(H.featuredHeading, 'FEATURED HEADING') + '</h2></div>' +
      '<a class="text-link" href="shop.html">View all products</a></div><div class="grid grid--products">' + featured + '</div></div></section>' +

      (cats ? '<section class="section section--beige" aria-labelledby="cat-title"><div class="container"><div class="section-head"><span class="eyebrow">Collections</span><h2 id="cat-title">' + txt(H.categoriesHeading, 'CATEGORIES HEADING') + '</h2>' +
        (filled(H.categoriesLead) ? '<p class="lead">' + esc(H.categoriesLead) + '</p>' : '') + '</div><div class="category-grid">' + cats + '</div></div></section>' : '') +

      '<section class="section" aria-labelledby="intro-title"><div class="container split' + (I.imagePosition === 'right' ? '' : '') + '">' +
      '<div class="split__media">' + imgTag(I.image, 'portrait', 'width="800" height="1000" loading="lazy"') + '</div><div>' +
      (filled(I.eyebrow) ? '<span class="eyebrow">' + esc(I.eyebrow) + '</span>' : '') +
      '<h2 id="intro-title">' + txt(I.heading, 'INTRO HEADING') + '</h2><div class="rich">' + rich(I.bodyHtml, 'INTRO TEXT') + '</div>' +
      (filled(I.buttonText) ? '<p>' + btn(I.buttonText, I.buttonUrl, 'btn--outline') + '</p>' : '') + '</div></div></section>' +

      (why ? '<section class="section section--sage" aria-labelledby="why-title"><div class="container"><div class="section-head">' +
        (filled(W.eyebrow) ? '<span class="eyebrow">' + esc(W.eyebrow) + '</span>' : '') + '<h2 id="why-title">' + txt(W.heading, 'WHY CHOOSE US HEADING') + '</h2></div>' +
        '<div class="feature-row" style="--cols:' + Math.min(Math.max((W.items || []).length, 1), 4) + '">' + why + '</div></div></section>' : '') +

      (faqs ? '<section class="section" aria-labelledby="faq-title"><div class="container faq-layout faq"><div><span class="eyebrow">FAQ</span><h2 id="faq-title">' + txt(H.faqHeading, 'FAQ HEADING') + '</h2>' +
        (filled(H.faqNote) ? '<p class="lead" style="font-size:1.05rem">' + esc(H.faqNote) + ' <a href="contact.html">Get in touch</a>.</p>' : '') +
        '</div><div>' + faqs + '</div></div></section>' : '') +

      '<section class="section section--sage cta" aria-labelledby="cta-title"><div class="container"><h2 id="cta-title">' + txt(K.heading, 'CALL TO ACTION HEADING') + '</h2>' +
      (filled(K.text) ? '<p>' + esc(K.text) + '</p>' : '') + btn(K.buttonText, K.buttonUrl, 'btn--light') + '</div></section>';
  }

  /* ---------- about ---------- */
  function renderAbout(main) {
    var A = C.about || {}, F = A.founder || {}, out = '', n = 0;
    out += '<div class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>About</span></nav>' +
      '<h1>' + txt(A.title, 'ABOUT TITLE') + '</h1><div class="lead">' + rich(A.leadHtml, 'ABOUT INTRODUCTION') + '</div></div></div>';
    (A.blocks || []).forEach(function (b) {
      var bg = n % 2 === 1 ? ' section--beige' : '';
      var eyebrow = filled(b.eyebrow) ? '<span class="eyebrow">' + esc(b.eyebrow) + '</span>' : '';
      if (b.type === 'split') {
        var hasImg = b.imagePosition !== 'none';
        var media = hasImg ? '<div class="split__media">' + imgTag(b.image, 'portrait', 'width="800" height="1000" loading="lazy"') + '</div>' : '';
        var text = '<div>' + eyebrow + '<h2>' + txt(b.heading, 'SECTION HEADING') + '</h2><div class="rich">' + rich(b.bodyHtml, 'SECTION TEXT') + '</div>' + (filled(b.buttonText) ? '<p>' + btn(b.buttonText, b.buttonUrl) + '</p>' : '') + '</div>';
        out += '<section class="section' + bg + '"><div class="container split' + (hasImg ? '' : ' split--single') + '">' + (b.imagePosition === 'left' ? media + text : text + media) + '</div></section>';
      } else if (b.type === 'cards') {
        var items = (b.items || []).map(function (it, i) {
          return '<div class="feature"><span class="feature__num">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span><h3>' + esc(it.title) + '</h3><p>' + esc(it.text) + '</p></div>';
        }).join('');
        out += '<section class="section' + bg + '"><div class="container"><div class="section-head">' + eyebrow + '<h2>' + txt(b.heading, 'SECTION HEADING') + '</h2></div>' +
          '<div class="feature-row feature-row--light" style="--cols:' + Math.min(Math.max((b.items || []).length, 1), 4) + '">' + items + '</div></div></section>';
      } else if (b.type === 'list') {
        var li = (b.items || []).filter(filled).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
        out += '<section class="section' + bg + '"><div class="container"><div class="section-head">' + eyebrow + '<h2>' + txt(b.heading, 'SECTION HEADING') + '</h2>' +
          (filled(b.leadHtml) ? '<div class="lead">' + b.leadHtml + '</div>' : '') + '</div><ul class="check-list" style="columns:2;column-gap:48px;max-width:760px">' + li + '</ul>' + (filled(b.buttonText) ? btn(b.buttonText, b.buttonUrl) : '') + '</div></section>';
      }
      n++;
    });
    // Founder profile (its own section)
    var hasF = F.show !== false && (filled(F.name) || filled(F.introHtml) || (F.photo && F.photo.src) || PREVIEW);
    if (hasF) {
      var bgF = n % 2 === 1 ? ' section--beige' : '';
      var ar = F.aspect || '4 / 5', fo = F.focus || 'center';
      var photo = '<div class="split__media">' + imgTag(F.photo, 'portrait', 'width="800" height="1000" loading="lazy" style="aspect-ratio:' + esc(ar) + ';object-position:center ' + esc(fo) + '"') + '</div>';
      var ftext = '<div>' + (filled(F.eyebrow) ? '<span class="eyebrow">' + esc(F.eyebrow) + '</span>' : '') + '<h2>' + txt(F.name, 'FOUNDER NAME') + '</h2><div class="rich">' + rich(F.introHtml, 'FOUNDER INTRODUCTION') + '</div></div>';
      out += '<section class="section' + bgF + '" id="founder"><div class="container split">' + (F.position === 'right' ? ftext + photo : photo + ftext) + '</div></section>';
    }
    main.innerHTML = out;
  }

  /* ---------- contact ---------- */
  function renderContact(main) {
    var K = C.contact || {}, email = K.email, hasEmail = isRealEmail(email);
    var social = K.social || {}, names = { instagram: 'Instagram', pinterest: 'Pinterest', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
    var sl = Object.keys(names).filter(function (k) { return isRealUrl(social[k]); }).map(function (k) {
      return '<a href="' + esc(social[k]) + '" target="_blank" rel="noopener noreferrer">' + names[k] + '</a>';
    }).join(' &middot; ');
    var card = (hasEmail || PREVIEW)
      ? '<div class="contact-card"><h2>' + txt(K.emailHeading || 'Email us', 'HEADING') + '</h2><p class="contact-email">' +
        (hasEmail ? '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a>' : '<span class="placeholder">[INSERT CONTACT EMAIL]</span>') + '</p>' +
        (filled(K.emailNote) ? '<p>' + esc(K.emailNote) + '</p>' : '') + (sl ? '<p>Follow: ' + sl + '</p>' : '') + '</div>'
      : '';
    main.innerHTML =
      '<div class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>Contact</span></nav>' +
      '<h1>' + txt(K.title, 'CONTACT TITLE') + '</h1><div class="lead">' + rich(K.leadHtml, 'CONTACT INTRODUCTION') + '</div></div></div>' +
      '<section class="section"><div class="container contact-grid"' + (card ? '' : ' style="grid-template-columns:1fr;max-width:820px"') + '>' + card +
      '<div class="prose">' + rich(K.bodyHtml, 'CONTACT TEXT') + '</div></div></section>';
  }

  /* ---------- legal ---------- */
  function renderLegal(main) {
    var key = document.body.getAttribute('data-legal');
    var L = (C.legal || {})[key] || {};
    main.innerHTML =
      '<div class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>' + esc(L.title || '') + '</span></nav>' +
      '<h1>' + txt(L.title, 'TITLE') + '</h1>' +
      ((filled(L.updated) || PREVIEW) ? '<p class="updated" style="margin:0">Last updated: ' + (filled(L.updated) ? esc(L.updated) : '<span class="placeholder">[INSERT DATE]</span>') + '</p>' : '') +
      '</div></div><section class="section" style="padding-top:clamp(36px,5vw,64px)"><div class="container"><div class="prose">' + replaceTokens(rich(L.contentHtml, 'POLICY TEXT')) + '</div></div></section>';
    document.title = textOf(L.title) + ' | ' + brandName();
  }

  /* ---------- shop ---------- */
  function renderShop() {
    var grid = document.getElementById('shop-grid');
    if (!grid) return;
    var filters = document.getElementById('shop-filters'), note = document.getElementById('shop-note');
    var active = param('category');
    if (active && !categoryBySlug(active)) active = null;
    var all = products();
    function draw() {
      var shown = all.filter(function (p) { return !active || p.category === active; });
      var cat = active ? categoryBySlug(active) : null;
      grid.innerHTML = shown.length ? shown.map(cardHtml).join('')
        : '<div class="empty-state"><p>' + (all.length ? 'No products in this category yet.' : 'New digital products are coming soon.') + '</p>' + (active ? '<a class="btn btn--outline btn--small" href="shop.html">View all products</a>' : '') + '</div>';
      note.textContent = all.length ? shown.length + (shown.length === 1 ? ' product' : ' products') + (cat ? ' in ' + cat.name : '') : '';
      Array.prototype.forEach.call(filters.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String((b.getAttribute('data-cat') || '') === (active || '')));
      });
    }
    filters.innerHTML = '<button type="button" class="chip" data-cat="" aria-pressed="true">All</button>' +
      categories().map(function (c) { return '<button type="button" class="chip" data-cat="' + esc(c.slug) + '" aria-pressed="false">' + esc(c.name) + '</button>'; }).join('');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      active = b.getAttribute('data-cat') || null;
      try { history.replaceState(null, '', active ? 'shop.html?category=' + encodeURIComponent(active) : 'shop.html'); } catch (err) { /* ignore */ }
      draw();
    });
    draw();
  }

  /* ---------- product page ---------- */
  function renderProduct() {
    var root = document.getElementById('product-root');
    if (!root) return;
    var slug = param('p'), p = null;
    products().forEach(function (x) { if (x.slug === slug) p = x; });
    if (!p) {
      setMeta('Product not found | ' + brandName(), 'This product could not be found.');
      root.innerHTML = '<div class="container section"><div class="empty-state"><h1>Product not found</h1><p>We couldn&rsquo;t find that product. It may have been moved or removed.</p><a class="btn" href="shop.html">Browse the shop</a></div></div>';
      return;
    }
    var shortD = p.shortDescription || '';
    setMeta((filled(p.name) ? p.name : 'Product') + ' | ' + brandName(), filled(shortD) ? shortD : 'Digital product from ' + brandName() + '.');
    var ims = productImages(p);
    var images = ims.length ? ims : [{ src: '', alt: '' }];
    var buy = isRealUrl(p.checkoutUrl)
      ? '<a class="btn btn--block" href="' + esc(p.checkoutUrl) + '" rel="noopener">Buy Now</a><p class="buy-note">You will be taken to our payment provider&rsquo;s secure checkout.</p>'
      : '<button class="btn btn--block" type="button" disabled aria-disabled="true">Buy Now</button><p class="buy-note">Checkout isn&rsquo;t available for this product yet.</p>';
    var faqs = (p.faqs && p.faqs.length) ? p.faqs : (C.productFaqs || []);
    var faqHtml = faqList(faqs);
    var thumbs = images.length > 1 ? '<div class="gallery__thumbs">' + images.map(function (im, i) {
      return '<button type="button" data-i="' + i + '" aria-label="Show image ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + esc(im.src) + '" alt="" width="76" height="95"></button>';
    }).join('') + '</div>' : '';
    var others = products().filter(function (x) { return x.slug !== p.slug; }).slice(0, 3);
    function acc(title, html, label, open) {
      if (!filled(html) && !PREVIEW) return '';
      return '<details' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="acc__a">' + rich(html, label) + '</div></details>';
    }
    var fmt = filled(p.fileFormat) || PREVIEW ? '<div><dt>File format</dt><dd>' + txt(p.fileFormat, 'FILE FORMAT') + '</dd></div>' : '';
    var compat = (filled(p.compatibility) || PREVIEW) ? '<p><strong>Compatibility:</strong> ' + txt(p.compatibility, 'COMPATIBILITY') + '</p>' : '';
    var ffHtml = (filled(p.fileFormat) || filled(p.compatibility) || PREVIEW)
      ? '<details><summary>File format &amp; compatibility</summary><div class="acc__a">' + ((filled(p.fileFormat) || PREVIEW) ? '<p><strong>File format:</strong> ' + txt(p.fileFormat, 'FILE FORMAT') + '</p>' : '') + compat + '</div></details>' : '';

    root.innerHTML =
      '<div class="page-hero" style="padding:28px 0;border-bottom:1px solid var(--line)"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb" style="margin:0"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span>' + txt(p.name, 'PRODUCT NAME') + '</span></nav></div></div>' +
      '<section class="section" style="padding-top:clamp(36px,5vw,64px)"><div class="container product">' +
      '<div class="gallery"><div class="gallery__main">' + imgTag(images[0].src ? images[0] : null, 'product', 'id="gallery-main" width="800" height="1000"') + '</div>' + thumbs + '</div>' +
      '<div class="product__info">' +
      (p.category ? '<a class="eyebrow" href="shop.html?category=' + encodeURIComponent(p.category) + '" style="text-decoration:none">' + esc(catName(p.category)) + '</a>' : '') +
      '<h1>' + txt(p.name, 'PRODUCT NAME') + '</h1><p class="product__price">' + txt(p.price, 'PRODUCT PRICE') + '</p>' +
      '<p class="product__short">' + txt(shortD, 'SHORT DESCRIPTION') + '</p>' +
      '<dl class="facts">' + fmt + '<div><dt>Delivery</dt><dd>Digital download</dd></div></dl>' + buy +
      '<ul class="assurances"><li>Digital product &mdash; nothing is shipped</li><li>Checkout handled by a third-party payment provider</li><li>See our <a href="refund-policy.html">Refund Policy</a></li></ul>' +
      '<div class="accordion">' + acc('Description', p.descriptionHtml, 'PRODUCT DESCRIPTION', true) + acc('Key features', p.featuresHtml, 'KEY FEATURES') + acc('What&rsquo;s included', p.includedHtml, 'WHAT\'S INCLUDED') + ffHtml + '</div></div></div></section>' +
      (faqHtml ? '<section class="section section--beige"><div class="container"><div class="faq-layout faq"><div><span class="eyebrow">Questions</span><h2>About this product</h2></div><div>' + faqHtml + '</div></div></div></section>' : '') +
      (others.length ? '<section class="section"><div class="container"><div class="section-head section-head--row"><div><span class="eyebrow">Continue browsing</span><h2>More from the studio</h2></div><a class="text-link" href="shop.html">View all products</a></div><div class="grid grid--products">' + others.map(cardHtml).join('') + '</div></div></section>' : '');

    var main = document.getElementById('gallery-main'), tb = root.querySelector('.gallery__thumbs');
    if (tb) tb.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var im = images[Number(b.getAttribute('data-i'))];
      main.src = im.src; main.alt = im.alt || '';
      Array.prototype.forEach.call(tb.querySelectorAll('button'), function (x) { x.removeAttribute('aria-current'); });
      b.setAttribute('aria-current', 'true');
    });
  }

  /* ---------- start ---------- */
  function init() {
    applyTheme();
    renderHeader();
    var page = document.body.getAttribute('data-page');
    var main = document.getElementById('main');
    var title = document.body.getAttribute('data-title') || '';
    var desc = document.querySelector('meta[name="description"]');
    if (page === 'home') {
      renderHome(main);
      setMeta(brandName() + ' | ' + (title || 'Digital Planners & Resources'), (C.brand && C.brand.metaDescription) || '');
    } else if (page === 'about') { renderAbout(main); setMeta('About | ' + brandName()); }
    else if (page === 'contact') { renderContact(main); setMeta('Contact | ' + brandName()); }
    else if (page === 'legal') renderLegal(main);
    else if (page === 'shop') { renderShop(); setMeta('Shop Digital Products | ' + brandName()); }
    else if (page === 'product') renderProduct();
    else if (page === '404') document.title = 'Page not found | ' + brandName();
    if (desc && page !== 'home' && desc.getAttribute('content')) desc.setAttribute('content', desc.getAttribute('content').replace(/Sima.s Digital Studio/g, brandName()));
    renderFooter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
