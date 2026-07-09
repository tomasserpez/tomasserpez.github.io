/* ─── INSTAGRAM CLONE — app.js ────────────────── */

const GRADIENTS = ['g0','g1','g2','g3','g4','g5','g6','g7'];
function userGradient(u) { let h=0; for(const c of String(u)) h=(h*31+c.charCodeAt(0))&0xff; return GRADIENTS[h%GRADIENTS.length]; }
function userInitial(u) { return String(u)[0].toUpperCase(); }
function formatNumber(n) {
  if(n>=1_000_000) return (n/1_000_000).toFixed(1).replace('.0','')+'M';
  if(n>=1_000) return (n/1_000).toFixed(1).replace('.0','')+' mil';
  return String(n);
}
function timeAgo(d) {
  const parsed = new Date(d);
  if (isNaN(parsed)) return d;
  const s=Math.floor((Date.now()-parsed)/1000);
  if(s<60) return 'Ahora';
  const m=Math.floor(s/60); if(m<60) return `${m}m`;
  const h=Math.floor(m/60); if(h<24) return `${h}h`;
  const dy=Math.floor(h/24); if(dy<7) return `${dy}d`;
  const w=Math.floor(dy/7); if(w<5) return `${w}sem`;
  return parsed.toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}
function timeAgoLong(d) {
  const parsed = new Date(d);
  if (isNaN(parsed)) return d;
  const s=Math.floor((Date.now()-parsed)/1000);
  if(s<60) return 'justo ahora';
  const m=Math.floor(s/60); if(m<60) return `hace ${m} min`;
  const h=Math.floor(m/60); if(h<24) return `hace ${h} h`;
  const dy=Math.floor(h/24); if(dy<7) return `hace ${dy} días`;
  return parsed.toLocaleDateString('es-ES',{day:'numeric',month:'long'});
}

const verifiedSVG = `<svg style="width:12px;height:12px;flex-shrink:0" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#0095f6"/><path d="M16.5 27.5 9 20l2.5-2.5 5 5 12-12 2.5 2.5z" fill="white"/></svg>`;

function avatarEl(username, avatar, size=44, fontSize=17) {
  const g = userGradient(username);
  const style = `width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:700;color:white;position:relative;overflow:hidden;flex-shrink:0`;
  // Only add <img> if a real path is provided — avoids 404s when files don't exist yet
  const imgTag = avatar ? `<img src="${avatar}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.remove()">` : '';
  return `<div class="gradient-avatar ${g}" style="${style}">${imgTag}${userInitial(username)}</div>`;
}

/* ────────────────────────────────────────────────
   DATA STORES
──────────────────────────────────────────────── */
let feedData = [];
let reelsData = [];
let storiesData = [];
let notifData = [];
let messagesData = [];

const likedPosts   = new Set();
const savedPosts   = new Set();
const followingMap = new Set();

/* ────────────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────────────── */
let currentPage = 'feed';

function navigate(page) {
  if (page === currentPage) return;
  if (currentPage === 'reels') pauseAllReels();

  document.querySelectorAll('.page').forEach(p => { p.hidden = true; p.classList.remove('active'); });
  const target = document.getElementById(`page-${page}`);
  if (!target) return;
  target.hidden = false;
  target.classList.add('active');

  document.querySelectorAll('.nav-trigger, .bn-item').forEach(el =>
    el.classList.toggle('active', el.dataset.page === page));

  currentPage = page;
  if (page === 'reels') initReelObserver();
}

document.querySelectorAll('.nav-trigger, .bn-item').forEach(el =>
  el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); }));

/* ────────────────────────────────────────────────
   STORIES  (from stories.json)
──────────────────────────────────────────────── */
function loadStories() {
  fetch('media/stories.json')
    .then(r => r.json())
    .then(data => { storiesData = data; renderStories(); })
    .catch(() => { storiesData = []; renderStories(); });
}

function renderStories() {
  const track = document.getElementById('stories-track');
  track.innerHTML = storiesData.map((s, i) => {
    const seen = s.seen && !s.isYou;
    const addBadge = s.isYou ? `<div class="story-add-badge">+</div>` : '';
    const ringClass = seen ? 'story-ring seen' : 'story-ring';
    return `
    <div class="story-item ${s.isYou ? 'your-story' : ''}" data-story-index="${i}" style="cursor:pointer">
      <div class="story-ring-wrap">
        <div class="${ringClass}">
          <div class="story-avatar">
            ${s.avatar
              ? `<img src="${s.avatar}" alt="${s.username}" onerror="this.remove()">`
              : `<span class="gradient-avatar ${userGradient(s.username)}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;border-radius:50%">${userInitial(s.username)}</span>`
            }
          </div>
        </div>
        ${addBadge}
      </div>
      <span class="story-username">${s.isYou ? 'Tu historia' : s.username}</span>
    </div>`;
  }).join('');

  track.querySelectorAll('.story-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.storyIndex);
      if (storiesData[idx].isYou) { alert('Crear historia'); return; }
      openStoryViewer(idx);
    });
  });
}

/* ────────────────────────────────────────────────
   STORY VIEWER
──────────────────────────────────────────────── */
let svStoryIndex = 0;
let svSlideIndex = 0;
let svTimer = null;
let svPaused = false;
let svActive = false;  // guard: prevents any action after close
let svStartX = 0;

function openStoryViewer(storyIndex) {
  svStoryIndex = storyIndex;
  svSlideIndex = 0;
  svActive = true;
  svPaused = false;
  buildStoryViewer();
  const v = document.getElementById('story-viewer');
  v.hidden = false;
  document.body.style.overflow = 'hidden';
  storiesData[svStoryIndex].seen = true;
  renderStories();
  playSlide();
}

