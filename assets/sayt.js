// Galereya: hudud filtri va kattalashtirib ko'rish (.gal a va [data-lb] havolalari)
(function () {
  var gal = document.querySelector('.gal');
  if (gal) {
    document.querySelectorAll('.filt button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.filt button').forEach(function (x) { x.classList.toggle('on', x === b); });
        var f = b.getAttribute('data-f');
        gal.querySelectorAll('a').forEach(function (a) { a.classList.toggle('hide', f !== '*' && a.getAttribute('data-g') !== f); });
        if (f !== '*') showAll();
      });
    });
    // telefonda avval 6 ta rasm, "Barchasini ko'rish" bosilsa hammasi
    var more = document.querySelector('.gal-more');
    function showAll() { gal.classList.remove('short'); if (more) more.style.setProperty('display', 'none', 'important'); }
    if (more) more.addEventListener('click', showAll);
  }
  var lb = document.querySelector('.lb');
  if (!lb) { lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.appendChild(document.createElement('img')); document.body.appendChild(lb); }
  var lbImg = lb.querySelector('img');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.gal a, a[data-lb]'); if (!a) return; e.preventDefault();
    var im = a.querySelector('img');
    lbImg.src = a.getAttribute('href'); lbImg.alt = im ? im.alt : ''; lb.classList.add('open');
  });
  function close() { lb.classList.remove('open'); lbImg.removeAttribute('src'); }
  lb.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

// ===== Animatsiyalar: scroll'da paydo bo'lish, raqamlar sanog'i =====
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !document.documentElement.getBoundingClientRect) return;
  var sel = ['.sec-head', '.card', '.tk', '.proj', '.feat', '.np', '.gal a', '.region', '.ps-i', '.ps-cta',
             '.br-card', '.br-formula', '.br-box', '.stats > div', '.aside', '.chips span', '.band .split > *', '.feat-ar-g a', '.note'];
  var left = Array.prototype.slice.call(document.querySelectorAll(sel.join(',')));
  left.forEach(function (el) {
    var i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--rv-d', Math.min(i, 8) * 70 + 'ms'); el.classList.add('rv');
  });
  function show(el) { el.classList.add('rv-in'); if (el.matches && el.matches('.stats > div')) count(el.querySelector('b')); }
  var busy = false;
  function check() {
    busy = false; var vh = window.innerHeight || document.documentElement.clientHeight, vw = window.innerWidth || document.documentElement.clientWidth;
    left = left.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return true;          // yashirin (display:none) - keyin
      if (r.top < vh * 0.92 && r.bottom > 0 && r.left < vw + 40 && r.right > -40) { show(el); return false; }
      return true;
    });
    if (!left.length) { window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); document.removeEventListener('scroll', tick, true); }
  }
  function tick() { if (!busy) { busy = true; setTimeout(check, 40); } }
  window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick);
  document.addEventListener('scroll', tick, { capture: true, passive: true });   // gorizontal suriladigan qatorlar
  document.addEventListener('click', function () { setTimeout(tick, 50); });     // "Barchasini ko'rish", filtr
  check();
  var poll = setInterval(function () { if (!left.length) clearInterval(poll); else check(); }, 300);   // ishonchli zaxira
  // himoya: biror sabab bilan ko'rinmay qolsa, 4 soniyadan keyin hammasini ochamiz (sahifa pastida turganlar)
  setTimeout(function () { left.forEach(function (el) { if (el.getBoundingClientRect().top < (window.innerHeight || 800)) show(el); }); }, 4000);
  function count(b) {
    if (!b) return; var m = b.textContent.match(/^(\d+)(.*)$/); if (!m) return;
    var to = +m[1], suf = m[2], t0 = null, dur = 1300;
    t0 = Date.now();
    var iv = setInterval(function () { var p = Math.min(1, (Date.now() - t0) / dur); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p >= 1) clearInterval(iv); }, 30);
    b.textContent = '0' + suf;
  }
})();

