/* ==========================================================================
   Hype Culture — Interactions
   Vanilla JS. No dependencies.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Navbar ---------------- */
  const nav = document.querySelector("[data-nav]");
  const burger = document.querySelector("[data-burger]");

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
    nav.querySelectorAll(".nav__mobile-panel a").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("is-open"));
    });
  }

  /* ---------------- Cursor-reactive glass shine + tilt ---------------- */
  const shineEls = document.querySelectorAll(".glass-shine");
  shineEls.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    });
    el.addEventListener("mouseleave", () => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    });
  });

  const tiltCard = document.querySelector("[data-tilt]");
  if (tiltCard && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const strength = 8;
    tiltCard.addEventListener("mousemove", (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.transform = `rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg)`;
    });
    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in-view"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = entry.target.dataset.revealDelay || 0;
              setTimeout(() => entry.target.classList.add("in-view"), Number(delay));
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------------- Sliders ---------------- */
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".slider__track");
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    const dotsWrap = slider.querySelector("[data-dots]");
    const cards = track ? Array.from(track.children) : [];
    if (!track || !cards.length) return;

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      cards.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", () => {
          cards[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
        dotsWrap.appendChild(dot);
      });
    }

    const updateDots = () => {
      if (!dotsWrap) return;
      const trackRect = track.getBoundingClientRect();
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const dist = Math.abs(r.left - trackRect.left);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      dotsWrap.querySelectorAll("button").forEach((d, i) => d.classList.toggle("is-active", i === closest));
    };

    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(updateDots);
    }, { passive: true });

    const scrollByCard = (dir) => {
      const card = cards[0];
      const gap = 22;
      const amount = (card.getBoundingClientRect().width + gap) * dir;
      track.scrollBy({ left: amount, behavior: "smooth" });
    };

    if (prev) prev.addEventListener("click", () => scrollByCard(-1));
    if (next) next.addEventListener("click", () => scrollByCard(1));
  });

  /* ---------------- Accordions (FAQ + articles) ---------------- */
  document.querySelectorAll("[data-accordion]").forEach((acc) => {
    acc.querySelectorAll(".accordion__item").forEach((item) => {
      const trigger = item.querySelector(".accordion__trigger");
      const panel = item.querySelector(".accordion__panel");
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        acc.querySelectorAll(".accordion__item").forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".accordion__panel").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("is-open");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  });

  /* ---------------- Article cards (expand in place) ---------------- */
  document.querySelectorAll(".article-card[data-expand]").forEach((card) => {
    const full = card.querySelector(".article-full");
    const trigger = card.querySelector("[data-expand-trigger]");
    const toggle = () => {
      const isOpen = card.classList.contains("is-open");
      card.classList.toggle("is-open");
      if (!isOpen) {
        full.style.maxHeight = full.scrollHeight + "px";
      } else {
        full.style.maxHeight = null;
      }
    };
    trigger.addEventListener("click", toggle);
  });

  /* ---------------- Contact form (static-site friendly) ---------------- */
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.querySelector("#name").value.trim();
      const message = contactForm.querySelector("#message").value.trim();
      const phone = "917067144537";
      const text = encodeURIComponent(
        `Hi Hype Culture, I'm ${name || "a visitor"} from your website.\n\n${message || "I'd like to know more about your packages."}`
      );
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    });
  }

  /* ---------------- Current year ---------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