function buildStoryViewer() {
  let el = document.getElementById('story-viewer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'story-viewer';
    document.body.appendChild(el);
  }
  const s = storiesData[svStoryIndex];
  const bars = s.slides.map((_,i) =>
    `<div class="sv-prog-bar"><div class="sv-prog-fill" id="sv-fill-${i}"></div></div>`).join('');

  el.innerHTML = `
    <div class="sv-backdrop" id="sv-backdrop"></div>
    <div class="sv-inner">
      <div class="sv-progress">${bars}</div>
      <div class="sv-header">
        ${avatarEl(s.username, s.avatar, 32, 12).replace('style="', 'class="sv-header-avatar" style="border:2px solid white;')}
        <span class="sv-header-name">${s.username}</span>
        <span class="sv-header-time" id="sv-time"></span>
        <button class="sv-more-btn" title="Más"><svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>
        <button class="sv-close-btn" id="sv-close" title="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="sv-content" id="sv-content"></div>
      <div class="sv-nav-prev" id="sv-prev"></div>
      <div class="sv-nav-next" id="sv-next"></div>
      <div class="sv-reply">
        <input type="text" placeholder="Responder a ${s.username}..." id="sv-reply-input">
        <button class="sv-reply-heart"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg></button>
        <button class="sv-reply-send"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white"/></svg></button>
      </div>
    </div>`;

  // Close — stopPropagation prevents mouseup bubbling to inner which would call svResume
  document.getElementById('sv-close').addEventListener('click', e => { e.stopPropagation(); closeStoryViewer(); });
  document.getElementById('sv-backdrop').addEventListener('click', closeStoryViewer);
  document.getElementById('sv-prev').addEventListener('click', e => { e.stopPropagation(); svNavigate(-1); });
  document.getElementById('sv-next').addEventListener('click', e => { e.stopPropagation(); svNavigate(1); });

  const inner = el.querySelector('.sv-inner');
  inner.addEventListener('mousedown',  svPause);
  inner.addEventListener('touchstart', e => { svStartX = e.touches[0].clientX; svPause(); }, {passive:true});
  inner.addEventListener('mouseup',    svResume);
  inner.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - svStartX;
    if (Math.abs(dx) > 50) { svResume(); svNavigate(dx < 0 ? 1 : -1); }
    else svResume();
  }, {passive:true});

  const inp = document.getElementById('sv-reply-input');
  inp.addEventListener('focus', svPause);
  inp.addEventListener('blur',  svResume);
}

function svPause() {
  if (!svActive) return;
  svPaused = true;
  clearTimeout(svTimer);
  const fill = document.getElementById(`sv-fill-${svSlideIndex}`);
  if (fill && fill.parentElement) {
    const pw = fill.parentElement.getBoundingClientRect().width;
    fill._pauseWidth = pw > 0 ? (fill.getBoundingClientRect().width / pw * 100) : 0;
    fill.style.transition = 'none';
    fill.style.width = fill._pauseWidth + '%';
  }
}

function svResume() {
  if (!svActive || !svPaused) return;
  svPaused = false;
  const s = storiesData[svStoryIndex];
  if (!s) return;
  const slide = s.slides[svSlideIndex];
  const fill = document.getElementById(`sv-fill-${svSlideIndex}`);
  if (!fill) return;
  const remaining = (1 - (fill._pauseWidth || 0) / 100) * (slide.duration || 5) * 1000;
  fill.style.transition = `width ${remaining}ms linear`;
  fill.style.width = '100%';
  svTimer = setTimeout(svNextSlide, remaining);
}