// ===== Goya B: kartochka ustida renderlar almashadi =====
(function () {
  var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  var cards = [];
  document.querySelectorAll('.np-cover, .feat-cover').forEach(function (cover) {
    var card = cover.parentElement, base = cover.querySelector('img'); if (!base) return;
    var feat = cover.classList.contains('feat-cover');
    var links = card.querySelectorAll(feat ? '.feat-th a' : '.np-th a'); if (!links.length) return;
    var show = [base.getAttribute('src')], full = [cover.getAttribute('href')];
    links.forEach(function (a) { var im = a.querySelector('img'); show.push(feat ? a.getAttribute('href') : (im ? im.getAttribute('src') : a.getAttribute('href'))); full.push(a.getAttribute('href')); });
    var top = document.createElement('img'); top.className = 'cyc'; top.alt = base.alt; top.style.opacity = 0;
    base.classList.add('cyc0'); base.parentNode.insertBefore(top, base.nextSibling); cover.classList.add('cyc-on');
    var dots = document.createElement('div'); dots.className = 'cyc-dots';
    show.forEach(function (_, i) { var d = document.createElement('i'); if (!i) d.className = 'on'; dots.appendChild(d); });
    cover.appendChild(dots);
    var st = { i: 0, front: base, back: top, timer: null, cover: cover };
    function next() {
      var j = (st.i + 1) % show.length, back = st.back, front = st.front;
      back.onload = function () { back.style.opacity = 1; front.style.opacity = 0; st.front = back; st.back = front; };
      back.src = show[j]; st.i = j; cover.setAttribute('href', full[j]);
      Array.prototype.forEach.call(dots.children, function (d, k) { d.className = k === j ? 'on' : ''; });
    }
    st.start = function () { if (!st.timer) { next(); st.timer = setInterval(next, touch ? 2600 : 1400); } };
    st.stop = function () { clearInterval(st.timer); st.timer = null; };
    if (!touch) { cover.addEventListener('mouseenter', st.start); cover.addEventListener('mouseleave', st.stop); }
    cards.push(st);
  });
  if (touch && cards.length) setInterval(function () {
    var vh = window.innerHeight, vw = window.innerWidth;
    cards.forEach(function (st) { var r = st.cover.getBoundingClientRect(); var vis = r.width > 0 && r.top < vh * .8 && r.bottom > vh * .2 && r.left < vw && r.right > 0; if (vis) st.start(); else st.stop(); });
  }, 500);
})();

