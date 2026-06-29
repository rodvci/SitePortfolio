/* ============================================================
   main.js — Persistent Two-Column Intersection & Theme Module
   ============================================================ */

(function initSplitEngine() {

  // 0. LOADING SCREEN ENGINE
  (function () {
    const loadingScreen = document.getElementById('loadingScreen');

    if (!loadingScreen) return;

    // Apply saved theme before anything renders
    const savedTheme = localStorage.getItem('split-portfolio-theme');
    const prefLight  = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (savedTheme === 'light' || (!savedTheme && prefLight)) {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // LOADING BAR PROGRESS ANIMATION
    const barFill    = document.getElementById('loadingBarFill');
    const barPercent = document.getElementById('loadingPercent');
    const totalDuration = 2400; // ms — finishes just before fade-out at 2600ms
    const tickInterval  = 30;   // ms per tick
    const totalTicks    = totalDuration / tickInterval;
    let currentTick     = 0;

    // Ease-out curve so the bar decelerates toward 100%
    function easeOutQuad(t) { return t * (2 - t); }

    const barTimer = setInterval(() => {
      currentTick++;
      const progress = Math.min(currentTick / totalTicks, 1);
      const eased    = easeOutQuad(progress);
      const pct      = Math.round(eased * 100);

      if (barFill)    barFill.style.width = pct + '%';
      if (barPercent) barPercent.textContent = pct + '%';

      if (progress >= 1) clearInterval(barTimer);
    }, tickInterval);

    // Let the SVG animation play for ~2.6s then fade out
    setTimeout(() => {
      clearInterval(barTimer);
      if (barFill)    barFill.style.width = '100%';
      if (barPercent) barPercent.textContent = '100%';

      loadingScreen.classList.add('fade-out');
      loadingScreen.addEventListener('transitionend', () => loadingScreen.remove(), { once: true });
    }, 2600);
  })();

  // 1. DYNAMIC MOUSE CURSOR GLOW POINTER ENGINE
  const spotlight = document.getElementById('mouseSpotlight');
  if (spotlight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', (e) => {
      // Maps current absolute pointer vectors to CSS Root variables
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, { passive: true });
  }

  // 2. ACTIVE NAVIGATION INDICATOR CONTROLLER via IntersectionObserver
  const sections = document.querySelectorAll('.scroll-anchor');
  const navLinks = document.querySelectorAll('.indicator-nav a');

  if (sections.length && navLinks.length) {
    const streamObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            // Evaluates link mapping coordinates matching active viewport block
            const linkTarget = link.getAttribute('href') === `#${currentId}`;
            link.classList.toggle('active', linkTarget);
          });
        }
      });
    }, {
      // Bounds tracking calculations matched for wide sidebar scroll splits
      rootMargin: '-20% 0px -60% 0px'
    });

    sections.forEach(sec => streamObserver.observe(sec));
  }

  // 3. SECURE PERSISTENT UTILITY SYSTEM THEME CONTROLLER
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const floatingThemeToggle = document.getElementById('floatingThemeToggle');
  const floatingThemeIcon = document.getElementById('floatingThemeIcon');
  const rootElement = document.documentElement;
  const themeControl = themeToggle || floatingThemeToggle;
  const themeControlIcon = themeIcon || floatingThemeIcon;

  if (themeControl) {
    const savedTheme = localStorage.getItem('split-portfolio-theme');
    const nativeLightPref = window.matchMedia('(prefers-color-scheme: light)').matches;

    const applyTheme = (theme) => {
      rootElement.setAttribute('data-theme', theme);
      if (themeControlIcon) {
        themeControlIcon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    };

    if (savedTheme === 'light' || (!savedTheme && nativeLightPref)) {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }

    const toggleTheme = () => {
      const currentThemeSetting = rootElement.getAttribute('data-theme');
      const nextTheme = currentThemeSetting === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('split-portfolio-theme', nextTheme);
    };

    themeControl.addEventListener('click', toggleTheme);
  }

  // 4. TYPEWRITER EFFECT IMPLEMENTATION
  const typewriterElement = document.getElementById('typewriter');
  if (typewriterElement) {
    const typewriterTexts = [
      'Hello, World',
      'Web Designer',
      'UI/UX Designer',
      'Virtual Assistant',
      'Computer Engineer',
      'Social Media Manager',
      'Project Manager',
      'Tech Enthusiast',
      'Lifelong Learner'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 80;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    function typewriterLoop() {
      const currentText = typewriterTexts[textIndex];
      
      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      typewriterElement.textContent = currentText.substring(0, charIndex);

      let delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentText.length) {
        delay = pauseDuration;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        delay = 500;
      }

      setTimeout(typewriterLoop, delay);
    }

    typewriterLoop();
  }

  // 5a. TOAST NOTIFICATION HELPER
  function showToast(type, title, message) {
    // Remove any existing toast
    const existing = document.getElementById('cf-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cf-toast';
    toast.className = `cf-toast cf-toast--${type}`;
    toast.innerHTML = `
      <div class="cf-toast__icon">${type === 'success' ? '✓' : '✕'}</div>
      <div class="cf-toast__body">
        <p class="cf-toast__title">${title}</p>
        <p class="cf-toast__msg">${message}</p>
      </div>
      <button class="cf-toast__close" aria-label="Dismiss">&times;</button>
    `;
    document.body.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => toast.classList.add('cf-toast--visible'));

    // Close button
    toast.querySelector('.cf-toast__close').addEventListener('click', () => dismissToast(toast));

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => dismissToast(toast), 5000);
    toast._timer = timer;
  }

  function dismissToast(toast) {
    clearTimeout(toast._timer);
    toast.classList.remove('cf-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  // 5. CONTACT MODAL IMPLEMENTATION (optional — only runs if a modal exists)
  const connectBtn = document.getElementById('connectBtn');
  const closeModal = document.getElementById('closeModal');
  const connectModal = document.getElementById('connectModal');

  if (connectBtn && connectModal) {
    const openModal = (e) => {
      e.preventDefault();
      connectModal.classList.add('active');
      connectModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModalHandler = () => {
      connectModal.classList.remove('active');
      connectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    };

    connectBtn.addEventListener('click', openModal);

    if (closeModal) {
      closeModal.addEventListener('click', closeModalHandler);
    }

    connectModal.addEventListener('click', (e) => {
      if (e.target === connectModal) {
        closeModalHandler();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && connectModal.classList.contains('active')) {
        closeModalHandler();
      }
    });
  }

  // 5b. CONTACT FORM SUBMISSION — always active regardless of modal presence
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const formData = new FormData(contactForm);

      try {
        const response = await fetch('https://formspree.io/f/mojolvoj', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.reset();
          showToast('success', '✓ Message sent!', 'Thanks for reaching out — I\'ll get back to you soon.');
        } else {
          const data = await response.json();
          const errMsg = data.errors
            ? data.errors.map(err => err.message).join(', ')
            : 'Something went wrong. Please try again.';
          showToast('error', '✕ Failed to send', errMsg);
        }
      } catch (err) {
        showToast('error', '✕ Network error', 'Please check your connection and try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  // 6. SCROLL-TO-TOP BUTTON
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  function checkScrollTop() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 320) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  }

  window.addEventListener('scroll', checkScrollTop, { passive: true });
  document.addEventListener('DOMContentLoaded', checkScrollTop);

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // 7. INTERACTIVE TIMELINE LINE PROGRESS ENGINE
  function updateTimelineProgress() {
    const entries = document.querySelectorAll('.tl-entry');
    // Defines the activation threshold (75% from the top of the browser screen)
    const triggerLine = window.innerHeight * 0.75; 

    entries.forEach((entry) => {
      const line = entry.querySelector('.tl-line');
      if (!line) return;

      const rect = entry.getBoundingClientRect();

      // If the timeline item has passed our trigger threshold line
      if (rect.top < triggerLine) {
        const entryHeight = rect.height;
        const distanceScrolledPastTrigger = triggerLine - rect.top;
        
        // Calculate the progress ratio (0 to 100%) across the current item's height
        let progress = (distanceScrolledPastTrigger / entryHeight) * 100;
        progress = Math.min(Math.max(progress, 0), 100); // Guardrails boundaries

        line.style.setProperty('--line-progress', `${progress}%`);
      } else {
        line.style.setProperty('--line-progress', '0%');
      }
    });
  }

  // Register modern passive execution listeners for stutter-free scrolling
  window.addEventListener('scroll', updateTimelineProgress, { passive: true });
  window.addEventListener('resize', updateTimelineProgress, { passive: true });
  
  // Initialize on load to calculate starting states
  document.addEventListener('DOMContentLoaded', updateTimelineProgress);

  // 8. SKILLS TAB CONTROLLER
  document.querySelectorAll('.sk-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.sk-tab').forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.sk-panel').forEach(function(p) {
        p.classList.remove('active');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panelId = 'sk-' + tab.getAttribute('data-tab');
      var panel = document.getElementById(panelId);
      if (panel) panel.classList.add('active');
    });
  });

  // 10. DRAGGABLE SKILLS GRID ENGINE
  // CSS grid layout is preserved at all times — GSAP Draggable only handles
  // the drag gesture. On release, the dragged card is re-inserted before the
  // hovered target in the DOM, so the grid reflows naturally with no inline
  // positioning or width overrides.
  function initDraggableSkills(panel) {
    if (!panel || typeof gsap === 'undefined' || typeof Draggable === 'undefined') return;
    if (panel._draggableInit) return;
    panel._draggableInit = true;

    const cards = () => Array.from(panel.querySelectorAll('.sk-card'));

    cards().forEach(card => {
      // Clone used as a ghost placeholder while dragging
      let ghost = null;
      let overCard = null;

      const lift = gsap.to(card, {
        duration: 0.2,
        scale: 1.07,
        boxShadow: '0 18px 40px rgba(0,0,0,0.38)',
        zIndex: 50,
        paused: true,
        force3D: true,
      });

      new Draggable(card, {
        type: 'x,y',
        cursor: 'grabbing',

        onDragStart() {
          // Snapshot the card's grid position so the ghost fills its slot
          const r = card.getBoundingClientRect();
          ghost = card.cloneNode(true);
          ghost.style.visibility = 'hidden';
          ghost.style.pointerEvents = 'none';
          card.parentNode.insertBefore(ghost, card.nextSibling);

          // Pull the card out of grid flow so it floats above
          card.style.position = 'fixed';
          card.style.left     = r.left + 'px';
          card.style.top      = r.top  + 'px';
          card.style.width    = r.width + 'px';
          card.style.margin   = '0';
          card.style.zIndex   = '50';
          gsap.set(card, { x: 0, y: 0 });

          lift.play();
          this.update();
        },

        onDrag() {
          // Find which card the pointer is over
          card.style.pointerEvents = 'none';
          const el = document.elementFromPoint(this.pointerX, this.pointerY);
          card.style.pointerEvents = '';
          const target = el && el.closest('.sk-card');

          if (target && target !== card && target !== ghost && target.closest('.sk-panel') === panel) {
            if (target !== overCard) {
              overCard = target;
              // Move the ghost to signal where the card will land
              panel.insertBefore(ghost, target);
            }
          }
        },

        onRelease() {
          lift.reverse();

          // Drop: swap card into ghost's position, remove ghost
          if (ghost && ghost.parentNode) {
            panel.insertBefore(card, ghost);
            ghost.remove();
          }
          ghost    = null;
          overCard = null;

          // Reset inline styles so the grid takes over again
          gsap.set(card, { x: 0, y: 0, clearProps: 'position,left,top,width,margin,zIndex' });
        },
      });
    });
  }

  // Activate on the initially visible panel and on every tab switch
  function activateDraggablePanel(panel) {
    requestAnimationFrame(() => initDraggableSkills(panel));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const firstActive = document.querySelector('.sk-panel.active');
    if (firstActive) activateDraggablePanel(firstActive);
  });

  document.querySelectorAll('.sk-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const panel = document.getElementById('sk-' + tab.getAttribute('data-tab'));
      if (panel) setTimeout(() => activateDraggablePanel(panel), 50);
    });
  });

  // 9. 3D TILT EFFECT ON ABOUT PHOTO BADGE
  const $badge = document.querySelector('.about-photo-badge');
  if ($badge && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let badgeBounds;

    function rotateBadgeToMouse(e) {
      const leftX = e.clientX - badgeBounds.x;
      const topY  = e.clientY - badgeBounds.y;
      const center = {
        x: leftX - badgeBounds.width  / 2,
        y: topY  - badgeBounds.height / 2
      };
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      $badge.style.transform = `
        scale3d(1.07, 1.07, 1.07)
        rotate3d(
          ${center.y / 100},
          ${-center.x / 100},
          0,
          ${Math.log(distance) * 2}deg
        )
      `;

      const glowEl = $badge.querySelector('.glow');
      if (glowEl) {
        glowEl.style.backgroundImage = `
          radial-gradient(
            circle at
            ${center.x * 2 + badgeBounds.width  / 2}px
            ${center.y * 2 + badgeBounds.height / 2}px,
            #ffffff55,
            #0000000f
          )
        `;
      }
    }

    $badge.addEventListener('mouseenter', () => {
      badgeBounds = $badge.getBoundingClientRect();
      document.addEventListener('mousemove', rotateBadgeToMouse);
    });

    $badge.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', rotateBadgeToMouse);
      $badge.style.transform = '';
      const glowEl = $badge.querySelector('.glow');
      if (glowEl) glowEl.style.backgroundImage = '';
    });
  }

})();