function playSlide() {
  if (!svActive) return;
  const s = storiesData[svStoryIndex];
  if (!s) return;
  const slide = s.slides[svSlideIndex];

  const timeEl = document.getElementById('sv-time');
  if (timeEl) timeEl.textContent = timeAgo(s.slides[0].date || new Date().toISOString());

  s.slides.forEach((_, i) => {
    const f = document.getElementById(`sv-fill-${i}`);
    if (!f) return;
    if (i < svSlideIndex)      { f.style.transition='none'; f.style.width='100%'; }
    else if (i > svSlideIndex) { f.style.transition='none'; f.style.width='0%'; }
  });

  const content = document.getElementById('sv-content');
  if (!content) return;
  const bg = slide.bgColor || '#1a1a1a';
  // Only add <img> if a real file path is provided
  const mediaTag = slide.file
    ? `<img src="${slide.file}" alt="" style="z-index:2;position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
    : '';
  content.innerHTML = `
    <div class="sv-bg" style="background:${bg};position:absolute;inset:0"></div>
    ${mediaTag}
    <div class="sv-text-overlay" style="color:${slide.textColor||'#fff'}">${slide.text||''}</div>`;

  const fill = document.getElementById(`sv-fill-${svSlideIndex}`);
  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!svActive) return;
      fill.style.transition = `width ${(slide.duration||5)*1000}ms linear`;
      fill.style.width = '100%';
    }));
  }

  clearTimeout(svTimer);
  svTimer = setTimeout(svNextSlide, (slide.duration||5)*1000);
}

function svNextSlide() {
  if (!svActive) return;
  const s = storiesData[svStoryIndex];
  if (svSlideIndex < s.slides.length - 1) { svSlideIndex++; playSlide(); }
  else svNavigate(1);
}

function svNavigate(dir) {
  if (!svActive) return;
  clearTimeout(svTimer);
  svPaused = false;
  if (dir === -1) {
    if (svSlideIndex > 0) { svSlideIndex--; playSlide(); return; }
    let prev = svStoryIndex - 1;
    while (prev >= 0 && storiesData[prev].isYou) prev--;
    if (prev >= 0) { svStoryIndex = prev; svSlideIndex = 0; storiesData[prev].seen = true; buildStoryViewer(); playSlide(); renderStories(); }
    else closeStoryViewer();
  } else {
    let next = svStoryIndex + 1;
    while (next < storiesData.length && storiesData[next].isYou) next++;
    if (next < storiesData.length) { svStoryIndex = next; svSlideIndex = 0; storiesData[next].seen = true; buildStoryViewer(); playSlide(); renderStories(); }
    else closeStoryViewer();
  }
}

function closeStoryViewer() {
  svActive = false;
  svPaused = false;
  clearTimeout(svTimer);
  const v = document.getElementById('story-viewer');
  if (v) v.hidden = true;
  document.body.style.overflow = '';
}

/* ────────────────────────────────────────────────
   FEED
──────────────────────────────────────────────── */
function loadFeed() {
  fetch('media/feed.json')
    .then(r => r.json())
    .then(data => { feedData = data; renderPosts(); renderSuggestions(); })
    .catch(() => { feedData = []; renderPosts(); renderSuggestions(); });
}

function renderPosts() {
  const c = document.getElementById('posts-container');
  c.innerHTML = feedData.map(p => buildPost(p)).join('');
  attachPostEvents();
}

function buildPost(post) {
  const isLiked = likedPosts.has(post.id);
  const isSaved = savedPosts.has(post.id);
  const isFollowing = followingMap.has(post.username);
  const g = userGradient(post.username);

  function ytId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  let mediaEl = '';
  if (post.type === 'youtube') {
    const id = ytId(post.file || '');
    if (id) {
      mediaEl = `
        <div class="yt-wrap">
          <iframe src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>`;
    } else {
      mediaEl = `<div class="media-placeholder gradient-avatar ${g}" style="display:flex;flex-direction:column;gap:10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
        <span style="font-size:12px">${post.title}</span></div>`;
    }
  } else if (post.type === 'video') {
    if (post.file) {
      mediaEl = `
        <video src="${post.file}" loop playsinline preload="none"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          onplay="this.classList.add('playing')" onpause="this.classList.remove('playing')"
          onclick="toggleFeedVideo(this)" class="feed-video"></video>
        <div class="media-placeholder gradient-avatar ${g}" style="display:none;flex-direction:column;gap:10px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
          <span style="font-size:12px">${post.title}</span>
        </div>
        <div class="video-play-btn"><svg viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></div>
        <button class="feed-mute-btn" onclick="toggleMute()" title="Audio">${muteIcon()}</button>
        <button class="feed-expand-btn" onclick="event.stopPropagation();openVideoLightbox(this.closest('.post-media').querySelector('.feed-video').src)" title="Expandir">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </button>`;
    } else {
      mediaEl = `
        <div class="media-placeholder gradient-avatar ${g}" style="display:flex;flex-direction:column;gap:10px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
          <span style="font-size:12px">${post.title}</span>
        </div>`;
    }
  } else {
    mediaEl = `
      ${post.file ? `<img src="${post.file}" alt="${post.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
      <div class="media-placeholder gradient-avatar ${g}" style="display:none;flex-direction:column;gap:10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
        </svg>
        <span style="font-size:12px">${post.title}</span>
      </div>`;
  }

  const desc = post.description || '';
  const MAX = 100;
  const captionHtml = desc.length > MAX
    ? `${desc.slice(0,MAX)}<span class="caption-more" data-id="${post.id}">... más</span><span class="caption-full" style="display:none">${desc.slice(MAX)}</span>`
    : desc;

  const likeCount = post.likes + (isLiked ? 1 : 0);

  return `
  <article class="post" data-id="${post.id}">
    <div class="post-header">
      <div class="post-avatar">${avatarEl(post.username, post.avatar, 32, 13)}</div>
      <div class="post-user-info">
        <div class="post-username">${post.username}${post.verified ? verifiedSVG : ''}</div>
        ${post.location ? `<div class="post-location">${post.location}</div>` : ''}
      </div>
      <button class="post-follow-btn ${isFollowing?'following':''}" data-username="${post.username}">
        ${isFollowing ? 'Siguiendo' : 'Seguir'}
      </button>
      <button class="post-more-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
    </div>

    <div class="post-media" data-id="${post.id}" data-type="${post.type}">${mediaEl}</div>

    <div class="post-actions">
      <button class="action-btn like-btn ${isLiked?'liked':''}" data-id="${post.id}">
        <svg viewBox="0 0 24 24" fill="${isLiked?'var(--red)':'none'}" stroke="${isLiked?'var(--red)':'currentColor'}" stroke-width="2">
          <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/>
        </svg>
      </button>
      <button class="action-btn comment-toggle-btn" data-id="${post.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/></svg>
      </button>
      <button class="action-btn" onclick="sharePost('${post.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
      <button class="action-btn post-save-btn ${isSaved?'saved':''}" data-id="${post.id}" style="margin-left:auto">
        <svg viewBox="0 0 24 24" fill="${isSaved?'currentColor':'none'}" stroke="currentColor" stroke-width="2">
          <polygon points="20 21 12 13.44 4 21 4 3 20 3"/>
        </svg>
      </button>
    </div>

    <div class="post-likes" id="likes-${post.id}">${formatNumber(likeCount)} Me gusta</div>
    <div class="post-caption">
      <span class="cap-user">${post.username}</span>
      <span class="cap-text">${captionHtml}</span>
    </div>
    <div class="post-comments-link" data-id="${post.id}">Ver los ${formatNumber(post.comments)} comentarios</div>
    <div class="post-comments" id="comments-${post.id}">
      <div class="comment-item">
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0" class="gradient-avatar g2">F</div>
        <div class="comment-text"><strong>fotografo_arg</strong> <span>¡Increíble foto! 😍</span></div>
      </div>
      <div class="comment-item">
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0" class="gradient-avatar g4">T</div>
        <div class="comment-text"><strong>traveler_mx</strong> <span>Me encanta este lugar 🌟</span></div>
      </div>
    </div>
    <div class="post-date">${timeAgoLong(post.date)}</div>
    <div class="post-add-comment">
      <input type="text" placeholder="Agregar un comentario...">
      <button class="post-btn">Publicar</button>
    </div>
  </article>`;
}

