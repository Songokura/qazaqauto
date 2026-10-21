/* QAZAQ-AUTO - сценарии страницы: плиты, интро с контрольными лампами, язык, меню, форма. */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || '';
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var isMobile = function () { return window.innerWidth <= 760; };

  /* ---------- i18n ---------- */
  var I18N = { ru: {} };
  var META = {
    ru: { title: doc.title, desc: (doc.querySelector('meta[name="description"]') || {}).content || '' }
  };
  var nodes = [].slice.call(doc.querySelectorAll('[data-i]'));
  nodes.forEach(function (el) { I18N.ru[el.getAttribute('data-i')] = el.innerHTML; });

  function loadLang(lang, done) {
    if (I18N[lang] || lang !== 'kk') return done();
    var s = doc.createElement('script');
    s.src = 'assets/lang/kk.js' + (ASSET_V ? '?v=' + ASSET_V : '');
    s.onload = function () {
      if (window.SITE_KK) { I18N.kk = window.SITE_KK; META.kk = { title: window.SITE_KK['meta.title'], desc: window.SITE_KK['meta.desc'] }; }
      done();
    };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.ru;
    nodes.forEach(function (el) {
      var k = el.getAttribute('data-i');
      var v = dict[k] != null ? dict[k] : I18N.ru[k];
      if (v == null) return;
      el.innerHTML = v;
    });
    root.setAttribute('lang', lang);
    var m = META[lang] || META.ru;
    if (m) {
      doc.title = m.title;
      var md = doc.querySelector('meta[name="description"]');
      if (md) md.content = m.desc;
    }
    [].forEach.call(doc.querySelectorAll('.lang button'), function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem('qa-lang', lang); } catch (e) {}
    fitText();
    marquee();
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }

  [].forEach.call(doc.querySelectorAll('.lang button'), function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  (function initLang() {
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var saved = null;
    try { saved = localStorage.getItem('qa-lang'); } catch (e) {}
    var lang = forced || saved || 'ru';
    if (lang !== 'ru') setLang(lang);
  })();

  /* ---------- fitText: дисплейный заголовок не вылезает за контейнер ---------- */
  function fitText() {
    [].forEach.call(doc.querySelectorAll('.fit'), function (h) {
      h.style.fontSize = '';
      var box = h.parentElement, max = box.clientWidth, size = parseFloat(getComputedStyle(h).fontSize), n = 0;
      var over = function () {
        var w = 0; [].forEach.call(h.children.length ? h.children : [h], function (c) { w = Math.max(w, c.scrollWidth); });
        return w > max + 1;
      };
      while (over() && n < 14 && size > 24) { size *= 0.95; h.style.fontSize = size + 'px'; n++; }
    });
  }

  /* ---------- бегущая лента: шаг цикла ровно одна копия ---------- */
  function marquee() {
    [].forEach.call(doc.querySelectorAll('.marq'), function (m) {
      var track = m.querySelector('.marq-track'), copy = track.querySelector('.marq-copy');
      [].forEach.call(track.querySelectorAll('.marq-copy:not(:first-child)'), function (c) { c.remove(); });
      var w = copy.getBoundingClientRect().width;
      if (!w) return;
      var need = Math.max(2, Math.ceil((window.innerWidth * 2) / w) + 1);
      for (var i = 1; i < need; i++) track.appendChild(copy.cloneNode(true));
      m.style.setProperty('--mw', w + 'px');
    });
  }

  /* ---------- меню ---------- */
  var burger = doc.querySelector('.burger'), menu = doc.getElementById('menu');
  function openMenu(on) {
    if (on) menu.hidden = false;
    requestAnimationFrame(function () {
      menu.classList.toggle('is-open', on);
      body.classList.toggle('menu-open', on);
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
      burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню');
      if (!on) setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 320);
    });
  }
  burger.addEventListener('click', function () { openMenu(!body.classList.contains('menu-open')); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('menu-open')) openMenu(false); });
  [].forEach.call(menu.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { openMenu(false); }); });

  /* ---------- якоря: своя прокрутка с учётом шапки ---------- */
  var hdr = doc.getElementById('hdr');
  function targetTop(el) {
    var off = el.classList.contains('pw') ? 0 : hdr.offsetHeight + 12;
    return el.getBoundingClientRect().top + window.pageYOffset - off;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    var y = targetTop(el);
    if (instant || reduce) { root.style.scrollBehavior = 'auto'; window.scrollTo(0, y); root.style.scrollBehavior = ''; }
    else window.scrollTo({ top: y, behavior: 'smooth' });
    return true;
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    if (goTo(id)) { e.preventDefault(); history.pushState(null, '', '#' + id); }
  });

  /* ---------- плиты ---------- */
  var pws = [].slice.call(doc.querySelectorAll('.pw'));
  var hero = doc.querySelector('.pw.hero');
  var dispMap = doc.querySelector('#wave feDisplacementMap');
  var state = pws.map(function () { return { e: -1, s: -1, x: -1 }; });
  var H = window.innerHeight;
  var ticking = false;

  function setVar(el, name, v, st, key) {
    v = Math.round(v * 1000) / 1000;
    if (st[key] === v) return;
    st[key] = v;
    el.style.setProperty(name, v);
  }

  function plates() {
    ticking = false;
    H = window.innerHeight;
    var rects = pws.map(function (p) { return p.getBoundingClientRect(); });
    var enters = rects.map(function (r) { return clamp(1 - r.top / H, 0, 1); });
    var activeO = null;
    pws.forEach(function (p, i) {
      var r = rects[i];
      if (r.bottom < -H || r.top > H * 2) return;
      var enter = enters[i];
      var span = r.height - H;
      var stay = span > 2 ? clamp(-r.top / span, 0, 1) : 0;
      var next = pws[i + 1];
      var exit = next && r.bottom > 0 ? enters[i + 1] : 0;
      var st = state[i];
      setVar(p, '--enter', enter, st, 'e');
      setVar(p, '--stay', stay, st, 's');
      setVar(p, '--exit', exit, st, 'x');
      p.classList.toggle('gone', exit >= 1 || r.bottom <= 0);
      var txt = p.querySelector('.txt');
      if (txt && enter > 0.72) txt.classList.add('on');
      if (p === hero) {
        if (introDone) p.style.setProperty('--l', stay.toFixed(3));
      } else {
        var o = clamp((enter - 0.3) / 0.6, 0, 1);
        var media = p.querySelector('.sv-media');
        if (media) {
          media.classList.toggle('open', o >= 0.98);
          if (o > 0 && o < 0.98) activeO = o;
        }
      }
    });
    if (dispMap && !isMobile() && !reduce) {
      var sc = activeO == null ? 0 : Math.round(70 * (1 - activeO));
      if (sc !== plates.lastScale) { dispMap.setAttribute('scale', sc); plates.lastScale = sc; }
    }
    stickyBar();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(plates); } }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- интро героя: лампы выпрямляются и уходят, кадр проясняется ---------- */
  var introDone = false;
  var lampPaths = [].slice.call(doc.querySelectorAll('.lamps-hero .lamp'));
  var lampX = [14, 30, 48, 66];
  function bendLamps(b) {
    lampPaths.forEach(function (p, i) {
      var j = i % lampX.length, x = lampX[j], k = (j % 2 ? -1 : 1) * b * 11;
      p.setAttribute('d', 'M' + x + ' 0 Q ' + (x + k) + ' 42 ' + x + ' 70 T ' + x + ' 100');
    });
  }
  function runIntro() {
    var skip = reduce || location.hash || window.pageYOffset > 80;
    if (skip) {
      hero.style.setProperty('--f', 1); bendLamps(0); introDone = true; onScroll(); return;
    }
    var t0 = null, D = 1400;
    bendLamps(1);
    function frame(t) {
      if (t0 === null) t0 = t;
      var k = clamp((t - t0) / D, 0, 1);
      var f = 1 - Math.pow(1 - k, 3);
      hero.style.setProperty('--f', f.toFixed(3));
      hero.style.setProperty('--l', f.toFixed(3));
      bendLamps(1 - Math.min(1, k * 1.5));
      if (k < 1) requestAnimationFrame(frame);
      else { introDone = true; onScroll(); }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- липкая панель ---------- */
  var sticky = doc.getElementById('sticky'), kont = doc.getElementById('kontakty');
  var kontVisible = false;
  if ('IntersectionObserver' in window && kont) {
    new IntersectionObserver(function (es) { kontVisible = es[0].isIntersecting; stickyBar(); }, { threshold: 0.15 }).observe(kont);
  }
  function stickyBar() {
    if (!sticky) return;
    var on = window.pageYOffset > H * 0.55 && !kontVisible;
    sticky.classList.toggle('is-on', on);
  }

  /* ---------- появление блоков ---------- */
  var rvs = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rvs.forEach(function (el) { io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* ---------- до / после ---------- */
  var cmp = doc.getElementById('cmp');
  if (cmp) {
    var range = cmp.querySelector('.cmp-range');
    var setX = function () { cmp.style.setProperty('--x', range.value + '%'); };
    range.addEventListener('input', setX);
    setX();
  }

  /* ---------- форма -> WhatsApp ---------- */
  var form = doc.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website.value) return;
      var name = form.name.value.trim(), phone = form.phone.value.trim();
      var err = doc.getElementById('form-err'), ok = doc.getElementById('form-ok');
      var bad = false;
      [form.name, form.phone].forEach(function (f) {
        var good = f === form.phone ? phone.replace(/\D/g, '').length >= 10 : name.length > 1;
        f.closest('.fld').classList.toggle('is-bad', !good);
        if (!good) bad = true;
      });
      err.hidden = !bad;
      if (bad) { (name.length > 1 ? form.phone : form.name).focus(); return; }
      var d = I18N[root.lang] || {};
      var t = function (k, ru) { return d[k] || ru; };
      var sel = form.service, service = sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].textContent.trim() : '';
      var lines = [t('fm.hello', 'Здравствуйте! Хочу оценить ремонт.'), t('fm.name', 'Имя') + ': ' + name, t('fm.phone', 'Телефон') + ': ' + phone];
      if (service) lines.push(t('fm.service', 'Услуга') + ': ' + service);
      var msg = form.message.value.trim();
      if (msg) lines.push(t('fm.msg', 'Комментарий') + ': ' + msg);
      var url = 'https://wa.me/77767509594?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
      ok.hidden = false;
      form.querySelector('button[type="submit"]').blur();
    });
    form.phone.addEventListener('input', function () { form.phone.closest('.fld').classList.remove('is-bad'); });
    form.name.addEventListener('input', function () { form.name.closest('.fld').classList.remove('is-bad'); });
  }

  /* ---------- старт ---------- */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) { onScroll(); return; }
    lastW = window.innerWidth;
    fitText(); marquee(); onScroll();
  });
  function start() {
    fitText(); marquee();
    if (location.hash) {
      var id = decodeURIComponent(location.hash.slice(1));
      goTo(id, true);
      setTimeout(function () { goTo(id, true); plates(); }, 400);
    }
    runIntro();
    plates();
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(start); else start();
  window.addEventListener('load', function () { fitText(); marquee(); onScroll(); });
})();
