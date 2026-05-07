/* =============================================================
   Oliver Wang · Research Portfolio · interactions
   ============================================================= */

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const qaMode = /[?&]qa\b/.test(window.location.search);

  // Opt-in to reveal animations only after JS is ready.
  // Without this class, .reveal elements render normally.
  if (!prefersReducedMotion.matches && !qaMode) {
    document.documentElement.classList.add("js-ready");
  }

  /* ---- Footer year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Sticky header: solid-on-scroll ---- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Hero video pause/resume ---- */
  const heroVideo = document.querySelector(".hero-video");
  const motionToggle = document.querySelector("[data-video-toggle]");

  const playAutoplayVideo = (video) => {
    if (!video) return Promise.resolve(false);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const speed = parseFloat(video.dataset.speed);
    if (!Number.isNaN(speed) && speed > 0) {
      video.playbackRate = speed;
      video.defaultPlaybackRate = speed;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      return playPromise.then(() => true).catch(() => false);
    }
    return Promise.resolve(true);
  };

  const setToggleLabel = (isPlaying) => {
    if (!motionToggle) return;
    motionToggle.classList.toggle("is-paused", !isPlaying);
    motionToggle.setAttribute(
      "aria-label",
      isPlaying ? "Pause hero video" : "Play hero video"
    );
    const dot = motionToggle.querySelector(".dot");
    motionToggle.textContent = "";
    if (dot) motionToggle.append(dot);
    motionToggle.append(isPlaying ? " Pause" : " Play");
  };

  if (heroVideo && motionToggle) {
    const startHeroVideo = () => {
      heroVideo.loop = true;
      playAutoplayVideo(heroVideo)
        .then(() => setToggleLabel(true))
        .catch(() => setToggleLabel(false));
    };

    if (heroVideo.readyState >= 2) {
      startHeroVideo();
    } else {
      heroVideo.addEventListener("canplay", startHeroVideo, { once: true });
      try { heroVideo.load(); } catch (_) {}
      startHeroVideo();
    }

    motionToggle.addEventListener("click", () => {
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
        setToggleLabel(true);
      } else {
        heroVideo.pause();
        setToggleLabel(false);
      }
    });
  }

  const autoplayVideos = Array.from(document.querySelectorAll("video[autoplay]"));
  autoplayVideos.forEach((video) => {
    const startVideo = () => {
      playAutoplayVideo(video).catch(() => {});
    };

    video.addEventListener("loadeddata", startVideo, { once: true });
    video.addEventListener("canplay", startVideo, { once: true });
    try { video.load(); } catch (_) {}
    startVideo();
  });

  if ("IntersectionObserver" in window && autoplayVideos.length) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playAutoplayVideo(entry.target).catch(() => {});
          }
        });
      },
      { threshold: 0.2 }
    );
    autoplayVideos.forEach((video) => videoObserver.observe(video));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    autoplayVideos.forEach((video) => {
      playAutoplayVideo(video).catch(() => {});
    });
  });

  /* ---- Reveal-on-scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  const heroReveals = new Set(
    document.querySelectorAll(".hero .reveal")
  );

  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    // Synchronously reveal anything already in viewport on first paint
    // (forces layout via getBoundingClientRect), then observe the rest.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach((el) => {
      if (heroReveals.has(el)) return; // hero animates via CSS keyframes
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.95) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---- Scrollspy: highlight current nav link ---- */
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((a) =>
            a.classList.toggle("is-current", a.getAttribute("href") === id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }
})();