// ===== Jonli animatsiyalar + uslub almashtirgich =====
(function () {
  var doc = document.documentElement, reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  var lang = (doc.getAttribute('lang') || 'uz').slice(0, 2);

  // uslub almashtirgich olib tashlandi (2026-11-13) - sayt "Yorug'" uslubda
  try { localStorage.removeItem('ansorUslub'); } catch (e) {} doc.removeAttribute('data-uslub');

  if (reduce) return;

  // 2) yuqorida o'qish chizig'i
  var prog = document.createElement('div'); prog.id = 'prog'; document.body.appendChild(prog);

  // 3) sarlavhalarni so'zlarga ajratish (bo'lim ko'ringanda ko'tariladi)
  document.querySelectorAll('.sec-head h2').forEach(function (h) {
    if (h.children.length) return;
    var w = h.textContent.trim().split(/\s+/);
    h.innerHTML = w.map(function (x, k) { return '<span class="hw"><i style="--k:' + k + '">' + x.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</i></span>'; }).join(' ');
  });

  // 4) parallaks: rasmlar skroll bilan sekin siljiydi
  var pxEls = [];
  function collect() { pxEls = Array.prototype.slice.call(document.querySelectorAll('.proj .ph img, .np-cover img, .feat-cover img')); pxEls.forEach(function (im) { im.classList.add('px'); }); }
  collect(); setTimeout(collect, 1500);
  var hero = document.querySelector('.hero-r');

  var busy = false;
  function frame() {
    busy = false;
    var vh = window.innerHeight, sy = window.scrollY || doc.scrollTop, max = (doc.scrollHeight - vh) || 1;
    prog.style.transform = 'scaleX(' + Math.min(1, sy / max) + ')';
    for (var i = 0; i < pxEls.length; i++) {
      var r = pxEls[i].parentElement.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      var p = ((r.top + r.height / 2) - vh / 2) / vh;          // -1 .. 1
      pxEls[i].style.setProperty('--py', (-p * 34).toFixed(1) + 'px');
    }
    if (hero && sy < vh * 1.2) hero.style.setProperty('--hy', (sy * 0.25).toFixed(1) + 'px');
  }
  function tick() { if (!busy) { busy = true; (window.requestAnimationFrame || setTimeout)(frame, 16); } }
  window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick); frame();
  setInterval(frame, 400);   // zaxira

  // 5) kartochkada sichqoncha ortidan yorug'lik
  if (!touch) document.addEventListener('mousemove', function (e) {
    var c = e.target.closest && e.target.closest('.card,.proj,.np,.region,.ps-i,.feat'); if (!c) return;
    var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();

// ===== Chizmalar oynasi (modal) =====
(function () {
  function lbOpen() { var lb = document.querySelector('.lb'); return lb && lb.classList.contains('open'); }
  document.querySelectorAll('.feat-ar, .at-wrap').forEach(function (w) {
    var btn = w.querySelector('.ar-open'), m = w.querySelector('.ar-modal'); if (!btn || !m) return;
    document.body.appendChild(m);                       // kartochka tashqarisiga (clip/transform ta'sir qilmasin)
    function open() { m.hidden = false; document.body.style.overflow = 'hidden'; var x = m.querySelector('.ar-x'); if (x) x.focus(); }
    function close() { m.hidden = true; document.body.style.overflow = ''; btn.focus(); }
    btn.addEventListener('click', open);
    m.querySelector('.ar-x').addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden && !lbOpen()) close(); });
  });
})();

// ===== Ariza qoldirish (loyiha buyurtma) =====
// ARIZA_URL bo'sh bo'lsa: ariza matni nusxalanadi va Telegram ochiladi.
// Keyin email xizmati ulansa (masalan Web3Forms/FormSubmit) shu yerga manzil yoziladi va ariza to'g'ridan-to'g'ri yuboriladi.
(function () {
  var ARIZA_URL = '';
  var lang = (document.documentElement.getAttribute('lang') || 'uz').slice(0, 2);
  var L = {
    uz: { t: 'Loyiha uchun ariza', s: 'Ma’lumotlaringizni qoldiring — mutaxassisimiz siz bilan bog‘lanadi.', name: 'Ismingiz', tel: 'Telefon raqamingiz', type: 'Obyekt turi',
          types: ['Ko‘p qavatli turar-joy', 'Xususiy uy', 'Jamoat binosi (maktab, bog‘cha, savdo)', 'Ofis / ma’muriy bino', 'Boshqa'],
          need: 'Nima kerak', needs: ['To‘liq loyiha (barcha bo‘limlar)', 'Arxitektura', 'Konstruksiya', 'Muhandislik tarmoqlari', 'Interyer dizayni', '3D vizualizatsiya', 'Smeta'],
          place: 'Joylashuv (shahar, tuman)', note: 'Qo‘shimcha ma’lumot', send: 'Ariza yuborish', proj: 'Namuna loyiha',
          okT: 'Rahmat! Arizangiz tayyor', okCopy: 'Ariza matni nusxalandi va Telegram ochildi. Xabar maydoniga joylashtiring (Ctrl+V yoki “Вставить”) va yuboring.',
          okSent: 'Arizangiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.', call: 'Yoki qo‘ng‘iroq qiling', tg: 'Telegram’ni ochish', err: 'Ism va telefon raqamini kiriting', close: 'Yopish', head: 'Yangi ariza (sayt)' },
    ru: { t: 'Заявка на проект', s: 'Оставьте свои данные — наш специалист свяжется с вами.', name: 'Ваше имя', tel: 'Номер телефона', type: 'Тип объекта',
          types: ['Многоэтажный жилой дом', 'Частный дом', 'Общественное здание (школа, детсад, торговля)', 'Офис / административное здание', 'Другое'],
          need: 'Что нужно', needs: ['Полный проект (все разделы)', 'Архитектура', 'Конструкции', 'Инженерные сети', 'Дизайн интерьера', '3D-визуализация', 'Смета'],
          place: 'Расположение (город, район)', note: 'Дополнительно', send: 'Отправить заявку', proj: 'Пример проекта',
          okT: 'Спасибо! Заявка готова', okCopy: 'Текст заявки скопирован, Telegram открыт. Вставьте его в поле сообщения (Ctrl+V) и отправьте.',
          okSent: 'Заявка принята. Мы скоро свяжемся с вами.', call: 'Или позвоните', tg: 'Открыть Telegram', err: 'Укажите имя и телефон', close: 'Закрыть', head: 'Новая заявка (сайт)' },
    en: { t: 'Project request', s: 'Leave your details and our specialist will get in touch.', name: 'Your name', tel: 'Phone number', type: 'Building type',
          types: ['Multi-storey residential', 'Private house', 'Public building (school, kindergarten, retail)', 'Office / administrative', 'Other'],
          need: 'What you need', needs: ['Full design package (all sections)', 'Architecture', 'Structures', 'Engineering systems', 'Interior design', '3D visualization', 'Cost estimate'],
          place: 'Location (city, district)', note: 'Anything else', send: 'Send request', proj: 'Reference project',
          okT: 'Thank you! Your request is ready', okCopy: 'The request text was copied and Telegram opened. Paste it into the message box (Ctrl+V) and send.',
          okSent: 'Your request has been received. We will contact you soon.', call: 'Or call us', tg: 'Open Telegram', err: 'Please enter your name and phone', close: 'Close', head: 'New request (website)' }
  }[lang] || null;
  if (!L) return;
  var tgA = document.querySelector('.fab .f-tg'), telA = document.querySelector('.fab .f-tel');
  var tgUrl = tgA ? tgA.getAttribute('href') : '', telUrl = telA ? telA.getAttribute('href') : '';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var m = document.createElement('div'); m.className = 'ar-modal az-modal'; m.hidden = true; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', L.t);
  m.innerHTML = '<div class="ar-box az-box"><button type="button" class="ar-x" aria-label="' + L.close + '">&times;</button>' +
    '<form class="az-f" novalidate><h4>' + L.t + '</h4><p class="az-s">' + L.s + '</p>' +
    '<p class="az-proj" hidden></p>' +
    '<div class="az-row"><label>' + L.name + ' *<input name="ism" autocomplete="name" required></label>' +
    '<label>' + L.tel + ' *<input name="tel" type="tel" autocomplete="tel" inputmode="tel" placeholder="+998 __ ___ __ __" required></label></div>' +
    '<label>' + L.type + '<select name="tur">' + L.types.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
    '<fieldset><legend>' + L.need + '</legend><div class="az-ch">' + L.needs.map(function (x, i) { return '<label><input type="checkbox" name="kerak" value="' + esc(x) + '"' + (i ? '' : ' checked') + '><span>' + esc(x) + '</span></label>'; }).join('') + '</div></fieldset>' +
    '<label>' + L.place + '<input name="joy"></label>' +
    '<label>' + L.note + '<textarea name="izoh" rows="3"></textarea></label>' +
    '<p class="az-err" hidden>' + L.err + '</p>' +
    '<button type="submit" class="btn gold az-send">' + L.send + ' &rarr;</button></form>' +
    '<div class="az-ok" hidden><div class="az-tick">&#10003;</div><h4>' + L.okT + '</h4><p class="az-okt"></p><div class="az-okb"></div></div></div>';
  document.body.appendChild(m);
  var f = m.querySelector('.az-f'), ok = m.querySelector('.az-ok'), projP = m.querySelector('.az-proj'), proj = '';

  function open(p) {
    proj = p || ''; projP.hidden = !proj; projP.textContent = proj ? L.proj + ': ' + proj : '';
    f.hidden = false; ok.hidden = true; m.querySelector('.az-err').hidden = true;
    m.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(function () { f.querySelector('input[name=ism]').focus(); }, 50);
  }
  function close() { m.hidden = true; document.body.style.overflow = ''; }
  m.querySelector('.ar-x').addEventListener('click', close);
  m.addEventListener('click', function (e) { if (e.target === m) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) close(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-ariza]'); if (!a) return;
    e.preventDefault(); open(a.getAttribute('data-loyiha') || '');
  });

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(f), ism = (d.get('ism') || '').trim(), tel = (d.get('tel') || '').trim();
    if (!ism || tel.replace(/\D/g, '').length < 7) { m.querySelector('.az-err').hidden = false; return; }
    var kerak = d.getAll('kerak').join(', ');
    var lines = ['📝 ' + L.head, L.name + ': ' + ism, L.tel + ': ' + tel, L.type + ': ' + d.get('tur'), L.need + ': ' + (kerak || '—')];
    if (d.get('joy')) lines.push(L.place + ': ' + d.get('joy'));
    if (proj) lines.push(L.proj + ': ' + proj);
    if (d.get('izoh')) lines.push(L.note + ': ' + d.get('izoh'));
    var text = lines.join('\n');
    var okt = m.querySelector('.az-okt'), okb = m.querySelector('.az-okb');
    function done(sent) {
      f.hidden = true; ok.hidden = false;
      okt.textContent = sent ? L.okSent : L.okCopy;
      okb.innerHTML = (sent ? '' : (tgUrl ? '<a class="btn gold" href="' + tgUrl + '" target="_blank" rel="noopener">' + L.tg + '</a>' : '')) +
        (telUrl ? '<a class="btn ghost-d" href="' + telUrl + '">' + L.call + '</a>' : '');
    }
    if (ARIZA_URL) {
      d.append('xabar', text); d.append('til', lang); if (proj) d.append('loyiha', proj);
      fetch(ARIZA_URL, { method: 'POST', body: d, headers: { Accept: 'application/json' } }).then(function (r) { done(r.ok); if (!r.ok) fallback(); }).catch(function () { done(false); fallback(); });
    } else { fallback(); done(false); }
    function fallback() {
      try { navigator.clipboard.writeText(text); } catch (x) {}
      if (tgUrl) window.open(tgUrl, '_blank', 'noopener');
    }
  });
})();

