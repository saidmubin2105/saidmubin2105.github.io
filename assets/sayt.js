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
