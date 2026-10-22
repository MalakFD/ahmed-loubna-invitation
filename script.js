```javascript
/* =====================================================
   CONFIGURATION DU MARIAGE
   ===================================================== */

const WEDDING = {
  // Date et heure locales : 2 novembre 2026 à 18 h
  date: "2026-11-02T18:00:00",

  // Recherche Google Maps par nom du lieu uniquement.
  // À vérifier pour s'assurer qu'il s'agit de la bonne salle.
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eclaire",

  // À compléter après le déploiement du Google Apps Script.
  rsvpUrl: ""
};

const $ = (id) => document.getElementById(id);


/* =====================================================
   LIEN GOOGLE MAPS
   ===================================================== */

if ($("mapLink")) {
  $("mapLink").href = WEDDING.mapsUrl;
}


/* =====================================================
   OUVERTURE DE L'ENVELOPPE
   ===================================================== */

if ($("openEnvelope")) {
  $("openEnvelope").addEventListener("click", () => {
    const screen = $("envelopeScreen");
    const invitation = $("invitation");

    if (!screen || !invitation || screen.classList.contains("opening")) {
      return;
    }

    screen.classList.add("opening");

    // Laisse le temps à l'animation de se terminer.
    window.setTimeout(() => {
      screen.classList.add("hidden");
      invitation.classList.remove("hidden");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 900);
  });
}


/* =====================================================
   COMPTE À REBOURS
   ===================================================== */

function updateCountdown() {
  const countdown = $("countdown");

  if (!WEDDING.date || !countdown) {
    return;
  }

  // Cette date sans suffixe de fuseau horaire est interprétée
  // selon l'heure locale de l'appareil du visiteur.
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

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    if ($("days")) {
      $("days").textContent = String(days).padStart(2, "0");
    }

    if ($("hours")) {
      $("hours").textContent = String(hours).padStart(2, "0");
    }

    if ($("minutes")) {
      $("minutes").textContent = String(minutes).padStart(2, "0");
    }

    if ($("seconds")) {
      $("seconds").textContent = String(seconds).padStart(2, "0");
    }
  }

  tick();

  // Évite de créer plusieurs compteurs si la fonction est rappelée.
  if (!countdown.dataset.timerStarted) {
    countdown.dataset.timerStarted = "true";
    window.setInterval(tick, 1000);
  }
}

updateCountdown();


/* =====================================================
   AFFICHAGE DES CHAMPS ACCOMPAGNANTS
   ===================================================== */

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


/* =====================================================
   ENVOI DU FORMULAIRE RSVP
   ===================================================== */

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

    if (!guestName || !attendance) {
      if (message) {
        message.textContent =
          "Une erreur est survenue. Merci de réessayer.";
      }
      return;
    }

    const name = guestName.value.trim();
    const responseValue = attendance.value;
    const attending = responseValue === "yes";

    // Vérification du nom.
    if (!name) {
      if (message) {
        message.textContent =
          "Merci d'indiquer votre nom complet.";
      }
      guestName.focus();
      return;
    }

    // Vérification de la réponse.
    if (responseValue !== "yes" && responseValue !== "no") {
      if (message) {
        message.textContent =
          "Merci de choisir une réponse.";
      }
      attendance.focus();
      return;
    }

    let guestCount = 0;
    let guestNames = "";

    if (attending) {
      guestCount = Number(guestCountInput?.value || 0);
      guestNames = guestNamesInput?.value.trim() || "";

      if (!Number.isInteger(guestCount) ||
          guestCount < 1 ||
          guestCount > 20) {
        if (message) {
          message.textContent =
            "Merci d'indiquer un nombre de personnes entre 1 et 20.";
        }
        guestCountInput?.focus();
        return;
      }

      if (!guestNames) {
        if (message) {
          message.textContent =
            "Merci d'indiquer les noms des personnes présentes.";
        }
        guestNamesInput?.focus();
        return;
      }
    }

    // IMPORTANT : ne pas afficher une fausse confirmation
    // si le backend Google Sheets n'est pas encore configuré.
    if (!WEDDING.rsvpUrl.trim()) {
      if (message) {
        message.textContent =
          "Le formulaire n'est pas encore connecté. Merci de réessayer plus tard ou de contacter les mariés.";
      }
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

      if (message) {
        message.textContent = "Envoi de votre réponse…";
      }

      /*
       * Google Apps Script peut être appelé en mode no-cors
       * avec du texte JSON. Le navigateur ne permet alors pas
       * de lire la réponse du serveur : une requête terminée
       * ne garantit donc pas, à elle seule, que la ligne a été
       * enregistrée dans Google Sheets.
       *
       * Après le déploiement, testez une réponse et vérifiez
       * qu'elle apparaît bien dans la feuille Google Sheets.
       */
      await fetch(WEDDING.rsvpUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        body: JSON.stringify(data)
      });

      if (message) {
        message.textContent =
          "Votre demande d'envoi a été effectuée. La réception doit être vérifiée dans Google Sheets.";
      }

      rsvpForm.reset();
      updateGuestFields();

    } catch (error) {
      console.error("Erreur lors de l'envoi RSVP :", error);

      if (message) {
        message.textContent =
          "Impossible d'envoyer votre réponse pour le moment. Merci de réessayer plus tard.";
      }

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
```
