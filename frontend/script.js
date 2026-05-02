// AI Station — interactions
(function () {
  // ------- Theme toggle -------
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  let theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  root.setAttribute("data-theme", theme);

  if (toggle) {
    const setIcon = () => {
      toggle.innerHTML =
        theme === "dark"
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

      toggle.setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} mode`
      );
    };

    setIcon();

    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      setIcon();
    });
  }

  // ------- Nav scroll state -------
  const nav = document.getElementById("nav");

  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 8) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ------- Mobile menu -------
  const hamburger = document.querySelector(".nav__hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const open = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!open));

      if (!open) {
        mobileMenu.hidden = false;
        requestAnimationFrame(() => mobileMenu.classList.add("open"));
      } else {
        mobileMenu.classList.remove("open");
        mobileMenu.hidden = true;
      }
    });

    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        hamburger.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
        mobileMenu.hidden = true;
      });
    });
  }

  // ------- Reveal on scroll -------
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !prefersReduced) {
    const revealEls = document.querySelectorAll(
      ".section__head, .cat-card, .step, .price-card, .why, .persona, .loc, .faq__item, .contact__copy, .contact__form, .hero__trust"
    );

    revealEls.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 100px 0px" }
    );

    revealEls.forEach((el) => io.observe(el));

    setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }, 2000);
  }

  // ------- Contact form -------
  window.handleSubmit = function (e) {
    e.preventDefault();

    const form = e.target;
    const note = document.getElementById("formNote");
    const apiBase = window.AI_STATION_API_URL || "/api";

    const name = form.name?.value?.trim() || "";
    const email = form.email?.value?.trim() || "";
    const topic = form.topic?.value?.trim() || "";
    const message = form.message?.value?.trim() || "";

    note.hidden = false;
    note.className = "form-note";
    note.textContent = "Sending...";

    fetch(`${apiBase}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        phone: "",
        interest: topic,
        message
      })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to send message");
        }

        note.className = "form-note form-note--success";
        note.textContent = "Message sent successfully.";
        form.reset();
      })
      .catch((err) => {
        note.className = "form-note form-note--error";
        note.textContent = err.message || "Something went wrong.";
      });

    return false;
  };
})();
