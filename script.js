```javascript
/* =====================================================
   CONFIGURATION DU MARIAGE
   ===================================================== */

const WEDDING = {
  // Mariage : 2 novembre 2026 à 18 h
  date: "2026-11-02T18:00:00",

  // Lien Google Maps
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eclaire",

  // À compléter après la configuration de Google Sheets
  rsvpUrl: ""
};

const $ = (id) => document.getElementById(id);


/* =====================================================
   INITIALISATION DU SITE
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===================================================
     LIEN GOOGLE MAPS
     =================================================== */

  const mapLink = $("mapLink");

  if (mapLink) {
    mapLink.href = WEDDING.mapsUrl;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
  }


  /* ===================================================
     OUVERTURE DE L'ENVELOPPE
     =================================================== */

  const envelopeScreen = $("envelopeScreen");
  const invitation = $("invitation");
  const openEnvelope = $("openEnvelope");

  function openInvitation() {
    if (!envelopeScreen || !invitation) {
      console.error(
        "Ouverture impossible : vérifiez les identifiants envelopeScreen et invitation dans index.html."
      );
      return;
    }

    // Évite les clics multiples pendant l'animation
    if (envelopeScreen.classList.contains("opening")) {
      return;
    }

    envelopeScreen.classList.add("opening");

    // Attend la fin de l'animation avant d'afficher l'invitation
    window.setTimeout(() => {
      envelopeScreen.classList.add("hidden");
      invitation.classList.remove("hidden");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 1000);
  }

  if (openEnvelope) {
    openEnvelope.addEventListener("click", (event) => {
      event.preventDefault();
      openInvitation();
    });
  } else {
    console.error(
      "Bouton introuvable : vérifiez id=\"openEnvelope\" dans index.html."
    );
  }


  /* ===================================================
     COMPTE À REBOURS
     =================================================== */

  function updateCountdown() {
    const countdown = $("countdown");

    if (!countdown || !WEDDING.date) {
      return;
    }

    const target = new Date(WEDDING.date).getTime();

    if (Number.isNaN(target)) {
      countdown.classList.add("hidden");
      return;
    }

    function tick() {
      const distance = target - Date.now();

      if (distance <= 0) {
        countdown.classList.add("hidden");
        return;
      }

      countdown.classList.remove("hidden");

      const values = {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000)
      };

      Object.entries(values).forEach(([id, value]) => {
        const element = $(id);

        if (element) {
          element.textContent = String(value).padStart(2, "0");
        }
      });
    }

    tick();

    if (!countdown.dataset.timerStarted) {
      countdown.dataset.timerStarted = "true";
      window.setInterval(tick, 1000);
    }
  }

  updateCountdown();


  /* ===================================================
     CHAMPS DES ACCOMPAGNANTS
     =================================================== */

  const attendanceSelect = $("attendance");
  const guestCountWrap = $("guestCountWrap");
  const guestCountInput = $("guestCount");
  const guestNamesInput = $("guestNames");

  function updateGuestFields() {
    if (!attendanceSelect || !guestCountWrap) {
      return;
    }

    const attending = attendanceSelect.value === "yes";

    guestCountWrap.classList.toggle("hidden", !attending);

    if (guestCountInput) {
      guestCountInput.required = attending;
    }

    if (guestNamesInput) {
      guestNamesInput.required = attending;
    }
  }

  if (attendanceSelect) {
    attendanceSelect.addEventListener("change", updateGuestFields);
    updateGuestFields();
  }


  /* ===================================================
     FORMULAIRE RSVP
     =================================================== */

  const rsvpForm = $("rsvpForm");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = $("rsvpMessage");
      const submitButton = rsvpForm.querySelector(
        'button[type="submit"]'
      );

      const guestName = $("guestName");
      const attendance = $("attendance");

      function showMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      if (!guestName || !attendance) {
        showMessage(
          "Une erreur est survenue. Merci de réessayer."
        );
        return;
      }

      const name = guestName.value.trim();
      const responseValue = attendance.value;
      const attending = responseValue === "yes";

      if (!name) {
        showMessage("Merci d'indiquer votre nom complet.");
        guestName.focus();
        return;
      }

      if (responseValue !== "yes" && responseValue !== "no") {
        showMessage("Merci de choisir une réponse.");
        attendance.focus();
        return;
      }

      let guestCount = 0;
      let guestNames = "";

      if (attending) {
        guestCount = Number(guestCountInput?.value || 0);
        guestNames = guestNamesInput?.value.trim() || "";

        if (
          !Number.isInteger(guestCount) ||
          guestCount < 1 ||
          guestCount > 20
        ) {
          showMessage(
            "Merci d'indiquer un nombre de personnes entre 1 et 20."
          );
          guestCountInput?.focus();
          return;
        }

        if (!guestNames) {
          showMessage(
            "Merci d'indiquer les noms des personnes présentes."
          );
          guestNamesInput?.focus();
          return;
        }
      }

      // Le formulaire n'est pas connecté tant que l'URL
      // du service Google Apps Script n'est pas renseignée.
      if (!WEDDING.rsvpUrl.trim()) {
        showMessage(
          "Le formulaire n'est pas encore connecté. Merci de réessayer plus tard ou de contacter les mariés."
        );
        return;
      }

      const data = {
        guestName: name,
        attendance: responseValue,
        guestCount: attending ? guestCount : 0,
        guestNames: attending ? guestNames : ""
      };

      try {
        if (submitButton) {
          submitButton.disabled = true;
        }

        showMessage("Envoi de votre réponse…");

        await fetch(WEDDING.rsvpUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8"
          },
          body: JSON.stringify(data)
        });

        showMessage(
          "La demande d'envoi a été effectuée. Vérifiez son enregistrement dans Google Sheets."
        );

        rsvpForm.reset();
        updateGuestFields();

      } catch (error) {
        console.error("Erreur lors de l'envoi RSVP :", error);

        showMessage(
          "Impossible d'envoyer votre réponse pour le moment. Merci de réessayer plus tard."
        );

      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

});
```