function attachPostEvents() {
  document.querySelectorAll('.like-btn').forEach(btn =>
    btn.addEventListener('click', () => toggleLike(btn.dataset.id, btn)));
  document.querySelectorAll('.post-save-btn').forEach(btn =>
    btn.addEventListener('click', () => toggleSave(btn.dataset.id, btn)));
  document.querySelectorAll('.post-follow-btn').forEach(btn =>
    btn.addEventListener('click', () => toggleFollow(btn.dataset.username, btn)));
  document.querySelectorAll('.comment-toggle-btn').forEach(btn =>
    btn.addEventListener('click', () => document.getElementById(`comments-${btn.dataset.id}`)?.classList.toggle('open')));
  document.querySelectorAll('.post-comments-link').forEach(el =>
    el.addEventListener('click', () => document.getElementById(`comments-${el.dataset.id}`)?.classList.toggle('open')));
  document.querySelectorAll('.caption-more').forEach(el =>
    el.addEventListener('click', () => { el.nextElementSibling.style.display='inline'; el.style.display='none'; }));
  document.querySelectorAll('.post-media').forEach(media => {
    let lastTap = 0;
    media.addEventListener('click', e => {
      const now = Date.now();
      if (now - lastTap < 300) {
        const id = media.dataset.id;
        const btn = document.querySelector(`.like-btn[data-id="${id}"]`);
        if (btn && !likedPosts.has(id)) { toggleLike(id, btn); showHeartBurst(e.clientX, e.clientY); }
      }
      lastTap = now;
    });
  });
}

function toggleLike(id, btn) {
  const post = feedData.find(p => p.id === id);
  if (!post) return;
  const on = likedPosts.has(id);
  if (on) { likedPosts.delete(id); btn.classList.remove('liked','like-animate'); btn.querySelector('svg').setAttribute('fill','none'); btn.querySelector('svg').setAttribute('stroke','currentColor'); }
  else { likedPosts.add(id); btn.classList.add('liked'); btn.classList.remove('like-animate'); void btn.offsetWidth; btn.classList.add('like-animate'); btn.querySelector('svg').setAttribute('fill','var(--red)'); btn.querySelector('svg').setAttribute('stroke','var(--red)'); }
  document.getElementById(`likes-${id}`).textContent = `${formatNumber(post.likes + (likedPosts.has(id)?1:0))} Me gusta`;
}
function toggleSave(id, btn) {
  if (savedPosts.has(id)) { savedPosts.delete(id); btn.querySelector('svg').setAttribute('fill','none'); }
  else { savedPosts.add(id); btn.querySelector('svg').setAttribute('fill','currentColor'); }
}
function toggleFollow(username, btn) {
  if (followingMap.has(username)) { followingMap.delete(username); btn.textContent='Seguir'; btn.classList.remove('following'); }
  else { followingMap.add(username); btn.textContent='Siguiendo'; btn.classList.add('following'); }
}
function sharePost(id) {
  if (navigator.share) navigator.share({title:'Instagram Clone', url:window.location.href}).catch(()=>{});
  else navigator.clipboard?.writeText(window.location.href).then(()=>alert('Enlace copiado')).catch(()=>{});
}
function toggleFeedVideo(v) { v.muted = isMuted; v.paused ? v.play() : v.pause(); }