// ===== Yozuv "yozilayotgandek" chiqadi =====
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function prep(el) {
    if (!el || el.children.length || el.classList.contains('tw')) return null;
    var txt = el.textContent; if (!txt.trim()) return null;
    el.classList.add('tw'); el.textContent = '';
    var v = document.createElement('span'); v.className = 'tw-v';
    var h = document.createElement('span'); h.className = 'tw-h'; h.textContent = txt;   // joy oldindan band - sahifa sakramaydi
    el.appendChild(v); el.appendChild(h);
    return { el: el, v: v, h: h, txt: txt, started: false };
  }
  function type(o, speed, delay) {
    if (!o || o.started) return; o.started = true;
    setTimeout(function () {
      var i = 0, step = Math.max(1, Math.round(o.txt.length / 140));     // uzun matn ham ~2 soniyada tugaydi
      var iv = setInterval(function () {
        i = Math.min(o.txt.length, i + step);
        o.v.textContent = o.txt.slice(0, i); o.h.textContent = o.txt.slice(i);
        if (i >= o.txt.length) { clearInterval(iv); o.el.classList.add('tw-done'); }
      }, speed);
    }, delay || 0);
  }
  // bosh ekran: sarlavha so'zlaridan keyin
  var doc0 = document.documentElement; var intro = doc0.classList.contains('has-intro');
  var hero = document.querySelector('.hero-r');
  if (hero) {
    var he = prep(hero.querySelector('.eyebrow')), hl = prep(hero.querySelector('.lead'));
    var heroGo = function () { type(he, 35, 250); type(hl, 14, 1000); };
    if (intro) { var wi = setInterval(function () { if (doc0.classList.contains('intro-out')) { clearInterval(wi); heroGo(); } }, 100); } else { type(he, 35, 100); type(hl, 14, 900); }
  }
  // bo'limlar: sarlavha ko'ringanda eyebrow va lead yoziladi
  var list = [];
  document.querySelectorAll('.sec-head').forEach(function (s) {
    list.push({ s: s, e: prep(s.querySelector('.eyebrow')), l: prep(s.querySelector('.lead')) });
  });
  var iv = setInterval(function () {
    var left = 0;
    list.forEach(function (x) {
      if (x.done) return; left++;
      if (x.s.classList.contains('rv-in')) { x.done = true; type(x.e, 40, 0); type(x.l, 14, 350); }
    });
    if (!left) clearInterval(iv);
  }, 150);
})();

