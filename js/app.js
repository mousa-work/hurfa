/* ============================================
   حُرفة — المنطق المشترك بين الصفحات
   (جلسة المستخدم، الترويسة، المفضلة، الطلبات)
   ============================================ */

const LS = {
  users: 'hurfa_users',
  session: 'hurfa_session',
  favs: 'hurfa_favs',
  orders: 'hurfa_orders',
  myGigs: 'hurfa_my_gigs',
  messages: 'hurfa_messages',
};

function lsGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ---------- الجلسة ---------- */
function getUser() { return lsGet(LS.session, null); }
function setUser(u) { lsSet(LS.session, u); }
function logout() {
  localStorage.removeItem(LS.session);
  location.href = 'index.html';
}
function requireLogin() {
  if (!getUser()) {
    const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    location.href = 'login.html?next=' + next;
    return false;
  }
  return true;
}

/* ---------- أدوات مساعدة ---------- */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
function param(name) { return new URLSearchParams(location.search).get(name); }
function avatarColor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]).join('');
}
function avatarHtml(name, cls = '') {
  return `<span class="avatar ${cls}" style="background:${avatarColor(name)}">${esc(initials(name))}</span>`;
}
function starsHtml(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
function gradStyle(i) {
  const g = GRADS[i % GRADS.length];
  return `background:linear-gradient(135deg, ${g[0]}, ${g[1]})`;
}
function catById(id) { return CATEGORIES.find(c => c.id === id); }
function sellerById(id) { return SELLERS.find(s => s.id === id); }

/* ---------- الخدمات (الأساسية + المضافة من المستخدم) ---------- */
function myGigs() { return lsGet(LS.myGigs, []); }
function allGigs() { return [...GIGS, ...myGigs()]; }
function gigById(id) { return allGigs().find(g => String(g.id) === String(id)); }
function saveMyGig(gig) {
  const gigs = myGigs();
  gigs.push(gig);
  lsSet(LS.myGigs, gigs);
}
function deleteMyGig(id) {
  lsSet(LS.myGigs, myGigs().filter(g => String(g.id) !== String(id)));
}
/* بائع الخدمة — للخدمات المضافة من المستخدم نبني بطاقة بائع من بيانات حسابه */
function gigSeller(gig) {
  if (gig.custom) {
    return {
      id: 0, name: gig.sellerName, title: 'عضو في حُرفة', level: 'بائع جديد',
      country: '—', since: new Date().getFullYear(), response: 'ساعة واحدة',
      rating: gig.rating, sales: 0,
      bio: 'بائع جديد انضم إلى حُرفة وبدأ رحلته في العمل الحر.',
    };
  }
  return sellerById(gig.sellerId);
}

/* ---------- المفضلة ---------- */
function getFavs() { return lsGet(LS.favs, []); }
function isFav(id) { return getFavs().some(f => String(f) === String(id)); }
function toggleFav(id, btn) {
  let favs = getFavs();
  if (isFav(id)) {
    favs = favs.filter(f => String(f) !== String(id));
    toast('أُزيلت الخدمة من المفضلة');
  } else {
    favs.push(id);
    toast('أُضيفت الخدمة إلى المفضلة ❤️');
  }
  lsSet(LS.favs, favs);
  if (btn) btn.classList.toggle('active', isFav(id));
}

/* ---------- الطلبات ---------- */
function getOrders() { return lsGet(LS.orders, []); }
function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  lsSet(LS.orders, orders);
}
function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const o = orders.find(x => x.id === orderId);
  if (o) { o.status = status; lsSet(LS.orders, orders); }
}

/* ---------- الرسائل ---------- */
function addMessage(msg) {
  const msgs = lsGet(LS.messages, []);
  msgs.unshift(msg);
  lsSet(LS.messages, msgs);
}

/* ---------- بطاقة خدمة (HTML) ---------- */
function gigCardHtml(gig) {
  const seller = gigSeller(gig);
  const fav = isFav(gig.id) ? 'active' : '';
  return `
  <article class="gig-card">
    <div class="gig-thumb" style="${gradStyle(gig.grad)}">
      <a href="gig.html?id=${gig.id}" class="emoji" aria-label="${esc(gig.title)}">${gig.icon}</a>
      <button class="fav-btn ${fav}" onclick="toggleFav('${gig.id}', this)" title="أضف إلى المفضلة">♥</button>
    </div>
    <div class="gig-body">
      <div class="gig-seller">
        ${avatarHtml(seller.name)}
        <div>
          <b>${esc(seller.name)}</b><br>
          <small>${esc(seller.level)}</small>
        </div>
      </div>
      <a class="gig-title" href="gig.html?id=${gig.id}">${esc(gig.title)}</a>
      <div class="gig-rating">
        <span class="star">★</span><b>${gig.rating.toFixed(1)}</b><span>(${gig.reviews})</span>
      </div>
      <div class="gig-foot">
        <small>يبدأ من</small>
        <span class="price">${money(gig.packages.basic.price)}</span>
      </div>
    </div>
  </article>`;
}