/* ── VIDEO LIGHTBOX ───────────────────────────── */
(function() {
  const lb  = () => document.getElementById('video-lightbox');
  const vid = () => document.getElementById('vlb-video');
  const mut = () => document.getElementById('vlb-mute');

  function updateMuteBtn() {
    mut().innerHTML = isMuted
      ? `<svg viewBox="0 0 24 24" fill="none"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" stroke="white"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" stroke="white"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  let originVideo = null;

  window.openVideoLightbox = function(src) {
    // Pause whichever inline video has this src
    originVideo = [...document.querySelectorAll('.feed-video')].find(v => v.src === src) || null;
    if (originVideo) originVideo.pause();

    const v = vid();
    v.src = src;
    v.muted = isMuted;
    v.currentTime = originVideo ? originVideo.currentTime : 0;
    v.play().catch(() => {});
    updateMuteBtn();
    lb().hidden = false;
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    const v = vid();
    // Resume inline video from where lightbox left off
    if (originVideo) {
      originVideo.currentTime = v.currentTime;
      originVideo.muted = isMuted;
      originVideo.play().catch(() => {});
      originVideo = null;
    }
    v.pause();
    v.src = '';
    lb().hidden = true;
    document.body.style.overflow = '';
  }

  document.getElementById('vlb-close').addEventListener('click', closeLightbox);

  document.getElementById('vlb-mute').addEventListener('click', () => {
    isMuted = !isMuted;
    vid().muted = isMuted;
    document.querySelectorAll('.reel-video, .feed-video').forEach(v => v.muted = isMuted);
    document.querySelectorAll('.reel-mute-btn, .feed-mute-btn').forEach(b => b.innerHTML = muteIcon());
    updateMuteBtn();
  });

  document.getElementById('video-lightbox').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('video-lightbox').hidden) closeLightbox();
  });
})();
function showHeartBurst(x, y) {
  const el = document.getElementById('heart-burst');
  el.style.left = x+'px'; el.style.top = y+'px';
  el.hidden = false; el.classList.remove('animate');
  void el.offsetWidth; el.classList.add('animate');
  setTimeout(() => { el.hidden = true; el.classList.remove('animate'); }, 600);
}

function renderSuggestions() {
  const c = document.getElementById('suggestions-list');
  if (!c) return;
  const s = [
    {username:'tales_mileto', reason:'Seguido por El Socrates'},
    {username:'eraclito_efeso',    reason:'Sugerido para ti'},
    {username:'anaximenes_ok', reason:'Nuevo en Instagram'},
    {username:'pitagoras', reason:'Seguido por Aristoteles'},
    {username:'epicuro',   reason:'Sugerido para ti'},
    {username:'diogenes',   reason:'Sugerido para ti'},
  ];
  c.innerHTML = s.map(sg => `
    <div class="suggestion-item">
      ${avatarEl(sg.username, null, 32, 13)}
      <div class="sugg-info"><div class="sugg-username">${sg.username}</div><div class="sugg-reason">${sg.reason}</div></div>
      <button class="sugg-follow" onclick="this.textContent=this.textContent==='Seguir'?'Siguiendo':'Seguir'">Seguir</button>
    </div>`).join('');
}

/* ────────────────────────────────────────────────
   NOTIFICATIONS
──────────────────────────────────────────────── */
function loadNotifications() {
  fetch('media/notifications.json')
    .then(r => r.json())
    .then(data => { notifData = data; renderNotifications(); })
    .catch(() => { notifData = []; renderNotifications(); });
}

function renderNotifications() {
  const page = document.getElementById('page-notifications');
  if (!page) return;

  // Group by time
  const now = Date.now();
  const today = [], week = [], earlier = [];
  notifData.forEach(n => {
    const age = now - new Date(n.date);
    if (age < 86400000) today.push(n);
    else if (age < 7*86400000) week.push(n);
    else earlier.push(n);
  });

  const requests = notifData.filter(n => n.type === 'follow_request');
  const requestsBanner = requests.length ? buildFollowRequestsBanner(requests) : '';

  page.innerHTML = `
    <div class="notif-inner">
      ${requestsBanner}
      ${today.length ? `<div class="notif-section-title">Hoy</div>${today.map(buildNotifItem).join('')}` : ''}
      ${week.length  ? `<div class="notif-section-title">Esta semana</div>${week.map(buildNotifItem).join('')}` : ''}
      ${earlier.length ? `<div class="notif-section-title">Anteriores</div>${earlier.map(buildNotifItem).join('')}` : ''}
    </div>`;

  // Follow request button
  page.querySelector('.follow-requests-banner')?.addEventListener('click', () => openFollowRequestsModal(requests));
}

function buildFollowRequestsBanner(requests) {
  const first = requests[0], second = requests[1];
  const g1 = userGradient(first.username), g2 = second ? userGradient(second.username) : 'g3';
  return `
  <div class="follow-requests-banner">
    <div class="follow-req-avatars">
      <div class="fa1 gradient-avatar ${g1}">${avatarEl(first.username, first.avatar, 34, 13)}</div>
      ${second ? `<div class="fa2 gradient-avatar ${g2}">${avatarEl(second.username, second.avatar, 34, 13)}</div>` : ''}
    </div>
    <div class="follow-req-info">
      <strong>Solicitudes de seguimiento</strong>
      <span>${requests.length} solicitud${requests.length>1?'es':''} pendiente${requests.length>1?'s':''}</span>
    </div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;margin-left:auto;color:var(--text2)"><polyline points="9,18 15,12 9,6"/></svg>
  </div>`;
}

function buildNotifItem(n) {
  if (n.type === 'follow_request') return ''; // shown in banner
  const g = userGradient(n.username);
  const iconMap = {
    like: `<svg viewBox="0 0 24 24" fill="white"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="white"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/></svg>`,
    mention: `<svg viewBox="0 0 24 24" fill="white" style="font-size:9px"><text x="3" y="17" font-size="14" font-weight="700">@</text></svg>`,
    follow: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="7" r="4"/><path d="M2.5 21c0-5.25 4.25-9.5 9.5-9.5s9.5 4.25 9.5 9.5"/></svg>`,
  };
  const thumb = n.postThumb ? `
    <img src="${n.postThumb}" class="notif-post-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
    <div class="notif-post-thumb-placeholder gradient-avatar ${userGradient(n.username)}" style="display:none"></div>` : '';

  return `
  <div class="notif-item ${n.read?'':'unread'}">
    <div class="notif-avatar gradient-avatar ${g}" style="width:44px;height:44px">
      ${n.avatar ? `<img src="${n.avatar}" alt="" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%">` : ''}
      ${userInitial(n.username)}
      <div class="notif-type-icon ${n.type}">${iconMap[n.type]||''}</div>
    </div>
    <div class="notif-text">
      <span><strong>${n.username}</strong>${n.verified?verifiedSVG:''} ${n.text}</span>
      <div class="notif-time">${timeAgoLong(n.date)}</div>
    </div>
    ${thumb}
  </div>`;
}

function openFollowRequestsModal(requests) {
  let modal = document.getElementById('follow-requests-modal');
  if (modal) { modal.hidden = false; return; }
  modal = document.createElement('div');
  modal.id = 'follow-requests-modal';
  modal.innerHTML = `
    <div class="fr-modal-inner">
      <div class="fr-modal-header">
        <h2>Solicitudes de seguimiento</h2>
        <button class="fr-close-btn" id="fr-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      ${requests.map(r => `
      <div class="fr-item" id="fr-item-${r.id}">
        ${avatarEl(r.username, r.avatar, 44, 17)}
        <div class="fr-info">
          <div class="fr-username">${r.username}</div>
          <div class="fr-displayname">${r.displayName}</div>
        </div>
        <div class="fr-btns">
          <button class="notif-btn accept" onclick="acceptFollow('${r.id}', this)">Confirmar</button>
          <button class="notif-btn decline" onclick="declineFollow('${r.id}')">Eliminar</button>
        </div>
      </div>`).join('')}
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('fr-close').onclick = () => { modal.hidden = true; };
  modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
}

function acceptFollow(id, btn) {
  const item = document.getElementById(`fr-item-${id}`);
  btn.textContent = '✓ Confirmado'; btn.disabled = true; btn.style.opacity = '.6';
  const n = notifData.find(n => n.id === id);
  if (n) n._accepted = true;
  setTimeout(() => item?.remove(), 800);
}
function declineFollow(id) {
  document.getElementById(`fr-item-${id}`)?.remove();
}

/* ────────────────────────────────────────────────
   MESSAGES
──────────────────────────────────────────────── */
function loadMessages() {
  fetch('media/messages.json')
    .then(r => r.json())
    .then(data => { messagesData = data; renderMessagesList(); })
    .catch(() => { messagesData = []; renderMessagesList(); });
}

function renderMessagesList() {
  const page = document.getElementById('page-messages');
  if (!page) return;

  page.innerHTML = `
    <div class="messages-list-panel">
      <div class="messages-header">
        <h2>tu_usuario</h2>
        <button title="Nuevo mensaje">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
      </div>
      <div class="conv-list">
        ${messagesData.map(c => buildConvItem(c)).join('')}
      </div>
    </div>
    <div class="chat-panel" id="chat-panel">
      <div class="chat-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>Tus mensajes</p>
        <span>Enviá fotos y mensajes privados a un amigo o grupo.</span>
        <button onclick="alert('Enviar mensaje')">Enviar mensaje</button>
      </div>
    </div>`;

  page.querySelectorAll('.conv-item').forEach(el =>
    el.addEventListener('click', () => openChat(el.dataset.conv)));
}

function buildConvItem(conv) {
  const last = conv.messages[conv.messages.length - 1];
  const isUnread = conv.unread > 0;
  const g = userGradient(conv.username);
  return `
  <div class="conv-item" data-conv="${conv.id}">
    <div class="conv-avatar-wrap">
      <div class="conv-avatar gradient-avatar ${g}" style="width:56px;height:56px">
        ${conv.avatar ? `<img src="${conv.avatar}" alt="" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%">` : ''}
        ${userInitial(conv.username)}
      </div>
      ${conv.online ? '<div class="online-dot"></div>' : ''}
    </div>
    <div class="conv-info">
      <div class="conv-name-row">
        <span class="conv-name">${conv.displayName}</span>
        ${conv.verified ? verifiedSVG : ''}
        <span class="conv-time">${timeAgo(last.date)}</span>
      </div>
      <div class="conv-preview ${isUnread?'unread':''}">
        ${last.from === 'me' ? 'Tú: ' : ''}${last.text}
        ${isUnread ? `<span class="unread-badge">${conv.unread}</span>` : ''}
      </div>
    </div>
  </div>`;
}

function openChat(convId) {
  const conv = messagesData.find(c => c.id === convId);
  if (!conv) return;
  conv.unread = 0;

  // Active state
  document.querySelectorAll('.conv-item').forEach(el =>
    el.classList.toggle('active', el.dataset.conv === convId));

  const panel = document.getElementById('chat-panel');
  const g = userGradient(conv.username);

  // Group messages by day
  let lastDay = '', msgHtml = '';
  conv.messages.forEach(m => {
    const d = new Date(m.date);
    const dayStr = d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
    if (dayStr !== lastDay) { msgHtml += `<div class="chat-day-label">${dayStr}</div>`; lastDay = dayStr; }
    const isMe = m.from === 'me';
    const t = d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    msgHtml += `
      <div class="chat-bubble-wrap ${isMe?'me':'them'}">
        <div class="chat-bubble">${m.text}</div>
        <div class="chat-bubble-time">${t}</div>
      </div>`;
  });

  panel.innerHTML = `
    <div class="chat-header">
      <button class="chat-back-btn" onclick="closeChatMobile()" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>
      <div class="chat-header-avatar gradient-avatar ${g}" style="width:44px;height:44px">
        ${conv.avatar ? `<img src="${conv.avatar}" alt="" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%">` : ''}
        ${userInitial(conv.username)}
      </div>
      <div class="chat-header-info">
        <div class="chat-header-name">${conv.displayName}${conv.verified?verifiedSVG:''}</div>
        <div class="chat-header-status">${conv.online ? '<span style="color:#31c25d">● En línea</span>' : 'Instagram'}</div>
      </div>
      <div class="chat-header-actions">
        <button title="Llamada"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.14-1.14a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
        <button title="Video"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></button>
        <button title="Info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></button>
      </div>
    </div>
    <div class="chat-messages" id="chat-messages-area">${msgHtml}</div>
    <div class="chat-input-area">
      <button class="chat-icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
      <div class="chat-input-wrap">
        <input type="text" placeholder="Mensaje..." id="chat-msg-input" oninput="toggleSendBtn()">
        <button class="chat-emoji-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
      </div>
      <button class="chat-send-btn" id="chat-send-btn" onclick="sendMessage('${convId}')" disabled>Enviar</button>
    </div>`;

  // Scroll to bottom
  requestAnimationFrame(() => {
    const area = document.getElementById('chat-messages-area');
    if (area) area.scrollTop = area.scrollHeight;
  });

  // Enter to send
  document.getElementById('chat-msg-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(convId); }
  });

  // Mobile: show chat panel
  panel.classList.add('open');
  const backBtn = panel.querySelector('.chat-back-btn');
  if (backBtn) backBtn.style.display = 'flex';

  // Re-render conv list to clear unread
  document.querySelectorAll('.conv-item').forEach(el => {
    if (el.dataset.conv === convId) {
      const preview = el.querySelector('.conv-preview');
      if (preview) { preview.classList.remove('unread'); const badge = preview.querySelector('.unread-badge'); badge?.remove(); }
    }
  });
}

function closeChatMobile() {
  document.getElementById('chat-panel')?.classList.remove('open');
}

function toggleSendBtn() {
  const inp = document.getElementById('chat-msg-input');
  const btn = document.getElementById('chat-send-btn');
  if (btn) btn.disabled = !(inp?.value.trim());
}

function sendMessage(convId) {
  const inp = document.getElementById('chat-msg-input');
  const text = inp?.value.trim();
  if (!text) return;

  const conv = messagesData.find(c => c.id === convId);
  if (!conv) return;

  const now = new Date();
  const msg = { id: 'msg_' + Date.now(), from: 'me', text, date: now.toISOString() };
  conv.messages.push(msg);

  const area = document.getElementById('chat-messages-area');
  if (area) {
    const t = now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    const div = document.createElement('div');
    div.className = 'chat-bubble-wrap me';
    div.innerHTML = `<div class="chat-bubble">${text}</div><div class="chat-bubble-time">${t}</div>`;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  inp.value = '';
  document.getElementById('chat-send-btn').disabled = true;

  // Update conv list preview
  const convItem = document.querySelector(`.conv-item[data-conv="${convId}"] .conv-preview`);
  if (convItem) { convItem.textContent = 'Tú: ' + text; }

  // Simulate a reply after 1–3 seconds
  const replies = ['👍','¡Genial!','Entendido 😊','¡Gracias!','Sí claro!','🔥','¡Perfecto!'];
  const delay = 1000 + Math.random() * 2000;
  setTimeout(() => {
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const replyMsg = { id: 'reply_' + Date.now(), from: conv.username, text: reply, date: new Date().toISOString() };
    conv.messages.push(replyMsg);
    const area2 = document.getElementById('chat-messages-area');
    if (area2 && document.querySelector(`.conv-item[data-conv="${convId}"]`)?.classList.contains('active')) {
      const rt = new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
      const rdiv = document.createElement('div');
      rdiv.className = 'chat-bubble-wrap them';
      rdiv.innerHTML = `<div class="chat-bubble">${reply}</div><div class="chat-bubble-time">${rt}</div>`;
      area2.appendChild(rdiv);
      area2.scrollTop = area2.scrollHeight;
    }
  }, delay);
}

/* ────────────────────────────────────────────────
   REELS
──────────────────────────────────────────────── */
let reelObserver = null;
let isMuted = false;
const reelLiked = new Set();

function loadReels() {
  fetch('media/reels.json')
    .then(r => r.json())
    .then(data => { reelsData = data; renderReels(); })
    .catch(() => { reelsData = []; renderReels(); });
}

function renderReels() {
  const c = document.getElementById('reels-container');
  c.innerHTML = reelsData.map(r => buildReel(r)).join('');
  document.querySelectorAll('.reel-item').forEach(item =>
    item.addEventListener('click', e => {
      if (e.target.closest('button') || e.target.closest('.reel-actions') || e.target.closest('.reel-user')) return;
      const v = item.querySelector('.reel-video');
      v && (v.paused ? v.play() : v.pause());
    }));
}

function buildReel(reel) {
  const g = userGradient(reel.username);
  const isLiked = reelLiked.has(reel.id);
  return `
  <div class="reel-item" data-id="${reel.id}">
    <video class="reel-video" ${reel.file ? `src="${reel.file}"` : ''} loop playsinline preload="none" onerror="this.style.display='none'"></video>
    <div class="reel-placeholder">
      <div class="gradient-avatar ${g}" style="position:absolute;inset:0;opacity:.35;border-radius:0"></div>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" style="position:relative;z-index:1;width:64px;height:64px"><polygon points="5,3 19,12 5,21" fill="rgba(255,255,255,.5)"/></svg>
    </div>
    <div class="reel-views">${formatNumber(reel.views)} reproducciones</div>
    <button class="reel-mute-btn" onclick="toggleMute()" title="Silenciar">${muteIcon()}</button>
    <div class="reel-overlay">
      <div class="reel-info">
        <div class="reel-user">
          <div class="reel-avatar gradient-avatar ${g}" style="width:36px;height:36px;border:2px solid white">
            ${reel.avatar ? `<img src="${reel.avatar}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.remove()">` : ''}
            ${userInitial(reel.username)}
          </div>
          <span class="reel-username">${reel.username}${reel.verified?' ✓':''}</span>
          <button class="reel-follow-btn" data-reel-user="${reel.username}" onclick="toggleReelFollow(this)">Seguir</button>
        </div>
        <div class="reel-description">${reel.description}</div>
        <div class="reel-audio">
          <svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M9 3v11.5a3.5 3.5 0 1 0 2 3.12V7h7V3z"/></svg>
          ${reel.audio}
        </div>
      </div>
      <div class="reel-actions">
        <div class="reel-user-avatar-small gradient-avatar ${g}">
          ${reel.avatar ? `<img src="${reel.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.remove()">` : ''}
        </div>
        <div class="reel-action ${isLiked?'liked':''}" id="rrl-${reel.id}">
          <button class="reel-like-btn" data-id="${reel.id}" onclick="toggleReelLike(this)">
            <svg viewBox="0 0 24 24" fill="${isLiked?'var(--red)':'none'}" stroke="white" stroke-width="2"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg>
          </button>
          <span id="rrl-count-${reel.id}">${formatNumber(reel.likes+(isLiked?1:0))}</span>
        </div>
        <div class="reel-action">
          <button onclick="alert('Comentarios')"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/></svg></button>
          <span>${formatNumber(reel.comments)}</span>
        </div>
        <div class="reel-action">
          <button onclick="sharePost('reel-${reel.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white"/></svg></button>
          <span>Enviar</span>
        </div>
        <div class="reel-action">
          <button onclick="alert('Guardado')"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="20 21 12 13.44 4 21 4 3 20 3"/></svg></button>
          <span>Guardar</span>
        </div>
        <div class="reel-action">
          <button onclick="alert('Más opciones')"><svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
        </div>
      </div>
    </div>
  </div>`;
}

function muteIcon() {
  return isMuted
    ? `<svg viewBox="0 0 24 24" fill="none"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" stroke="white"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" stroke="white"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function toggleMute() {
  isMuted = !isMuted;
  document.querySelectorAll('.reel-video, .feed-video').forEach(v => v.muted = isMuted);
  document.querySelectorAll('.reel-mute-btn, .feed-mute-btn').forEach(b => b.innerHTML = muteIcon());
}
function toggleReelLike(btn) {
  const id = btn.dataset.id;
  const reel = reelsData.find(r => r.id === id);
  if (!reel) return;
  const wrap = document.getElementById(`rrl-${id}`);
  if (reelLiked.has(id)) { reelLiked.delete(id); wrap.classList.remove('liked'); btn.querySelector('svg').setAttribute('fill','none'); }
  else { reelLiked.add(id); wrap.classList.add('liked'); btn.querySelector('svg').setAttribute('fill','var(--red)'); }
  document.getElementById(`rrl-count-${id}`).textContent = formatNumber(reel.likes+(reelLiked.has(id)?1:0));
}
function toggleReelFollow(btn) {
  const u = btn.dataset.reelUser;
  btn.textContent = btn.textContent === 'Seguir' ? 'Siguiendo' : 'Seguir';
}
function pauseAllReels() { document.querySelectorAll('.reel-video').forEach(v => v.pause()); }
function initReelObserver() {
  if (reelObserver) reelObserver.disconnect();
  reelObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target.querySelector('.reel-video');
      if (!v) return;
      if (e.isIntersecting) { v.muted = isMuted; v.play().catch(()=>{}); }
      else { v.pause(); v.currentTime = 0; }
    });
  }, {threshold: 0.7});
  document.querySelectorAll('.reel-item').forEach(el => reelObserver.observe(el));
}

