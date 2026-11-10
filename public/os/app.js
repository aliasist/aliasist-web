(function(){
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var forcedMotion = null;
  function effReduceMotion(){ if (forcedMotion==='reduced') return true; if (forcedMotion==='full') return false; return reduceMotion; }
  // CSS ambient motion (wallpaper, boot flicker) keys off this class rather
  // than the media query, so the in-OS Motion setting can override the OS.
  function syncMotionClass(){ document.documentElement.classList.toggle('reduced-motion', effReduceMotion()); }
  syncMotionClass();

  var APPS = [
    { id:'cli',      code:'1:CLI', label:'CYBER\nKONSOLE', sq:'cyan' },
    { id:'web',      code:'2:WEB', label:'ALIAS\nBROWSER', sq:'purple' },
    { id:'sys',      code:'5:SYS', label:'SYS\nAUDIT',     sq:'green' },
    { id:'net',      code:'7:NET', label:'NET\nINSPECT',   sq:'orange' },
    { id:'crypto',   code:'8:SEC', label:'CRYPTO\nLAB',    sq:'cyan' },
    { id:'files',    code:'=:DIR', label:'DOLPHIN\nFILES', sq:'purple' },
    { id:'settings', code:'S:SET', label:'SETTINGS',       sq:'green' }
  ];

  var wsTabs = document.getElementById('wsTabs');
  var rail = document.getElementById('rail');
  var colorVar = { cyan:'var(--cyan)', green:'var(--green)', orange:'var(--orange)', purple:'var(--purple)', red:'var(--red)' };
  // 24x24 stroke icons for the rail, drawn in each app's --sq color.
  var ICONS = {
    cli: '<path d="M4 6l5 5-5 5"/><path d="M12 18h8"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    sys: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9c-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    net: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    crypto: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',
    files: '<path d="M3 7h6l2 2h10v10H3z"/><path d="M3 7V5h6l2 2"/>',
    settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
  };

  APPS.forEach(function(a){
    var tab = document.createElement('button');
    tab.className = 'ws-tab'; tab.type = 'button'; tab.dataset.open = a.id;
    tab.textContent = a.code;
    tab.addEventListener('click', function(){ toggleWindow(a.id); });
    wsTabs.appendChild(tab);

    var rb = document.createElement('button');
    rb.className = 'rail-btn'; rb.type = 'button'; rb.dataset.open = a.id;
    rb.innerHTML = '<span class="rail-glyph" style="--sq:'+colorVar[a.sq]+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[a.id]+'</svg></span><span class="rail-label">'+a.label.replace('\n','<br>')+'</span>';
    rb.addEventListener('click', function(){ toggleWindow(a.id); });
    rail.appendChild(rb);
  });

  /* ================= web apps: the live Aliasist projects, each in its own window ================= */
  // embed:false: the site sends X-Frame-Options and refuses to load inside another
  // page, so its window explains that and opens it in a real tab instead.
  var WEB_APPS = [
    { id:'ai',    code:'A:AI',  label:'ALIASIST\nAI', name:'Aliasist AI', sq:'purple', url:'https://www.aliasist.tech/',
      about:'Chat and make images with AI that answers from real documents and cites its sources.',
      icon:'<path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/>' },
    { id:'forum', code:'F:FRM', label:'ALIAS\nFORUM', name:'Alias Forum', sq:'cyan', url:'https://alias.aliasist.tech/',
      about:'The Aliasist community: share what you make, request features and get help.',
      icon:'<path d="M4 5h16v10H10l-5 4v-4H4z"/><path d="M8 9h8M8 12h5"/>' },
    { id:'space', code:'X:SPC', label:'SPACE\nSIST', name:'SpaceSist', sq:'purple', url:'https://space.aliasist.com/',
      about:'NASA, SpaceX, the ISS, asteroids and exoplanets on one live space dashboard.',
      icon:'<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)"/>' },
    { id:'pdf',   code:'P:PDF', label:'PDF\nSIST', name:'PDFSist', sq:'orange', url:'https://pdf.aliasist.com/',
      about:'Fill in and sign PDFs. Your file never leaves your browser.',
      icon:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 16c2-3 3 1 6-2"/>' },
    { id:'globe', code:'G:GLB', label:'GLOBAL\nIZE', name:'Globalize', sq:'green', url:'https://www.aliasist.world/', embed:false,
      about:'Spin a 3D globe of data centers, undersea cables, air traffic and earthquakes.',
      icon:'<circle cx="12" cy="12" r="9"/><path d="M4.5 8h15M4.5 16h15"/><path d="M12 3c-3.5 3.5-3.5 14.5 0 18"/>' },
    { id:'clear', code:'C:CLR', label:'CLEAR\nSIST', name:'ClearSist', sq:'cyan', url:'https://clearasist.pages.dev/', embed:false,
      about:'Strip hidden metadata out of photos, PDFs and Office files before you share them.',
      icon:'<path d="M4 20h16"/><path d="M7 17l9-9 3 3-6 6z"/><path d="M5 9l1-2 2-1-2-1-1-2-1 2-2 1 2 1z"/>' }
  ];
  var ALL_APPS = APPS.concat(WEB_APPS);

  var railDivider = document.createElement('div');
  railDivider.className = 'rail-divider';
  railDivider.textContent = 'APPS';
  rail.appendChild(railDivider);

  var appWinTemplate = document.getElementById('win-settings');
  WEB_APPS.forEach(function(a){
    var host = a.url.replace(/^https:\/\/|\/$/g, '');
    var win = document.createElement('div');
    win.className = 'window'; win.id = 'win-'+a.id; win.dataset.win = a.id; win.hidden = true;
    win.dataset.url = a.url;
    win.innerHTML =
      '<div class="titlebar" data-drag><div class="tb-dot"></div><div class="tb-title"></div>' +
      '<button class="tb-btn close" data-action="close">×</button></div>' +
      '<div class="content webapp"><div class="webapp-bar"><span class="webapp-host"></span>' +
      (a.embed === false ? '' : '<button type="button" class="webapp-btn" data-reload>RELOAD</button>') +
      '<a class="webapp-btn" target="_blank" rel="noopener noreferrer">OPEN IN NEW TAB</a></div></div>';
    win.querySelector('.tb-title').textContent = a.name.toUpperCase() + ': ' + host;
    win.querySelector('[data-action="close"]').setAttribute('aria-label', 'Close ' + a.name);
    win.querySelector('.webapp-host').textContent = host;
    win.querySelector('a.webapp-btn').href = a.url;
    var body = win.querySelector('.webapp');
    if (a.embed === false){
      var note = document.createElement('div');
      note.className = 'webapp-blocked';
      note.innerHTML = '<p class="webapp-about"></p><p>' + a.name + ' doesn\'t allow other sites to show it inside a window, so it opens in its own tab.</p>' +
        '<a class="webapp-launch" target="_blank" rel="noopener noreferrer"></a>';
      note.querySelector('.webapp-about').textContent = a.about;
      note.querySelector('.webapp-launch').href = a.url;
      note.querySelector('.webapp-launch').textContent = 'Open ' + a.name;
      body.appendChild(note);
    } else {
      // src is set when the window opens (showWindow) and cleared when it closes,
      // so nothing loads until asked and closing stops any audio or video
      var frame = document.createElement('iframe');
      frame.title = a.name;
      frame.setAttribute('allow', 'clipboard-write; fullscreen');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      body.appendChild(frame);
      win.querySelector('[data-reload]').addEventListener('click', function(){ frame.src = a.url; });
    }
    appWinTemplate.parentNode.insertBefore(win, appWinTemplate.nextSibling);
    appWinTemplate = win;

    var rb = document.createElement('button');
    rb.className = 'rail-btn'; rb.type = 'button'; rb.dataset.open = a.id;
    rb.title = a.about;
    rb.innerHTML = '<span class="rail-glyph" style="--sq:'+colorVar[a.sq]+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+a.icon+'</svg></span><span class="rail-label">'+a.label.replace('\n','<br>')+'</span>';
    rb.addEventListener('click', function(){ toggleWindow(a.id); });
    rail.appendChild(rb);
  });

  /* ================= boot sequence ================= */
  var BOOT_LINES = [
    'spawnOS bootloader: x86_64 UEFI',
    'Initializing UEFI GOP framebuffer (1280x800)... [OK]',
    'Scanning PCI bus for devices... [OK]',
    'VirtIO-Net PCI DMA ring buffers... [OK]',
    'smoltcp TCP/IP stack: 10.0.2.15/24... [OK]',
    '8042 PS/2 controller (0x60 / 0x64)... [OK]',
    'Zig SIMD glyph rasterizer... [OK]',
    'Plasma compositor: double buffered GOP... [OK]',
    'Mounting AliasFS...  [OK]',
    'Starting CyberKonsole shell...  [OK]'
  ];
  var bootEl = document.getElementById('boot');
  var bootLogEl = document.getElementById('bootLog');
  var bootLogoEl = document.getElementById('bootLogo');
  var bootLoginEl = document.getElementById('bootLogin');
  var bootLoginStatusEl = document.getElementById('bootLoginStatus');
  var loginInput = document.getElementById('loginInput');
  var desktopEl = document.getElementById('desktop');
  var bootDone = false;
  var loginShown = false;

  var currentUser = null;
  var persistEnabled = false;
  var userFiles = []; // [{name, size, updatedAt}], saved on the server

  var USERNAME_RE = /^[a-zA-Z0-9_-]{2,20}$/;
  var LAST_USER_KEY = 'spawnos.lastUser';

  function apiLogin(username){
    return fetch('/api/spawnos/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: username })
    }).then(function(r){
      return r.json().then(function(data){
        if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
        return data;
      });
    });
  }
  function apiSaveSettings(settings){
    if (!persistEnabled || !currentUser) return Promise.resolve();
    return fetch('/api/spawnos/settings', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: currentUser, settings: settings })
    }).then(function(r){ setSyncStatus(r.ok); return r.ok; }).catch(function(){ setSyncStatus(false); });
  }
  function setSyncStatus(ok){
    var el = document.getElementById('syncStatus');
    if (!el) return;
    if (!persistEnabled){ el.textContent = '○ DB: OFFLINE'; el.classList.remove('agent-on'); return; }
    el.textContent = ok ? '● DB: SYNCED' : '● DB: ERROR';
    el.classList.toggle('agent-on', !!ok);
  }

  function currentSettingsSnapshot(){
    return {
      palette: desktopEl.getAttribute('data-palette') || 'cyan',
      invert: desktopEl.classList.contains('inverted'),
      motion: forcedMotion || 'full',
      poll: (document.getElementById('pollOut').textContent.match(/^\d+/) || ['1000'])[0]
    };
  }

  function applySettingsToUI(settings){
    settings = settings || {};
    desktopEl.setAttribute('data-palette', settings.palette || 'cyan');
    desktopEl.classList.toggle('inverted', !!settings.invert);
    forcedMotion = settings.motion || 'full';
    document.getElementById('pollOut').textContent = (settings.poll || '1000') + 'HZ POLL';
    setSegPressed('paletteSeg', settings.palette || 'cyan');
    setSegPressed('invertSeg', settings.invert ? 'invert' : 'normal');
    setSegPressed('motionSeg', settings.motion || 'full');
    syncMotionClass();
    setSegPressed('pollSeg', String(settings.poll || '1000'));
  }
  function setSegPressed(segId, value){
    var seg = document.getElementById(segId);
    if (!seg) return;
    seg.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === String(value))); });
  }

  function refreshUserLabels(){
    var name = currentUser || 'guest';
    document.getElementById('cliUserLabel').textContent = name.toUpperCase();
    document.getElementById('filesUserLabel').textContent = name.toUpperCase();
    document.getElementById('taskUserLabel').textContent = name;
    document.getElementById('accountLabel').textContent = currentUser ? name : 'guest (not saved)';
  }

  function enterDesktop(profile, ok){
    bootDone = true;
    currentUser = profile.username;
    persistEnabled = !!ok;
    userFiles = profile.files || [];
    try { if (ok) localStorage.setItem(LAST_USER_KEY, profile.username); } catch(e){}

    bootEl.hidden = true;
    desktopEl.hidden = false;
    applySettingsToUI(profile.settings);
    refreshUserLabels();
    setSyncStatus(ok);
    renderFileList();
    startTaskbarClock();
    startFpsCounter();
    printWelcome();
    // Land on the desktop with AliasBrowser open and focused, bookmarks visible.
    toggleWindow('web', { x: window.innerWidth*0.5 + 30, y: window.innerHeight*0.5 });
    urlInput.focus();
  }

  function submitLogin(raw){
    var username = String(raw || '').trim();
    if (!USERNAME_RE.test(username)){
      bootLoginStatusEl.textContent = 'use 2-20 letters, numbers, _ or -';
      return;
    }
    bootLoginStatusEl.textContent = 'connecting to spawnos-db...';
    apiLogin(username).then(function(profile){
      bootLoginStatusEl.textContent = profile.isNew ? 'new profile made. welcome aboard' : 'welcome back';
      setTimeout(function(){ enterDesktop(profile, true); }, 350);
    }).catch(function(err){
      bootLoginStatusEl.textContent = 'can\'t reach the database, so this session stays on this device';
      setTimeout(function(){
        enterDesktop({ username: username, settings: {}, files: [] }, false);
      }, 600);
    });
  }

  function showLoginPrompt(){
    if (loginShown) return;
    loginShown = true;
    bootLoginEl.hidden = false;
    loginInput.focus();
    var saved = null;
    try { saved = localStorage.getItem(LAST_USER_KEY); } catch(e){}
    // Always require an explicit login; just prefill the last user so Enter is enough.
    if (saved){
      loginInput.value = saved;
      loginInput.select();
      bootLoginStatusEl.textContent = 'press enter to sign in as ' + saved;
    }
  }
  loginInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') submitLogin(loginInput.value);
  });

  function runBoot(){
    if (effReduceMotion()){
      showLoginPrompt();
      return;
    }
    var i = 0;
    function nextLine(){
      if (i >= BOOT_LINES.length){
        bootLogoEl.classList.add('show');
        setTimeout(showLoginPrompt, 700);
        return;
      }
      var d = document.createElement('div');
      d.textContent = BOOT_LINES[i];
      if (/\[OK\]/.test(BOOT_LINES[i])) d.classList.add('tag-ok');
      bootLogEl.appendChild(d);
      i++;
      setTimeout(nextLine, 90 + Math.random()*90);
    }
    nextLine();
  }
  bootEl.addEventListener('click', function(e){
    if (!loginShown && !bootDone) showLoginPrompt();
  });
  document.addEventListener('keydown', function(e){
    if (!loginShown && !bootDone) showLoginPrompt();
  }, { once:false });
  runBoot();

  /* ================= clock / fps ================= */
  function startTaskbarClock(){
    var clockEl = document.getElementById('clock');
    function tick(){
      var d = new Date();
      var pad = function(n){ return (n<10?'0':'')+n; };
      clockEl.textContent = pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    }
    tick(); setInterval(tick, 1000);
  }
  function startFpsCounter(){
    var fpsOut = document.getElementById('fpsOut');
    var frames = 0, last = performance.now();
    function loop(now){
      frames++;
      if (now - last >= 1000){
        fpsOut.textContent = frames + ' FPS';
        frames = 0; last = now;
      }
      if (!effReduceMotion()) requestAnimationFrame(loop);
      else setTimeout(function(){ loop(performance.now()); }, 1000);
    }
    requestAnimationFrame(loop);
  }

  /* ================= window manager ================= */
  var windows = Array.prototype.slice.call(document.querySelectorAll('.window'));
  var zTop = 10;
  var activeWin = null;
  var taskLeft = document.getElementById('taskLeft');
  var taskTabs = {};

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function placeWindow(win, anchorX, anchorY){
    var vw = window.innerWidth, vh = window.innerHeight;
    var rect = win.getBoundingClientRect();
    var w = rect.width || 320, h = rect.height || 220;
    var left = clamp(anchorX - w/2, 70, Math.max(70, vw - w - 8));
    var top = clamp(anchorY - h/2, 30, Math.max(30, vh - h - 34));
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  }

  function refreshRailState(){
    document.querySelectorAll('.rail-btn, .ws-tab').forEach(function(b){
      var win = document.getElementById('win-'+b.dataset.open);
      b.setAttribute('aria-pressed', String(win && !win.hidden && !win.dataset.leaving));
    });
  }

  function ensureTaskTab(id, win){
    if (taskTabs[id]) return taskTabs[id];
    var app = ALL_APPS.filter(function(a){ return a.id===id; })[0];
    var tab = document.createElement('button');
    tab.className = 'task-tab';
    tab.textContent = app ? app.code : id;
    tab.addEventListener('click', function(){
      if (win.hidden || win.dataset.leaving) showWindow(win);
      else if (activeWin===win) minimizeWindow(win);
      else bringToFront(win);
    });
    taskLeft.appendChild(tab);
    taskTabs[id] = tab;
    return tab;
  }

  function bringToFront(win){
    zTop++; win.style.zIndex = zTop;
    windows.forEach(function(w){ w.classList.toggle('active', w===win); });
    activeWin = win;
    Object.keys(taskTabs).forEach(function(id){
      taskTabs[id].setAttribute('aria-pressed', String('win-'+id === win.id));
    });
    refreshRailState();
  }

  /* ---- window animations (Web Animations API; skipped under reduced motion) ---- */
  var EASE_OUT = 'cubic-bezier(.2,.9,.3,1)';
  var EASE_IN = 'cubic-bezier(.4,0,.8,.4)';
  function animateWin(win, frames, ms, easing){
    win.getAnimations().forEach(function(a){ a.cancel(); });
    if (effReduceMotion() || !win.animate || document.hidden) return Promise.resolve(true);
    var anim = win.animate(frames, { duration: ms, easing: easing });
    // Safety net: if the animation clock stalls (e.g. tab backgrounded mid-close),
    // jump to the end so the window never gets stuck half-closed.
    var guard = setTimeout(function(){ if (anim.playState === 'running') anim.finish(); }, ms + 150);
    return anim.finished.then(function(){ clearTimeout(guard); return true; },
                              function(){ clearTimeout(guard); return false; });
  }
  // Offset from the window's centre to its taskbar tab, for minimize/restore.
  function tabOffset(win){
    var tab = taskTabs[win.dataset.win];
    if (!tab) return null;
    var w = win.getBoundingClientRect(), t = tab.getBoundingClientRect();
    return { x: (t.left + t.width/2) - (w.left + w.width/2), y: (t.top + t.height/2) - (w.top + w.height/2) };
  }
  function minimizedFrame(win){
    var o = tabOffset(win);
    return o ? { transform: 'translate('+o.x+'px,'+o.y+'px) scale(.12)', opacity: 0 }
             : { transform: 'translateY(40px) scale(.9)', opacity: 0 };
  }

  function showWindow(win, anchor){
    var wasMinimized = !!win.dataset.minimized;
    delete win.dataset.leaving;
    delete win.dataset.minimized;
    win.hidden = false;
    if (!win.dataset.placed){
      // Cascade: each window that's already open nudges the next one down and right
      var step = 26 * windows.filter(function(w){ return w !== win && !w.hidden; }).length % 182;
      var a = anchor || { x: window.innerWidth*0.5 + step, y: window.innerHeight*0.42 + step };
      placeWindow(win, a.x, a.y);
      win.dataset.placed = '1';
    }
    bringToFront(win);
    // A freshly opened browser starts on the home page (restoring from minimize keeps its page).
    if (win.id === 'win-web' && !wasMinimized && urlInput.value === 'about:home') navigateTo(HOME_URL);
    var appFrame = win.dataset.url && win.querySelector('iframe');
    if (appFrame && !appFrame.getAttribute('src')) appFrame.src = win.dataset.url;
    var from = wasMinimized ? minimizedFrame(win) : { transform: 'scale(.94)', opacity: 0 };
    animateWin(win, [from, { transform: 'none', opacity: 1 }], wasMinimized ? 240 : 180, EASE_OUT);
  }

  // Hide with an exit animation. The window ignores clicks while leaving, and a
  // re-open mid-animation cancels it (animateWin resolves false) so nothing is lost.
  function hideWindow(win, to, ms, after){
    if (win.hidden) return;
    win.dataset.leaving = '1';
    if (activeWin === win){ activeWin = null; win.classList.remove('active'); }
    animateWin(win, [{ transform: 'none', opacity: 1 }, to], ms, EASE_IN).then(function(done){
      if (!done || !win.dataset.leaving) return;
      delete win.dataset.leaving;
      win.hidden = true;
      if (after) after();
      refreshRailState();
    });
    refreshRailState();
  }

  function minimizeWindow(win){
    win.dataset.minimized = '1';
    if (taskTabs[win.dataset.win]) taskTabs[win.dataset.win].setAttribute('aria-pressed', 'false');
    hideWindow(win, minimizedFrame(win), 220);
  }

  function toggleWindow(id, anchor){
    var win = document.getElementById('win-'+id);
    if (!win) return;
    ensureTaskTab(id, win);
    if (win.hidden || win.dataset.leaving) showWindow(win, anchor);
    else if (activeWin === win) minimizeWindow(win);
    else bringToFront(win);
  }
  function closeWindow(win){
    if (!win || win.hidden || win.dataset.leaving) return;
    var id = win.dataset.win;
    if (taskTabs[id]){ taskTabs[id].remove(); delete taskTabs[id]; }
    hideWindow(win, { transform: 'scale(.94) translateY(6px)', opacity: 0 }, 150, function(){
      delete win.dataset.placed;
      delete win.dataset.minimized;
      setMaximized(win, false);
      if (id === 'web') resetBrowser(); // closing the browser stops any page/video still playing
      var appFrame = win.dataset.url && win.querySelector('iframe');
      if (appFrame) appFrame.removeAttribute('src'); // same for a web app; it reloads fresh next time
    });
  }

  function setMaximized(win, on){
    if (on === win.classList.contains('maximized')) return;
    var before = win.getBoundingClientRect();
    win.classList.toggle('maximized', on);
    var btn = win.querySelector('[data-action="max"]');
    if (btn){ btn.textContent = on ? '❐' : '□'; btn.setAttribute('aria-label', on ? 'Restore' : 'Maximize'); }
    // FLIP: animate from the old box to the new one.
    var after = win.getBoundingClientRect();
    if (!after.width || !before.width) return;
    animateWin(win, [
      { transformOrigin: '0 0', transform: 'translate('+(before.left-after.left)+'px,'+(before.top-after.top)+'px) scale('+(before.width/after.width)+','+(before.height/after.height)+')' },
      { transformOrigin: '0 0', transform: 'none' }
    ], 200, EASE_OUT);
  }

  windows.forEach(function(win){
    win.addEventListener('pointerdown', function(){
      if (!win.hidden){ ensureTaskTab(win.dataset.win, win); bringToFront(win); }
    });
    var closeBtn = win.querySelector('[data-action="close"]');
    [['min', '–', 'Minimize'], ['max', '□', 'Maximize']].forEach(function(spec){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tb-btn ' + spec[0]; b.dataset.action = spec[0];
      b.textContent = spec[1]; b.setAttribute('aria-label', spec[2]); b.title = spec[2];
      closeBtn.parentNode.insertBefore(b, closeBtn);
    });
    closeBtn.title = 'Close';
    win.querySelector('[data-action="min"]').addEventListener('click', function(e){ e.stopPropagation(); minimizeWindow(win); });
    win.querySelector('[data-action="max"]').addEventListener('click', function(e){ e.stopPropagation(); setMaximized(win, !win.classList.contains('maximized')); });
    closeBtn.addEventListener('click', function(e){ e.stopPropagation(); closeWindow(win); });

    var dragHandle = win.querySelector('[data-drag]');
    var dragging = false, startX=0, startY=0, originLeft=0, originTop=0;
    dragHandle.addEventListener('dblclick', function(e){
      if (e.target.closest('.tb-btn')) return;
      setMaximized(win, !win.classList.contains('maximized'));
    });
    dragHandle.addEventListener('pointerdown', function(e){
      if (e.target.closest('.tb-btn')) return;
      if (win.classList.contains('maximized')){ ensureTaskTab(win.dataset.win, win); bringToFront(win); return; }
      dragging = true; ensureTaskTab(win.dataset.win, win); bringToFront(win);
      startX = e.clientX; startY = e.clientY;
      var rect = win.getBoundingClientRect();
      originLeft = rect.left; originTop = rect.top;
      dragHandle.setPointerCapture(e.pointerId);
    });
    dragHandle.addEventListener('pointermove', function(e){
      if (!dragging) return;
      var vw = window.innerWidth, vh = window.innerHeight;
      var rect = win.getBoundingClientRect();
      var newLeft = clamp(originLeft + (e.clientX-startX), 0, Math.max(0, vw-rect.width));
      var newTop = clamp(originTop + (e.clientY-startY), 24, Math.max(24, vh-rect.height));
      win.style.left = newLeft+'px'; win.style.top = newTop+'px';
    });
    ['pointerup','pointercancel'].forEach(function(ev){
      dragHandle.addEventListener(ev, function(){ dragging = false; });
    });
  });

  document.getElementById('kBtn').addEventListener('click', function(){ toggleWindow('cli'); });

  window.addEventListener('resize', function(){
    windows.forEach(function(win){
      if (win.hidden) return;
      var rect = win.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      win.style.left = clamp(rect.left, 0, Math.max(0, vw-rect.width)) + 'px';
      win.style.top = clamp(rect.top, 24, Math.max(24, vh-rect.height)) + 'px';
    });
  });

  /* ================= fake filesystem (shared by files + terminal) ================= */
  var FILES = {
    'boot.log': BOOT_LINES.join('\n'),
    'about.txt': 'SPAWNOS\n\nAn independent, bootable, bare-metal operating system and graphical\ndesktop environment engineered from scratch in Rust (#![no_std]) and Zig\nfor 64-bit UEFI architectures. Zero Linux kernel dependencies.\n\nThis web version lives at aliasist.com/os. AliasBrowser and the apps in\nthe rail load real sites right inside their windows.',
    'architecture.txt': 'DESKTOP / LIBOS  -> AliasBrowser, CyberKonsole, CryptoLab\nHAL              -> alias-ui, alias-net, alias-hal\nUEFI FIRMWARE    -> GOP fb, PCI DMA, hw timers',
    'README.md': '# spawnOS\nReal project: github.com/aliasist/aliasist-os\nBoots directly from UEFI firmware into a double-buffered,\nhardware-composited desktop with direct PCI hardware I/O.'
  };

  /* ---- real per-user files, backed by /api/spawnos/files (D1) ---- */
  function apiGetFile(name){
    return fetch('/api/spawnos/files?username=' + encodeURIComponent(currentUser) + '&name=' + encodeURIComponent(name))
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function apiSaveFile(name, content){
    return fetch('/api/spawnos/files', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: currentUser, name: name, content: content })
    }).then(function(r){
      return r.json().then(function(data){ if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status)); return data; });
    });
  }
  function apiDeleteFile(name){
    return fetch('/api/spawnos/files?username=' + encodeURIComponent(currentUser) + '&name=' + encodeURIComponent(name), { method: 'DELETE' })
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function refreshFilesFromServer(){
    if (!persistEnabled || !currentUser) return Promise.resolve();
    return fetch('/api/spawnos/files?username=' + encodeURIComponent(currentUser))
      .then(function(r){ return r.json(); })
      .then(function(data){ userFiles = data.files || []; renderFileList(); })
      .catch(function(){ setSyncStatus(false); });
  }

  var fileListEl = document.getElementById('fileList');
  var fileEditorEl = document.getElementById('fileEditor');
  var fileEditorNameEl = document.getElementById('fileEditorName');
  var fileEditorStatusEl = document.getElementById('fileEditorStatus');
  var fileEditorBody = document.getElementById('fileEditorBody');
  var editingFileName = null;

  function renderFileList(){
    fileListEl.innerHTML = '';
    var names = Object.keys(FILES);
    if (!names.length && !userFiles.length){
      fileListEl.innerHTML = '<div class="file-empty">no files yet. make one above</div>';
    }
    names.forEach(function(name){
      var row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = '<span>' + name + ' (system)</span><span class="sz">' + FILES[name].length + 'B</span>';
      row.addEventListener('click', function(){ openFileReadOnly(name, FILES[name]); });
      fileListEl.appendChild(row);
    });
    userFiles.forEach(function(f){
      var row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = '<span>' + f.name + '</span><span class="sz">' + f.size + 'B</span>';
      row.addEventListener('click', function(){ openFileEditable(f.name); });
      fileListEl.appendChild(row);
    });
  }

  function openFileReadOnly(name, content){
    editingFileName = null;
    fileEditorEl.hidden = false;
    fileEditorNameEl.textContent = name + ' (read-only)';
    fileEditorStatusEl.textContent = '';
    fileEditorBody.value = content;
    fileEditorBody.readOnly = true;
    document.getElementById('fileSaveBtn').hidden = true;
    document.getElementById('fileDeleteBtn').hidden = true;
  }
  function openFileEditable(name){
    if (!persistEnabled){
      fileEditorEl.hidden = false;
      fileEditorNameEl.textContent = name;
      fileEditorStatusEl.textContent = 'no database connection';
      return;
    }
    fileEditorEl.hidden = false;
    fileEditorNameEl.textContent = name;
    fileEditorStatusEl.textContent = 'loading...';
    fileEditorBody.readOnly = false;
    document.getElementById('fileSaveBtn').hidden = false;
    document.getElementById('fileDeleteBtn').hidden = false;
    apiGetFile(name).then(function(f){
      editingFileName = name;
      fileEditorBody.value = f.content;
      fileEditorStatusEl.textContent = '';
    }).catch(function(){ fileEditorStatusEl.textContent = 'failed to load'; });
  }

  document.getElementById('newFileBtn').addEventListener('click', function(){
    var input = document.getElementById('newFileName');
    var name = input.value.trim();
    if (!name){ return; }
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(name)){
      alert('File names: letters, numbers, _ . - only, up to 64 chars.');
      return;
    }
    if (!persistEnabled){
      alert('Files need the database. Log in again once it\'s back to save files.');
      return;
    }
    apiSaveFile(name, '').then(function(){
      input.value = '';
      return refreshFilesFromServer();
    }).then(function(){ openFileEditable(name); });
  });

  document.getElementById('fileSaveBtn').addEventListener('click', function(){
    if (!editingFileName) return;
    fileEditorStatusEl.textContent = 'saving...';
    apiSaveFile(editingFileName, fileEditorBody.value).then(function(){
      fileEditorStatusEl.textContent = 'saved';
      refreshFilesFromServer();
    }).catch(function(){ fileEditorStatusEl.textContent = 'save failed'; });
  });
  document.getElementById('fileDeleteBtn').addEventListener('click', function(){
    if (!editingFileName) return;
    apiDeleteFile(editingFileName).then(function(){
      fileEditorEl.hidden = true;
      editingFileName = null;
      refreshFilesFromServer();
    }).catch(function(){ fileEditorStatusEl.textContent = 'delete failed'; });
  });

  /* ================= CyberKonsole ================= */
  var termOut = document.getElementById('termOut');
  var termInput = document.getElementById('termInput');
  var bootTime = Date.now();

  function printLine(text, cls){
    var d = document.createElement('div');
    d.className = 'line' + (cls ? ' '+cls : '');
    d.textContent = text;
    termOut.appendChild(d);
    termOut.scrollTop = termOut.scrollHeight;
  }

  function neofetch(){
    var uptimeSec = Math.floor((Date.now()-bootTime)/1000);
    [
      '        A          OS:        spawnOS (local build)',
      '       /_\\         Kernel:    bare-metal Rust + Zig, #![no_std]',
      '      /___\\        Host:      x86_64 UEFI',
      '     /     \\       User:      ' + (currentUser || 'guest') + (persistEnabled ? ' (synced)' : ' (local only)'),
      '    /_______\\      Shell:     CyberKonsole',
      '                   Compositor: Plasma (Zig SIMD, double-buffered)',
      '                   Network:   VirtIO-Net · 10.0.2.15/24',
      '                   Files:     ' + userFiles.length + ' in /home/' + (currentUser || 'guest'),
      '                   Uptime:    ' + uptimeSec + 's'
    ].forEach(function(l){ printLine(l); });
  }

  var PROCS = [
    ['1', 'plasma-compositor', 'running'],
    ['2', 'alias-net', 'running'],
    ['3', 'alias-hal', 'running'],
    ['4', 'cyberkonsole', 'running'],
    ['5', 'aliasbrowser', 'idle'],
    ['6', 'live-pulse', 'paused']
  ];

  var HISTORY = [];
  var histIdx = -1;

  function runCommand(raw){
    var line = raw.trim();
    printLine('❯ ' + raw, 'prompt-echo');
    if (!line) return;
    HISTORY.push(raw); histIdx = HISTORY.length;
    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(' ');

    if (cmd === 'help'){
      ['help, clear, whoami, date, neofetch, ls, cat <file>, ps,',
       'write <file> <text...>, rm <file>, open <cli|web|crypto|net|sys|files|settings>,',
       'goto <url>, sha256 <text>, echo <text>, logout, apps',
       'open <' + WEB_APPS.map(function(a){ return a.id; }).join('|') + '> runs a live Aliasist app'
      ].forEach(function(l){ printLine(l); });
    } else if (cmd === 'clear'){
      termOut.innerHTML = '';
    } else if (cmd === 'whoami'){
      printLine(currentUser || 'guest');
    } else if (cmd === 'date'){
      printLine(new Date().toString());
    } else if (cmd === 'neofetch'){
      neofetch();
    } else if (cmd === 'ls'){
      var names = Object.keys(FILES).concat(userFiles.map(function(f){ return f.name; }));
      printLine(names.join('   ') || '(empty)');
    } else if (cmd === 'cat'){
      if (FILES[arg]){
        FILES[arg].split('\n').forEach(function(l){ printLine(l); });
      } else if (userFiles.some(function(f){ return f.name === arg; })){
        apiGetFile(arg).then(function(f){ (f.content || '(empty file)').split('\n').forEach(function(l){ printLine(l); }); })
          .catch(function(){ printLine('cat: ' + arg + ': read failed', 'err'); });
      } else {
        printLine('cat: ' + arg + ': no such file', 'err');
      }
    } else if (cmd === 'write'){
      var wname = parts[1];
      var wcontent = parts.slice(2).join(' ');
      if (!wname){ printLine('usage: write <file> <text...>', 'err'); }
      else if (!persistEnabled){ printLine('write: can\'t reach the database, so files can\'t be saved right now', 'err'); }
      else {
        apiSaveFile(wname, wcontent).then(function(){ printLine('wrote ' + wname, 'ok'); refreshFilesFromServer(); })
          .catch(function(e){ printLine('write: ' + e.message, 'err'); });
      }
    } else if (cmd === 'rm'){
      if (!arg){ printLine('usage: rm <file>', 'err'); }
      else if (FILES[arg]){ printLine('rm: ' + arg + ': read-only system file', 'err'); }
      else if (!persistEnabled){ printLine('rm: no database connection', 'err'); }
      else {
        apiDeleteFile(arg).then(function(){ printLine('removed ' + arg, 'ok'); refreshFilesFromServer(); })
          .catch(function(){ printLine('rm: ' + arg + ': failed', 'err'); });
      }
    } else if (cmd === 'logout'){
      printLine('logging out...', 'ok');
      setTimeout(function(){ document.getElementById('logoutBtn').click(); }, 300);
    } else if (cmd === 'ps'){
      printLine('PID  NAME                STATE');
      PROCS.forEach(function(p){ printLine(p[0].padEnd(5)+p[1].padEnd(20)+p[2]); });
    } else if (cmd === 'apps'){
      WEB_APPS.forEach(function(a){ printLine(a.id.padEnd(7) + a.name.padEnd(13) + a.url.replace(/^https:\/\/|\/$/g, '')); });
      printLine('run one with: open <id>', 'ok');
    } else if (cmd === 'open'){
      var known = ALL_APPS.map(function(a){ return a.id; });
      if (known.indexOf(arg) !== -1){ toggleWindow(arg); printLine('opening ' + arg + '...', 'ok'); }
      else printLine('open: no app called "' + arg + '". try: ' + known.join(', '), 'err');
    } else if (cmd === 'goto'){
      if (!arg){ printLine('usage: goto <url>', 'err'); }
      else {
        toggleWindow('web');
        urlInput.value = arg;
        navigateTo(arg);
        printLine('AliasBrowser -> ' + arg, 'ok');
      }
    } else if (cmd === 'sha256'){
      if (!arg){ printLine('usage: sha256 <text>', 'err'); }
      else {
        sha256Hex(arg).then(function(hex){ printLine(hex); });
      }
    } else if (cmd === 'echo'){
      printLine(arg);
    } else {
      printLine('command not found: ' + cmd + '. type "help" to see what works', 'err');
    }
  }

  termInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter'){
      var v = termInput.value;
      termInput.value = '';
      runCommand(v);
    } else if (e.key === 'ArrowUp'){
      if (histIdx > 0){ histIdx--; termInput.value = HISTORY[histIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown'){
      if (histIdx < HISTORY.length-1){ histIdx++; termInput.value = HISTORY[histIdx]; }
      else { histIdx = HISTORY.length; termInput.value=''; }
      e.preventDefault();
    }
  });
  function printWelcome(){
    printLine('spawnOS web build. logged in as ' + (currentUser || 'guest') + (persistEnabled ? '' : ' (local only, no database)'));
    printLine('type "help" to begin');
    printLine('');
  }

  /* ================= CryptoLab (real Web Crypto) ================= */
  function bufToHex(buf){
    return Array.prototype.map.call(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  }
  function sha256Hex(text){
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', enc).then(bufToHex);
  }
  var cryptoInput = document.getElementById('cryptoInput');
  var sha256Out = document.getElementById('sha256Out');
  var base64Out = document.getElementById('base64Out');
  function updateCrypto(){
    var v = cryptoInput.value;
    sha256Hex(v).then(function(hex){ sha256Out.textContent = hex || '--'; });
    try { base64Out.textContent = v ? btoa(unescape(encodeURIComponent(v))) : '--'; }
    catch(e){ base64Out.textContent = 'encoding error'; }
  }
  cryptoInput.addEventListener('input', updateCrypto);
  updateCrypto();

  /* ================= NetInspect (simulated) ================= */
  var netLog = document.getElementById('netLog');
  var NET_LINES = [
    '[VIRTIO RX] 1514B frame ETH_P_IP',
    '[10.0.2.15:53211 -> 10.0.2.3:53] DNS query A aliasist.tech',
    '[10.0.2.15:44012 -> 93.184.216.34:443] TLS 1.3 ClientHello',
    '[VIRTIO TX] ARP who-has 10.0.2.2 tell 10.0.2.15',
    '[10.0.2.15:44012 <- 93.184.216.34:443] TLS 1.3 ServerHello',
    '[smoltcp] socket#3 established',
    '[VIRTIO RX] 66B frame ETH_P_ARP'
  ];
  var netTimer = null;
  function netTick(){
    var l = NET_LINES[Math.floor(Math.random()*NET_LINES.length)];
    var d = document.createElement('div');
    if (Math.random() < 0.3) d.className = 'hi';
    d.textContent = l;
    netLog.appendChild(d);
    while (netLog.childNodes.length > 40) netLog.removeChild(netLog.firstChild);
    netLog.scrollTop = netLog.scrollHeight;
  }
  (function watchNet(){
    var win = document.getElementById('win-net');
    setInterval(function(){
      if (!win.hidden){
        if (!netTimer) netTimer = true, netTick();
        else netTick();
      }
    }, 650);
  })();

  /* ================= AliasBrowser: real embedding ================= */
  var urlInput = document.getElementById('urlInput');
  var browserBody = document.getElementById('browserBody');
  var browserView = document.getElementById('browserView');
  var browserFrame = document.getElementById('browserFrame');
  var browserVideo = document.getElementById('browserVideo');
  var frameFallback = document.getElementById('frameFallback');
  var frameFallbackLink = document.getElementById('frameFallbackLink');
  var statusText = document.getElementById('statusText');
  var bmRow = document.getElementById('bmRow');
  var HOME_URL = 'https://www.aliasist.tech/'; // first page AliasBrowser loads, and the ⌂ button

  // Real Aliasist suite links, pulled from aliasist-web/src/content/homepage.ts (suiteApps).
  var BOOKMARKS = [
    { label:'NEVERSSL',   url:'https://neverssl.com/',                        cls:'c3', kind:'frame' },
    { label:'CERN 1ST WEB', url:'http://info.cern.ch/hypertext/WWW/TheProject.html', cls:'c2', kind:'frame' },
    { label:'ALIASIST AI', url:'https://www.aliasist.tech',                  cls:'c1', kind:'frame' },
    { label:'ALIAS FORUM', url:'https://alias.aliasist.tech',                cls:'c3', kind:'frame' },
    { label:'GLOBALIZE',   url:'https://www.aliasist.world',                 cls:'c2', kind:'frame' },
    { label:'SPACESIST',   url:'https://space.aliasist.com',                 cls:'c3', kind:'frame' },
    { label:'CLEARSIST',   url:'https://clearasist.pages.dev',               cls:'c1', kind:'frame' },
    { label:'PDFSIST',     url:'https://pdf.aliasist.com',                   cls:'c4', kind:'frame' },
    { label:'DEMO VIDEO',  url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cls:'c2', kind:'video' },
    { label:'SOURCE',      url:'https://github.com/aliasist/aliasist-os',    cls:'c4', kind:'newtab' },
    { label:'NETWORK',     url:'about:network',                              cls:'c3', kind:'about' }
  ];
  BOOKMARKS.forEach(function(bm){
    var el;
    if (bm.kind === 'newtab'){
      el = document.createElement('a');
      el.href = bm.url; el.target = '_blank'; el.rel = 'noopener noreferrer';
    } else {
      el = document.createElement('button');
      el.type = 'button';
      el.addEventListener('click', function(){ urlInput.value = bm.url; navigateTo(bm.url); });
    }
    el.className = 'bm ' + bm.cls;
    el.textContent = bm.label;
    bmRow.appendChild(el);
  });

  function showHome(){
    browserView.dataset.mode = 'text';
    frameFallback.hidden = true;
    browserFrame.hidden = true; browserFrame.src = 'about:blank';
    browserVideo.hidden = true; browserVideo.pause(); browserVideo.removeAttribute('src'); browserVideo.load();
    statusText.textContent = 'READY. ENTER A URL OR CLICK A BOOKMARK.';
    browserBody.innerHTML =
      '<p><strong>SPAWNOS CYBERNETIC WEB EXPLORER</strong></p>' +
      '<p>Pages and videos load right here in the window below.</p>' +
      '<ul>' +
      '<li>⌂ goes to the home page, ' + HOME_URL.replace(/^https:\/\/|\/$/g,'') + '. Type <code>about:home</code> to see this page again.</li>' +
      '<li>Bookmarks load in the frame below. Some sites, GitHub included, won\'t load inside another page. If one looks blank, use the "open in a real tab" link.</li>' +
      '<li>Type an address like <code>www.google.com</code> (no https:// needed), or just type words to search.</li>' +
      '<li>YouTube links and direct .mp4/.webm files play inline.</li>' +
      '<li><code>about:network</code> / <code>about:system</code> show local status pages.</li>' +
      '</ul>';
  }

  function youTubeEmbedUrl(u){
    var m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/i);
    return m ? 'https://www.youtube-nocookie.com/embed/' + m[1] : null;
  }

  // Turn whatever was typed into something loadable, the way a real address bar does:
  //   www.google.com -> https://www.google.com/   localhost:8080 -> http://localhost:8080/
  //   "rust no_std"  -> Google search
  var HOST_RE = /^([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?([\/?#].*)?$/i;
  var LOCAL_RE = /^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?([\/?#].*)?$/i;
  function resolveAddress(raw){
    var v = raw.trim();
    if (/^about:/i.test(v)) return v.toLowerCase();
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return frameFriendly(v);
    if (!/\s/.test(v) && LOCAL_RE.test(v)) return 'http://' + v;
    if (!/\s/.test(v) && HOST_RE.test(v)) return frameFriendly('https://' + v);
    return 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(v);
  }
  // Google refuses to be framed (X-Frame-Options: SAMEORIGIN) unless igu=1 is set.
  function frameFriendly(u){
    try {
      var url = new URL(u);
      if (/^(www\.)?google\.com$/i.test(url.hostname) && !url.searchParams.has('igu')){
        url.hostname = 'www.google.com'; // bare google.com redirects and would drop igu
        url.searchParams.set('igu', '1');
      }
      return url.toString();
    } catch(e){ return u; }
  }

  function navigateTo(raw){
    var v = raw.trim();
    if (!v) return;
    v = resolveAddress(v);
    urlInput.value = v;

    if (v === 'about:home'){ showHome(); return; }
    if (v === 'about:network'){
      browserView.dataset.mode = 'text';
      frameFallback.hidden = true; browserFrame.hidden = true; browserVideo.hidden = true;
      statusText.textContent = 'ABOUT:NETWORK';
      browserBody.innerHTML = '<p><strong>ABOUT:NETWORK</strong></p><p>VirtIO-Net · static 10.0.2.15/24 · DNS 10.0.2.3, 1.1.1.1, 8.8.8.8 · host bridge 10.0.2.2:8000</p>';
      return;
    }
    if (v === 'about:system'){
      browserView.dataset.mode = 'text';
      frameFallback.hidden = true; browserFrame.hidden = true; browserVideo.hidden = true;
      statusText.textContent = 'ABOUT:SYSTEM';
      browserBody.innerHTML = '<p><strong>ABOUT:SYSTEM</strong></p><p>x86_64 UEFI · Rust #![no_std] + Zig · Plasma compositor · zero Linux kernel dependencies</p>';
      return;
    }

    var yt = youTubeEmbedUrl(v);
    var isDirectVideo = /\.(mp4|webm|ogg|ogv)(\?.*)?$/i.test(v);

    if (isDirectVideo){
      browserView.dataset.mode = 'video';
      browserFrame.hidden = true; browserFrame.src = 'about:blank';
      browserVideo.hidden = false; browserVideo.src = v; browserVideo.play().catch(function(){});
      frameFallback.hidden = false;
      frameFallbackLink.href = v;
      statusText.textContent = 'PLAYING VIDEO: ' + v;
    } else if (/^https?:\/\//i.test(v)){
      var frameSrc = yt || v;
      browserView.dataset.mode = 'frame';
      browserVideo.hidden = true; browserVideo.pause();
      browserFrame.hidden = false; browserFrame.src = frameSrc;
      frameFallback.hidden = false;
      frameFallbackLink.href = v;
      statusText.textContent = 'LOADED: ' + v;
    } else {
      browserView.dataset.mode = 'text';
      frameFallback.hidden = true; browserFrame.hidden = true; browserVideo.hidden = true;
      statusText.textContent = 'NOT A URL';
      browserBody.innerHTML = '<p><strong>SPAWNOS CYBERNETIC WEB EXPLORER</strong></p><p>"'+v.replace(/</g,'&lt;')+'" doesn\'t look like a URL. Try a bookmark, an http(s):// address, or an about: page.</p>';
    }
  }

  document.getElementById('goBtn').addEventListener('click', function(){ navigateTo(urlInput.value); });
  urlInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') navigateTo(urlInput.value); });
  function resetBrowser(){ urlInput.value = 'about:home'; showHome(); }
  document.getElementById('homeBtn').addEventListener('click', function(){ navigateTo(HOME_URL); });
  showHome();

  /* ================= Settings ================= */
  function wireSeg(id, onChange){
    var seg = document.getElementById(id);
    seg.addEventListener('click', function(e){
      var btn = e.target.closest('button'); if (!btn) return;
      seg.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b===btn)); });
      onChange(btn.dataset.v);
      apiSaveSettings(currentSettingsSnapshot());
    });
  }
  wireSeg('paletteSeg', function(v){ desktopEl.setAttribute('data-palette', v); });
  wireSeg('invertSeg', function(v){ desktopEl.classList.toggle('inverted', v==='invert'); });
  wireSeg('motionSeg', function(v){ forcedMotion = v; syncMotionClass(); });
  wireSeg('pollSeg', function(v){ document.getElementById('pollOut').textContent = v + 'HZ POLL'; });

  function rebootToBoot(){
    windows.forEach(function(w){
      w.getAnimations().forEach(function(a){ a.cancel(); });
      w.hidden = true; w.classList.remove('maximized');
      delete w.dataset.placed; delete w.dataset.leaving; delete w.dataset.minimized;
    });
    Object.keys(taskTabs).forEach(function(id){ taskTabs[id].remove(); });
    taskTabs = {};
    activeWin = null;
    termOut.innerHTML = '';
    HISTORY = []; histIdx = -1;
    bootTime = Date.now();
    showHome(); urlInput.value = 'about:home';
    desktopEl.hidden = true;
    bootEl.hidden = false;
    bootLogEl.innerHTML = '';
    bootLogoEl.classList.remove('show');
    bootLoginEl.hidden = true;
    loginInput.value = '';
    bootLoginStatusEl.textContent = '';
    loginShown = false;
    bootDone = false;
    runBoot();
  }

  document.getElementById('rebootBtn').addEventListener('click', rebootToBoot);
  document.getElementById('logoutBtn').addEventListener('click', function(){
    try { localStorage.removeItem(LAST_USER_KEY); } catch(e){}
    currentUser = null;
    persistEnabled = false;
    userFiles = [];
    rebootToBoot();
  });
})();
