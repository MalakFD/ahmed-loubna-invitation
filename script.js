const WEDDING = {
  // Format: YYYY-MM-DDTHH:MM:SS
  date: "2026-11-02T18:00:00",
  dateLabel: "2 Novembre 2026",
  timeLabel: "À partir de 18:00",
  venueName: "Wedding Venue",
  venueAddress: "Adresse de la salle",
  mapsUrl: "https://maps.google.com/",
  rsvpUrl: "" // Le lien Google Sheets sera connecté plus tard
};

const $ = (id) => document.getElementById(id);

// Initialisation des textes d'information
if ($("dateLabel")) $("dateLabel").textContent = WEDDING.dateLabel;
if ($("timeLabel")) $("timeLabel").textContent = WEDDING.timeLabel;
if ($("venueName")) $("venueName").textContent = WEDDING.venueName;
if ($("venueAddress")) $("venueAddress").textContent = WEDDING.venueAddress;
if ($("mapLink")) $("mapLink").href = WEDDING.mapsUrl;

// Animation d'ouverture de l'enveloppe au clic sur le sceau
if ($("openEnvelope")) {
  $("openEnvelope").addEventListener("click", () => {
    const screen = $("envelopeScreen");
    screen.classList.add("opening");

    // Attente de la fin de l'animation des rabats (800ms)
    setTimeout(() => {
      screen.classList.add("hidden");
      $("invitation").classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  });
}

// Compte à rebours
function updateCountdown() {
  if (!WEDDING.date || !$("countdown")) return;

  const target = new Date(WEDDING.date).getTime();
  if (Number.isNaN(target)) return;

  $("countdown").classList.remove("hidden");

  function tick() {
    const distance = target - Date.now();

    if (distance <= 0) {
      $("countdown").classList.add("hidden");
      return;
    }

    if ($("days")) $("days").textContent = String(Math.floor(distance / 86400000)).padStart(2, "0");
    if ($("hours")) $("hours").textContent = String(Math.floor((distance % 86400000) / 3600000)).padStart(2, "0");
    if ($("minutes")) $("minutes").textContent = String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0");
    if ($("seconds")) $("seconds").textContent = String(Math.floor((distance % 60000) / 1000)).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

updateCountdown();

// Gestion du formulaire RSVP
if ($("attendance")) {
  $("attendance").addEventListener("change", (event) => {
    const attending = event.target.value === "yes";
    if ($("guestCountWrap")) $("guestCountWrap").classList.toggle("hidden", !attending);
    if ($("guestCount")) $("guestCount").required = attending;
    if ($("guestNames")) $("guestNames").required = attending;
  });
}

if ($("rsvpForm")) {
  $("rsvpForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = $("rsvpMessage");
    const attending = $("attendance").value === "yes";

    if (attending && !$("guestNames").value.trim()) {
      if (message) message.textContent = "Veuillez entrer les noms de tous les invités présents.";
      return;
    }

    if (!WEDDING.rsvpUrl) {
      if (message) {
        message.textContent =
          "Merci ! Le formulaire d'aperçu n'est pas encore connecté au serveur. Revenez très bientôt.";
      }
      return;
    }

    const data = {
      guestName: $("guestName").value.trim(),
      attendance: $("attendance").value,
      guestCount: attending ? $("guestCount").value : 0,
      guestNames: attending ? $("guestNames").value.trim() : ""
    };

    try {
      if (message) message.textContent = "Envoi de votre réponse...";
      const response = await fetch(WEDDING.rsvpUrl, {
        method: "POST",
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Erreur d'envoi");

      if (message) message.textContent = "Merci ! Votre réponse a bien été enregistrée.";
      $("rsvpForm").reset();
      if ($("guestCountWrap")) $("guestCountWrap").classList.add("hidden");
    } catch (error) {
      if (message) {
        message.textContent =
          "Impossible d'envoyer votre réponse pour le moment. Veuillez contacter directement les mariés.";
      }
    }
  });
}