// ===== Studia-54: raqamlar sanog'i + tezkor ariza =====
(function () {
  // raqamlar ekranga kelganda sanaladi
  var items = Array.prototype.slice.call(document.querySelectorAll('.rq-i b[data-to]'));
  items.forEach(function (b) { var m = b.getAttribute('data-to').match(/^(\d+)(.*)$/); if (m) b.textContent = '0' + m[2]; });
  var iv = setInterval(function () {
    var vh = window.innerHeight;
    items = items.filter(function (b) {
      var r = b.getBoundingClientRect(); if (r.width === 0 || r.top > vh * .95 || r.bottom < 0) return true;
      var m = b.getAttribute('data-to').match(/^(\d+)(.*)$/); if (!m) return false;
      var to = +m[1], suf = m[2], t0 = Date.now();
      var c = setInterval(function () { var p = Math.min(1, (Date.now() - t0) / 1400); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p >= 1) clearInterval(c); }, 30);
      return false;
    });
    if (!items.length) clearInterval(iv);
  }, 200);
  // tezkor shakl -> to'liq ariza oynasi (ism/telefon bilan)
  document.querySelectorAll('.az-quick').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = document.createElement('a'); a.setAttribute('data-ariza', ''); a.href = '#'; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
      var full = document.querySelector('.az-modal .az-f'); if (!full) return;
      if (f.ism.value) full.ism.value = f.ism.value; if (f.tel.value) full.tel.value = f.tel.value;
      setTimeout(function () { (f.ism.value && f.tel.value ? full.querySelector('select') : full.ism).focus(); }, 80);
    });
  });
})();

