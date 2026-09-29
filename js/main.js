"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#nav-menu");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const revealElements = [...document.querySelectorAll(".reveal")];
  const backToTopButton = document.querySelector(".back-to-top");
  const contactForm = document.querySelector("#contact-form");

  const closeMenu = (returnFocus = false) => {
    menu.classList.remove("open");
    menuButton.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú de navegación");
    document.body.classList.remove("menu-open");

    if (returnFocus) {
      menuButton.focus();
    }
  };

  const openMenu = () => {
    menu.classList.add("open");
    menuButton.classList.add("active");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú de navegación");
    document.body.classList.add("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      closeMenu(true);
    }
  });

  document.addEventListener("click", (event) => {
    const clickedOutsideMenu = !menu.contains(event.target) && !menuButton.contains(event.target);

    if (clickedOutsideMenu && menu.classList.contains("open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && menu.classList.contains("open")) {
      closeMenu();
    }
  });

  const updateScrollInterface = () => {
    const hasScrolled = window.scrollY > 24;
    header.classList.toggle("scrolled", hasScrolled);
    backToTopButton.classList.toggle("visible", window.scrollY > 520);
  };

  updateScrollInterface();
  window.addEventListener("scroll", updateScrollInterface, { passive: true });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if ("IntersectionObserver" in window) {
    const navigationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const isCurrentSection = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", isCurrentSection);

            if (isCurrentSection) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-25% 0px -65%", threshold: 0 }
    );

    sections.forEach((section) => navigationObserver.observe(section));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  const fields = {
    name: {
      input: contactForm.elements.name,
      error: document.querySelector("#name-error"),
      validate: (value) => value.length >= 2,
      message: "Escribe un nombre de al menos 2 caracteres."
    },
    email: {
      input: contactForm.elements.email,
      error: document.querySelector("#email-error"),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Escribe un correo electrónico válido."
    },
    message: {
      input: contactForm.elements.message,
      error: document.querySelector("#message-error"),
      validate: (value) => value.length >= 10,
      message: "Escribe un mensaje de al menos 10 caracteres."
    }
  };

  const validateField = ({ input, error, validate, message }) => {
    const isValid = validate(input.value.trim());
    input.setAttribute("aria-invalid", String(!isValid));
    input.setAttribute("aria-describedby", error.id);
    error.textContent = isValid ? "" : message;
    return isValid;
  };

  Object.values(fields).forEach((field) => {
    field.input.addEventListener("input", () => {
      if (field.input.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fieldList = Object.values(fields);
    const results = fieldList.map(validateField);
    const firstInvalidIndex = results.findIndex((result) => !result);
    const status = document.querySelector("#form-status");

    if (firstInvalidIndex !== -1) {
      status.textContent = "Revisa los campos indicados antes de continuar.";
      fieldList[firstInvalidIndex].input.focus();
      return;
    }

    status.textContent = "Gracias por tu mensaje. Este formulario es demostrativo.";
    contactForm.reset();

    fieldList.forEach(({ input, error }) => {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      error.textContent = "";
    });
  });
});