/* ────────────────────────────────────────────────
   INIT
──────────────────────────────────────────────── */
/* ────────────────────────────────────────────────
   PROFILE PAGE
──────────────────────────────────────────────── */
function loadProfile() {
  fetch('media/profile.json')
    .then(r => r.json())
    .then(data => { window.IG_PROFILE = data; renderProfile(); })
    .catch(() => { window.IG_PROFILE = {}; renderProfile(); });
}

function fmtCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0','') + 'M';
  if (n >= 10000)   return Math.round(n / 1000) + 'K';
  if (n >= 1000)    return (n / 1000).toFixed(1).replace('.0','') + 'K';
  return n.toString();
}

function renderProfile() {
  const p = window.IG_PROFILE || {};
  const g = userGradient(p.username || 'me');

  const bioHtml = (p.bio || '').replace(/\n/g, '<br>');
  const websiteHtml = p.website
    ? `<a href="${p.website}" class="prof-website" target="_blank" rel="noopener">${p.website.replace(/^https?:\/\//, '')}</a>`
    : '';
  const categoryHtml = p.category
    ? `<span class="prof-category">${p.category}</span>`
    : '';

  const highlightsHtml = (p.highlights || []).map(h => `
    <div class="prof-highlight">
      <div class="prof-highlight-ring">
        <div class="prof-highlight-cover gradient-avatar ${userGradient(h.id)}" style="background:${h.bgColor||'#333'}">
          ${h.cover ? `<img src="${h.cover}" alt="" onerror="this.remove()">` : ''}
        </div>
      </div>
      <span class="prof-highlight-label">${h.title}</span>
    </div>`).join('');

  const postsHtml = (p.posts || []).map(post => {
    const isVideo = post.type === 'video';
    const videoIcon = isVideo ? `<span class="prof-post-video-icon"><svg viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></span>` : '';
    const imgTag = post.file
      ? `<img src="${post.thumb || post.file}" alt="${post.alt||''}" loading="lazy" onerror="this.style.display='none'">`
      : '';
    return `
      <div class="prof-post-cell gradient-avatar ${userGradient(post.id)}" style="background:${post.bgColor||'#333'}">
        ${imgTag}
        ${videoIcon}
      </div>`;
  }).join('');

  const page = document.getElementById('page-profile');
  page.innerHTML = `
    <div class="prof-header">
      <div class="prof-top-bar">
        <span class="prof-username-top">${p.username || 'tu_usuario'}</span>
        <div class="prof-top-actions">
          <button class="prof-icon-btn" title="Nuevo post">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
          <button class="prof-icon-btn" title="Menú">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="prof-info-row">
        <div class="prof-avatar-wrap">
          ${avatarEl(p.username || 'me', p.avatar, 86, 30)}
          ${p.verified ? '<span class="prof-verified-badge"><svg viewBox="0 0 40 40"><path fill="#3897f0" d="M19.998 3.094L14.638 0l-2.972 5.152H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.906 20 40 14.64l-5.436-3.135V5.15h-6.234L25.358 0z"/><path fill="#fff" d="M17.606 25.35l-6.89-6.89 2.44-2.44 4.45 4.45 8.95-8.95 2.44 2.44z"/></svg></span>' : ''}
        </div>
        <div class="prof-stats">
          <div class="prof-stat"><strong>${fmtCount(p.postsCount || 0)}</strong><span>publicaciones</span></div>
          <div class="prof-stat"><strong>${fmtCount(p.followers || 0)}</strong><span>seguidores</span></div>
          <div class="prof-stat"><strong>${fmtCount(p.following || 0)}</strong><span>seguidos</span></div>
        </div>
      </div>

      <div class="prof-bio">
        <strong class="prof-display-name">${p.displayName || ''}</strong>
        ${categoryHtml}
        <p class="prof-bio-text">${bioHtml}</p>
        ${websiteHtml}
      </div>

      <div class="prof-action-btns">
        <button class="prof-action-btn">Editar perfil</button>
        <button class="prof-action-btn">Compartir perfil</button>
        <button class="prof-icon-btn prof-discover-btn" title="Descubrir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
        </button>
      </div>
    </div>

    ${highlightsHtml.length ? `
    <div class="prof-highlights-wrap">
      <div class="prof-highlights">${highlightsHtml}</div>
    </div>` : ''}

    <div class="prof-tabs">
      <button class="prof-tab active" data-tab="posts">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/></svg>
      </button>
      <button class="prof-tab" data-tab="tagged">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8.5 8.5h.01M12 8.5h.01M15.5 8.5h.01M8.5 12h7M8.5 15.5h4"/></svg>
      </button>
    </div>

    <div class="prof-grid" id="prof-grid-posts">${postsHtml || '<div class="prof-empty"><p>Sin publicaciones todavía</p></div>'}</div>
    <div class="prof-grid prof-grid-hidden" id="prof-grid-tagged">
      <div class="prof-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8.5 8.5h.01M15.5 8.5h.01M8.5 15.5h7"/></svg>
        <p>Fotos en las que aparecés</p>
      </div>
    </div>`;

  // Tab switching
  page.querySelectorAll('.prof-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      page.querySelectorAll('.prof-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      document.getElementById('prof-grid-posts').classList.toggle('prof-grid-hidden', which !== 'posts');
      document.getElementById('prof-grid-tagged').classList.toggle('prof-grid-hidden', which !== 'tagged');
    });
  });
}

/* ──────────────────────────────────────────────── */

document.getElementById('page-feed').hidden = false;
document.getElementById('page-feed').classList.add('active');

loadStories();
loadFeed();
loadReels();
loadNotifications();
loadMessages();
loadProfile();