// ===== Kirish ekrani: bosilganda ochiladi =====
(function () {
  var d = document.documentElement, el = document.getElementById('intro');
  if (!el || !d.classList.contains('has-intro')) return;
  var gone = false;
  function enter() { if (gone) return; gone = true; d.classList.add('intro-out'); setTimeout(function () { el.style.display = 'none'; }, 750); }
  el.addEventListener('click', enter);
  el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
  window.addEventListener('wheel', enter, { passive: true, once: true });
  window.addEventListener('touchmove', enter, { passive: true, once: true });
  document.addEventListener('keydown', function (e) { if (/^(ArrowDown|PageDown|End| )$/.test(e.key)) enter(); });
  setTimeout(function () { try { el.focus({ preventScroll: true }); } catch (x) {} }, 300);
})();

// ===== Telefon: davlat tanlash + avtomatik kod va format =====
(function () {
  var C = [ // [ISO, kod, format (# = raqam), nom uz/ru/en]
    ['UZ', '998', '## ### ## ##', 'O‘zbekiston', 'Узбекистан', 'Uzbekistan'],
    ['KZ', '7', '### ### ## ##', 'Qozog‘iston', 'Казахстан', 'Kazakhstan'],
    ['RU', '7', '### ### ## ##', 'Rossiya', 'Россия', 'Russia'],
    ['KG', '996', '### ### ###', 'Qirg‘iziston', 'Кыргызстан', 'Kyrgyzstan'],
    ['TJ', '992', '## ### ####', 'Tojikiston', 'Таджикистан', 'Tajikistan'],
    ['TM', '993', '## ######', 'Turkmaniston', 'Туркменистан', 'Turkmenistan'],
    ['AE', '971', '## ### ####', 'BAA', 'ОАЭ', 'UAE'],
    ['TR', '90', '### ### ## ##', 'Turkiya', 'Турция', 'Turkey'],
    ['US', '1', '### ### ####', 'AQSh', 'США', 'USA']
  ];
  var li = { uz: 3, ru: 4, en: 5 }[(document.documentElement.getAttribute('lang') || 'uz').slice(0, 2)] || 3;
  function fmt(c, digits) {
    var out = '', k = 0, p = c[2];
    for (var i = 0; i < p.length && k < digits.length; i++) out += p[i] === '#' ? digits[k++] : p[i];
    if (k < digits.length) out += digits.slice(k);
    return '+' + c[1] + (out ? ' ' + out : ' ');
  }
  function need(c) { return (c[2].match(/#/g) || []).length; }
  function enhance(inp) {
    if (inp.dataset.tel) return; inp.dataset.tel = '1';
    var wrap = document.createElement('div'); wrap.className = 'ph-wrap';
    var sel = document.createElement('select'); sel.className = 'ph-cc'; sel.setAttribute('aria-label', ['Davlat', 'Страна', 'Country'][li - 3]);
    C.forEach(function (c, i) { var o = document.createElement('option'); o.value = i; o.textContent = c[0] + ' +' + c[1]; o.title = c[li]; sel.appendChild(o); });
    inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(sel); wrap.appendChild(inp);
    inp.removeAttribute('placeholder');
    function cur() { return C[+sel.value]; }
    function ph() { var c = cur(); inp.placeholder = fmt(c, c[2].replace(/[^#]/g, '').replace(/#/g, '0')).replace(/0/g, '_'); }
    function apply() {
      var c = cur(), d = inp.value.replace(/\D/g, '');
      if (d.indexOf(c[1]) === 0) d = d.slice(c[1].length);
      while (d.length > need(c) && d.indexOf(c[1]) === 0) d = d.slice(c[1].length);   // to'liq raqam joylashtirilsa - kod takrorlanmasin
      d = d.slice(0, need(c));
      inp.value = fmt(c, d);
      inp.classList.toggle('ph-ok', d.length === need(c));
    }
    inp.addEventListener('focus', function () { if (!inp.value.trim()) inp.value = '+' + cur()[1] + ' '; setTimeout(function () { var n = inp.value.length; try { inp.setSelectionRange(n, n); } catch (x) {} }, 0); });
    inp.addEventListener('input', apply);
    inp.addEventListener('keydown', function (e) {                    // kodni o'chirib yuborishmasin
      var pre = '+' + cur()[1] + ' ';
      if ((e.key === 'Backspace' && inp.selectionStart <= pre.length && inp.selectionEnd <= pre.length)) e.preventDefault();
    });
    inp.addEventListener('blur', function () { if (inp.value.replace(/\D/g, '') === cur()[1]) inp.value = ''; });
    sel.addEventListener('change', function () { var d = inp.value.replace(/\D/g, ''); var old = inp.dataset.cc || '998'; if (d.indexOf(old) === 0) d = d.slice(old.length); inp.dataset.cc = cur()[1]; inp.value = d ? fmt(cur(), d.slice(0, need(cur()))) : ''; ph(); inp.focus(); });
    inp.dataset.cc = '998'; ph();
    inp._tel = { sel: sel, apply: apply };
  }
  document.querySelectorAll('input[type=tel]').forEach(enhance);
  // tezkor shakldan to'liq shaklga davlatni ham o'tkazish
  document.querySelectorAll('.az-quick').forEach(function (f) {
    f.addEventListener('submit', function () {
      var q = f.querySelector('input[type=tel]'), full = document.querySelector('.az-modal input[type=tel]');
      if (q && full && q._tel && full._tel) { full._tel.sel.value = q._tel.sel.value; full.dataset.cc = q.dataset.cc; full.value = q.value; full._tel.apply(); }
    }, true);
  });
})();

// ===== Davlat tanlash: bayroqli chiroyli ro'yxat (oddiy select o'rniga) =====
(function () {
  var F = {
    UZ: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.4" fill="#0099B5"/><rect y="13.6" width="30" height="6.4" fill="#1EB53A"/><rect y="6.1" width="30" height=".6" fill="#CE1126"/><rect y="13.3" width="30" height=".6" fill="#CE1126"/><circle cx="5" cy="3.2" r="2.2" fill="#fff"/><circle cx="5.9" cy="3.2" r="2" fill="#0099B5"/>',
    KZ: '<rect width="30" height="20" fill="#00AFCA"/><circle cx="15" cy="9" r="3.6" fill="#FEC50C"/><path d="M11 14.5q4 2 8 0" stroke="#FEC50C" stroke-width="1.2" fill="none"/><rect x="2" y="2" width="1.2" height="16" fill="#FEC50C"/>',
    RU: '<rect width="30" height="20" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#0039A6"/><rect y="13.33" width="30" height="6.67" fill="#D52B1E"/>',
    KG: '<rect width="30" height="20" fill="#E8112D"/><circle cx="15" cy="10" r="5" fill="#FFEF00"/><circle cx="15" cy="10" r="2.6" fill="#E8112D"/>',
    TJ: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="5.7" fill="#CC0000"/><rect y="14.3" width="30" height="5.7" fill="#006600"/><path d="M12.5 11h5l-.6-2-1.9 1.2-1.9-1.2z" fill="#F8C300"/>',
    TM: '<rect width="30" height="20" fill="#00843D"/><rect x="4" width="6" height="20" fill="#D22630"/><circle cx="19" cy="6" r="2.4" fill="#fff"/><circle cx="19.9" cy="6" r="2.1" fill="#00843D"/>',
    AE: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#00732F"/><rect y="13.33" width="30" height="6.67" fill="#000"/><rect width="8" height="20" fill="#FF0000"/>',
    TR: '<rect width="30" height="20" fill="#E30A17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#E30A17"/><path d="M17 10l3.2-1.1-2 2.7V8.4l2 2.7z" fill="#fff"/>',
    US: '<rect width="30" height="20" fill="#fff"/><g fill="#B22234"><rect height="1.54" width="30"/><rect y="3.08" height="1.54" width="30"/><rect y="6.16" height="1.54" width="30"/><rect y="9.24" height="1.54" width="30"/><rect y="12.32" height="1.54" width="30"/><rect y="15.4" height="1.54" width="30"/><rect y="18.46" height="1.54" width="30"/></g><rect width="13" height="10.8" fill="#3C3B6E"/>'
  };
  function flag(iso) { return '<svg class="cc-f" viewBox="0 0 30 20" aria-hidden="true">' + (F[iso] || '') + '</svg>'; }
  var open = null;
  function closeAll() { if (open) { open.classList.remove('on'); open.querySelector('.cc-btn').setAttribute('aria-expanded', 'false'); open = null; } }
  document.addEventListener('click', function (e) { if (open && !open.contains(e.target)) closeAll(); });
  document.querySelectorAll('select.ph-cc').forEach(function (sel) {
    if (sel.dataset.cc2) return; sel.dataset.cc2 = '1';
    var box = document.createElement('div'); box.className = 'cc';
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cc-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', sel.getAttribute('aria-label') || 'Country');
    var list = document.createElement('ul'); list.className = 'cc-list'; list.setAttribute('role', 'listbox');
    Array.prototype.forEach.call(sel.options, function (o, i) {
      var iso = o.textContent.split(' ')[0], code = o.textContent.split(' ')[1];
      var li = document.createElement('li'); li.setAttribute('role', 'option'); li.tabIndex = -1; li.dataset.i = i;
      li.innerHTML = flag(iso) + '<span class="cc-n">' + (o.title || iso) + '</span><span class="cc-c">' + code + '</span>';
      li.addEventListener('click', function () { choose(i); closeAll(); btn.focus(); });
      list.appendChild(li);
    });
    function paint() {
      var o = sel.options[sel.selectedIndex], iso = o.textContent.split(' ')[0], code = o.textContent.split(' ')[1];
      btn.innerHTML = flag(iso) + '<span class="cc-c">' + code + '</span><svg class="cc-ar" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>';
      Array.prototype.forEach.call(list.children, function (li, k) { li.setAttribute('aria-selected', k === sel.selectedIndex ? 'true' : 'false'); });
    }
    function choose(i) { if (+sel.value !== i) { sel.value = i; sel.dispatchEvent(new Event('change')); } paint(); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation(); var was = box.classList.contains('on'); closeAll();
      if (!was) { box.classList.add('on'); open = box; btn.setAttribute('aria-expanded', 'true'); var cur = list.children[sel.selectedIndex]; if (cur) { cur.focus(); cur.scrollIntoView({ block: 'nearest' }); } }
    });
    list.addEventListener('keydown', function (e) {
      var items = list.children, i = Array.prototype.indexOf.call(items, document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i >= 0) { choose(i); closeAll(); btn.focus(); } }
      else if (e.key === 'Escape' || e.key === 'Tab') { closeAll(); btn.focus(); }
    });
    sel.addEventListener('change', paint);
    sel.classList.add('cc-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(box, sel); box.appendChild(btn); box.appendChild(list); box.appendChild(sel);
    paint();
  });
})();

// ===== Kattalashtirilgan rasmda varaqlash (‹ › , klaviatura, surish) =====
(function () {
  var lb = document.querySelector('.lb'); if (!lb) return;
  var img = lb.querySelector('img'), list = [], pos = 0;
  var prev = document.createElement('button'), next = document.createElement('button'), cnt = document.createElement('span');
  prev.type = next.type = 'button'; prev.className = 'lb-nav lb-prev'; next.className = 'lb-nav lb-next'; cnt.className = 'lb-cnt';
  prev.innerHTML = '&#8249;'; next.innerHTML = '&#8250;'; prev.setAttribute('aria-label', 'Oldingi'); next.setAttribute('aria-label', 'Keyingi');
  lb.appendChild(prev); lb.appendChild(next); lb.appendChild(cnt);
  function show(i) { if (!list.length) return; pos = (i + list.length) % list.length; img.src = list[pos]; cnt.textContent = (pos + 1) + ' / ' + list.length; }
  function upd() { var many = list.length > 1; prev.style.display = next.style.display = cnt.style.display = many ? '' : 'none'; }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.gal a, a[data-lb]'); if (!a) return;
    var box = a.closest('.np, .feat, .ar-box, .gal, .proj') || document;
    var seen = {}; list = [];
    Array.prototype.forEach.call(box.querySelectorAll(box.classList && box.classList.contains('gal') ? 'a:not(.hide)' : 'a[data-lb]'), function (x) {
      var h = x.getAttribute('href'); if (h && !seen[h]) { seen[h] = 1; list.push(h); }
    });
    pos = Math.max(0, list.indexOf(a.getAttribute('href'))); cnt.textContent = (pos + 1) + ' / ' + list.length; upd();
  });
  prev.addEventListener('click', function (e) { e.stopPropagation(); show(pos - 1); });
  next.addEventListener('click', function (e) { e.stopPropagation(); show(pos + 1); });
  img.addEventListener('click', function (e) { if (list.length > 1) { e.stopPropagation(); show(pos + 1); } });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight') show(pos + 1); else if (e.key === 'ArrowLeft') show(pos - 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) { show(pos + (dx < 0 ? 1 : -1)); } }, { passive: true });
})();

// ===== Himoya: "parda" animatsiyasi to'xtab qolsa, 2.5 s dan keyin rasm baribir ochiladi =====
(function () {
  setInterval(function () {
    var now = Date.now();
    document.querySelectorAll('.rv-in:not(.rv-done)').forEach(function (el) {
      if (!el._t) el._t = now; else if (now - el._t > 2500) el.classList.add('rv-done');
    });
  }, 500);
})();
