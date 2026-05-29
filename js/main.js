document.addEventListener("DOMContentLoaded", function () {
  // =========================================================================
  // PHONE MASK  (+7 (___) ___ - __ - __) — как в макете Figma
  // =========================================================================

  function applyPhoneMask(input) {
    let digits = input.value.replace(/\D/g, "");

    // Normalise leading country code so paste of "89001234567" still works
    if (digits.length && (digits[0] === "7" || digits[0] === "8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);

    let out = "+7";
    if (digits.length > 0) out += " (" + digits.slice(0, 3);
    if (digits.length >= 3) out += ")";
    if (digits.length > 3) out += " " + digits.slice(3, 6);
    if (digits.length > 6) out += " - " + digits.slice(6, 8);
    if (digits.length > 8) out += " - " + digits.slice(8, 10);

    input.value = out;
  }

  function isPhoneComplete(value) {
    // Full Russian number = 11 digits (7 + 10)
    return value.replace(/\D/g, "").length === 11;
  }

  document.querySelectorAll(".field__input--phone").forEach(function (input) {
    input.addEventListener("focus", function () {
      if (!this.value) this.value = "+7 (";
    });

    input.addEventListener("blur", function () {
      if (this.value === "+7 (" || this.value === "+7 " || this.value === "+7")
        this.value = "";
    });

    input.addEventListener("input", function () {
      applyPhoneMask(this);
      this.classList.remove("is-invalid");
    });

    // Let only digit keys and control keys through
    input.addEventListener("keydown", function (e) {
      const ctrl = e.ctrlKey || e.metaKey;
      const allowed =
        ctrl ||
        [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key);
      if (!allowed && !/^\d$/.test(e.key)) e.preventDefault();
    });
  });

  // =========================================================================
  // MODAL
  // =========================================================================

  const modal = document.getElementById("signup-modal");
  const modalForm = document.getElementById("modal-form");
  const modalSuccess = document.querySelector(".modal-success");
  const modalHint = document.getElementById("modal-model-hint");

  // — Open ——————————————————————————————————————————————————————————————————
  document.addEventListener("click", function (e) {
    const trigger = e.target.closest('[data-open-modal="signup"]');
    if (!trigger) return;

    // Optionally show which model was selected
    const model = trigger.dataset.model;
    if (modalHint) {
      if (model) {
        modalHint.textContent = "Выбранная модель: " + model;
        modalHint.hidden = false;
      } else {
        modalHint.hidden = true;
      }
    }

    modal.showModal();
  });

  // — Close: X button ———————————————————————————————————————————————————————

  modal.querySelector(".modal__close").addEventListener("click", function () {
    closeModal();
  });

  // — Close: backdrop click ——————————————————————————————————————————————————
  // When the user clicks the backdrop the event target IS the <dialog> itself

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  // — Reset & close ————————————————————————————————————————————————————————

  function closeModal() {
    modal.close();
    // Wait for the close animation (if any) before resetting internals
    setTimeout(resetModal, 200);
  }

  function resetModal() {
    modalForm.reset();
    modalForm.hidden = false;
    modalSuccess.hidden = true;
    if (modalHint) modalHint.hidden = true;
    clearInvalidState(modalForm);
    // Reset consent border
    const consent = modalForm.querySelector(".modal__consent");
    if (consent) consent.classList.remove("is-invalid");
  }

  // — Submit ————————————————————————————————————————————————————————————————

  modalForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const phoneInput = this.querySelector('[name="phone"]');
    const consentCheck = this.querySelector('[name="consent"]');
    const consent = consentCheck.closest(".modal__consent");
    let valid = true;

    if (!isPhoneComplete(phoneInput.value)) {
      phoneInput.classList.add("is-invalid");
      phoneInput.focus();
      valid = false;
    }

    if (!consentCheck.checked) {
      consent.classList.add("is-invalid");
      valid = false;
    }

    if (!valid) return;

    // Show success state
    this.hidden = true;
    modalSuccess.hidden = false;

    // Auto-close after 3 s
    setTimeout(closeModal, 3000);
  });

  // Remove invalid highlight when user interacts with consent checkbox
  const consentCheck = modalForm.querySelector('[name="consent"]');
  if (consentCheck) {
    consentCheck.addEventListener("change", function () {
      const wrapper = this.closest(".modal__consent");
      if (wrapper) wrapper.classList.remove("is-invalid");
    });
  }

  // =========================================================================
  // CTA FORM  (on-page "нет нужной модели")
  // =========================================================================

  const ctaForm = document.getElementById("cta-contact-form");

  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const phoneInput = this.querySelector('[name="phone"]');
			const checkboxInput = this.querySelector('[name="consent"]');
      // const successMsg = this.querySelector(".cta-form__success");
      let valid = true;
      let firstInvalid = null;

      if (checkboxInput.value.checked) {
        checkboxInput.classList.add("is-invalid");
        firstInvalid = firstInvalid || checkboxInput;
        valid = false;
      }

      if (!isPhoneComplete(phoneInput.value)) {
        phoneInput.classList.add("is-invalid");
        firstInvalid = firstInvalid || phoneInput;
        valid = false;
      }

      if (!valid) {
        firstInvalid.focus();
        return;
      }

      // Disable fields to prevent double-submit
      setFormDisabled(this, true);
      // successMsg.hidden = false;

      // Re-enable and reset after 5 s
      // setTimeout(function () {
      //   ctaForm.reset();
      //   successMsg.hidden = true;
      //   setFormDisabled(ctaForm, false);
      // }, 5000);
    });

    // Clear invalid highlight on re-input
    ctaForm.querySelectorAll(".field__input").forEach(function (input) {
      input.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    });
  }

  // =========================================================================
  // MOBILE MENU
  // =========================================================================

  const burger = document.querySelector(".header__burger");
  const headerNav = document.getElementById("header-mobile-nav");
  const navbar = document.querySelector(".navbar");

  const mMenuToggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector(".mobile__menu");
  const menuClose = document.querySelector(".menu__close");
  let isValid = false;

  const openMenu = (event) => {
    menu.classList.add("is-open");
    mMenuToggle.classList.add("close-menu");
    mMenuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    document.body.classList.add("menu-open");
  };

  const closeMenu = (event) => {
    menu.classList.remove("is-open");
    mMenuToggle.classList.remove("close-menu");
    mMenuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    document.body.classList.remove("menu-open");
  };

  mMenuToggle.addEventListener("click", (event) => {
    event.preventDefault();
    menu.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  if (menuClose) {
    console.log("closeMenu");
    menuClose.addEventListener("click", () => {
      closeMenu();
    });
  }

  if (burger && headerNav) {
    burger.addEventListener("click", function () {
      openMenu();
      const isOpen = headerNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    // Close nav when a link inside it is clicked
    headerNav.addEventListener("click", function (e) {
      if (e.target.closest(".header__nav-link")) {
        headerNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });

    // Close nav on outside click
    document.addEventListener("click", function (e) {
      if (
        !e.target.closest(".header") &&
        headerNav.classList.contains("is-open")
      ) {
        headerNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  function clearInvalidState(form) {
    form.querySelectorAll(".is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  function setFormDisabled(form, disabled) {
    form.querySelectorAll("input, button").forEach(function (el) {
      el.disabled = disabled;
    });
  }

  let currentModal;
  // let modalDialog;
  let alertModal = document.querySelector("#alert-modal");
	const modalDialog = document.querySelector("#signup-modal");

  const openBtns = document.querySelectorAll("[data-toggle=modal]");
	const closeBtns = document.querySelectorAll(".modal-close");

	// Открытие
 openBtns.forEach((openBtn) => {
		openBtn.addEventListener('click', () => {
			modalDialog.show(); // или .show() для немодального
		});

	// Закрытие
	closeBtns.forEach((closeBtn) => {
		closeBtn.addEventListener('click', () => {
			modalDialog.close();
			});
		});




// Закрытие по клику на overlay (через backdrop)
modalDialog.addEventListener('click', (e) => {
  if (e.target === modal) {
    modalDialog.close();
  }
});
    // button.addEventListener("click", (event) => {
    //   event.preventDefault();
    //   currentModal = document.querySelector(button.dataset.target);
    //   console.log(currentModal);
    //   currentModal.classList.toggle("is-open");
    //   modalDialog = currentModal.querySelector(".modal-dialog");
    //   currentModal.addEventListener("click", (event) => {
    //     if (!event.composedPath().includes(modalDialog)) {
    //       currentModal.classList.remove("is-open");
    //     }
    //   });
    // });
  });

  document.addEventListener("keyup", function (event) {
    if (event.key === "Escape" && currentModal.classList.contains("is-open")) {
      currentModal.classList.remove("is-open");
    }
  });

  const forms = document.querySelectorAll("form:not(.header__search)");
  forms.forEach((form) => {
    const validation = new JustValidate(form, {
      errorFieldCssClass: "is-invalid",
    });

		if (form.querySelector('[name="phone"]')) {
			validation.addField("[name=phone]", [
        {
          rule: "required",
          errorMessage: "Укажите телефон",
        },
      ])
		}

		if (form.querySelector('[name="email"]')) {
			validation.addField("[name=email]", [
        {
          rule: "required",
          errorMessage: "Укажите email",
        },
        {
          rule: "email",
          errorMessage: "Email не существует",
        },
      ])
		}
		if (form.querySelector('[name="consent"]')) {
			validation
      .addField("[name=consent]", [
        {
          rule: "required",
          errorMessage: "Нужно ваше согласие на обработку данных",
        },
      ],
			{
				autoDisabled: false,
			})
		}


      validation.onSuccess((event) => {
        isValid = true;
				const thisForm = event.target;
        const formData = new FormData(thisForm);
        const ajaxSend = (formData) => {
          fetch(thisForm.getAttribute("action"), {
            method: thisForm.getAttribute("method"),
            body: formData,
          }).then((response) => {
						console.log(response);
						// modalSuccess.open();
            if (response.ok) {
              thisForm.reset();
							modalSuccess.showModal();
              // if (!currentModal) return;
              // currentModal.classList.remove("is-open");
              // alertModal.classList.add("is-open");
              // currentModal = alertModal;
              // modalDialog = currentModal.querySelector(".modal-dialog");
              // currentModal.addEventListener("click", (event) => {
              //   if (!event.composedPath().includes(modalDialog)) {
              //     currentModal.classList.remove("is-open");
                // }
              // });
            } else {
              alert("Ошибка. Текст ошибки: " + response.status);
            }
          });
        };

        ajaxSend(formData);
      });
  });
});
