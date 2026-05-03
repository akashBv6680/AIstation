(function () {
  const API = window.AIStationAPI;

  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function setLoading(button, isLoading, loadingText, normalText) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
  }

  function setupSmoothAnchors() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  async function handleContactSubmit(event) {
    event.preventDefault();

    if (!contactForm) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      interest: String(formData.get("interest") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setText(contactStatus, "Please fill name, email, and message.");
      return;
    }

    try {
      setLoading(submitBtn, true, "Sending...", "Send message");
      setText(contactStatus, "Sending your message...");

      const result = await API.createContact(payload);

      setText(
        contactStatus,
        result?.message || "Message sent successfully."
      );

      contactForm.reset();
    } catch (error) {
      setText(
        contactStatus,
        error.message || "Failed to send message."
      );
    } finally {
      setLoading(submitBtn, false, "Sending...", "Send message");
    }
  }

  function setupFAQ() {
    const faqItems = document.querySelectorAll(".faq-list details");

    faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;

        faqItems.forEach((other) => {
          if (other !== item) {
            other.removeAttribute("open");
          }
        });
      });
    });
  }

  function setupHeaderShadow() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 8) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  contactForm?.addEventListener("submit", handleContactSubmit);

  setupSmoothAnchors();
  setupFAQ();
  setupHeaderShadow();
})();