/* ---------- الترويسة والتذييل ---------- */
function renderHeader(activeCat) {
  const mount = document.getElementById('header');
  if (!mount) return;
  const user = getUser();
  const q = param('q') || '';

  const authArea = user ? `
    <div class="user-menu">
      <button class="user-avatar-btn" id="userMenuBtn">
        ${avatarHtml(user.name)}
        <span>${esc(user.name.split(' ')[0])}</span> ▾
      </button>
      <div class="user-dropdown" id="userDropdown">
        <a href="dashboard.html">📊 لوحة التحكم</a>
        <a href="dashboard.html?tab=orders">📦 طلباتي</a>
        <a href="dashboard.html?tab=favs">❤️ المفضلة</a>
        <a href="create-gig.html">➕ أضف خدمة</a>
        <div class="sep"></div>
        <button onclick="logout()">🚪 تسجيل الخروج</button>
      </div>
    </div>` : `
    <a href="login.html">تسجيل الدخول</a>
    <a href="register.html" class="btn btn-outline btn-sm">إنشاء حساب</a>`;

  mount.innerHTML = `
  <header class="site-header">
    <div class="container header-inner">
      <a href="index.html" class="logo">حُرفة<span class="dot">.</span></a>
      <form class="header-search" action="browse.html" method="get">
        <input type="text" name="q" placeholder="ما الخدمة التي تبحث عنها اليوم؟" value="${esc(q)}">
        <button type="submit" aria-label="بحث">🔍</button>
      </form>
      <button class="menu-btn" id="menuBtn" aria-label="القائمة">☰</button>
      <nav class="header-nav" id="headerNav">
        <a href="browse.html">تصفح الخدمات</a>
        <a href="create-gig.html">كن بائعاً</a>
        ${authArea}
      </nav>
    </div>
    <div class="cat-bar">
      <div class="cat-bar-inner">
        ${CATEGORIES.map(c => `<a href="browse.html?cat=${c.id}" class="${activeCat === c.id ? 'active' : ''}">${c.icon} ${c.name}</a>`).join('')}
      </div>
    </div>
  </header>`;

  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('headerNav');
  if (menuBtn) menuBtn.addEventListener('click', () => nav.classList.toggle('open'));

  const umBtn = document.getElementById('userMenuBtn');
  const dd = document.getElementById('userDropdown');
  if (umBtn) {
    umBtn.addEventListener('click', e => { e.stopPropagation(); dd.classList.toggle('open'); });
    document.addEventListener('click', () => dd.classList.remove('open'));
  }
}

function renderFooter() {
  const mount = document.getElementById('footer');
  if (!mount) return;
  mount.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo">حُرفة<span class="dot">.</span></a>
          <p>سوق عربي للخدمات المصغّرة يجمع أصحاب المشاريع بأمهر المستقلين في الوطن العربي. اطلب خدمتك بثقة، وادفع بأمان.</p>
        </div>
        <div>
          <h4>التصنيفات</h4>
          <ul>
            ${CATEGORIES.slice(0, 5).map(c => `<li><a href="browse.html?cat=${c.id}">${c.name}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4>عن حُرفة</h4>
          <ul>
            <li><a href="index.html#how">كيف تعمل المنصة</a></li>
            <li><a href="create-gig.html">اعمل كمستقل</a></li>
            <li><a href="browse.html">تصفح الخدمات</a></li>
            <li><a href="register.html">انضم إلينا</a></li>
          </ul>
        </div>
        <div>
          <h4>الدعم</h4>
          <ul>
            <li><a href="#">مركز المساعدة</a></li>
            <li><a href="#">الشروط والأحكام</a></li>
            <li><a href="#">سياسة الخصوصية</a></li>
            <li><a href="#">تواصل معنا</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} حُرفة — جميع الحقوق محفوظة</span>
        <div class="socials">
          <a href="#" aria-label="تويتر">𝕏</a>
          <a href="#" aria-label="انستغرام">📷</a>
          <a href="#" aria-label="لينكدإن">in</a>
          <a href="#" aria-label="يوتيوب">▶</a>
        </div>
      </div>
    </div>
  </footer>`;
}

/* ---------- توست ---------- */
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- تقييمات ثابتة لكل خدمة ---------- */
function gigReviews(gig) {
  const seed = Number(gig.id) || 1;
  const count = 3 + (seed % 3); // 3 إلى 5 تقييمات
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      name: REVIEW_NAMES[(seed * 3 + i * 7) % REVIEW_NAMES.length],
      text: REVIEW_TEXTS[(seed * 5 + i * 3) % REVIEW_TEXTS.length],
      date: REVIEW_DATES[(seed + i * 2) % REVIEW_DATES.length],
      stars: (seed + i) % 4 === 0 ? 4 : 5,
    });
  }
  return out;
}
