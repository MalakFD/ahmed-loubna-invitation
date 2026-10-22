const WEDDING = {
  // Format: YYYY-MM-DDTHH:MM:SS
  date: "2026-11-02T18:00:00",
  dateLabel: "November 2, 2026 — 18:00",
  timeLabel: "", // Laisse vide car l'heure est intégrée directement dans dateLabel
  venueName: "قاعة الأفراح إكلاط", // Salle des Fêtes Éclat
  venueAddress: "طريق القاعدة، سلا", // Route de la Base, Salé
  mapsUrl: "https://maps.google.com/?q=Salle+des+fetes+Eclat+Route+de+la+Base+Sale",
  rsvpUrl: "" // Le lien Google Sheets/backend sera connecté ici
};

const $ = (id) => document.getElementById(id);

// Initialisation des textes et attributs de langue
if ($("dateLabel")) $("dateLabel").textContent = WEDDING.dateLabel;

if ($("timeLabel")) {
  $("timeLabel").textContent = WEDDING.timeLabel;
  if (!WEDDING.timeLabel) {
    $("timeLabel").classList.add("hidden");
    $("timeLabel").style.display = "none";
  }
}

if ($("venueName")) {
  $("venueName").textContent = WEDDING.venueName;
  $("venueName").setAttribute("dir", "rtl");
  $("venueName").setAttribute("lang", "ar");
}

if ($("venueAddress")) {
  $("venueAddress").textContent = WEDDING.venueAddress;
  $("venueAddress").setAttribute("dir", "rtl");
  $("venueAddress").setAttribute("lang", "ar");
}

if ($("mapLink")) $("mapLink").href = WEDDING.mapsUrl;

// Animation d'ouverture de l'enveloppe au clic
if ($("openEnvelope")) {
  $("openEnvelope").addEventListener("click", () => {
    const screen = $("envelopeScreen");
    if (screen) {
      screen.classList.add("opening");

      setTimeout(() => {
        screen.classList.add("hidden");
        if ($("invitation")) {
          $("invitation").classList.remove("hidden");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 800);
    }
  });
}

// Compte à rebours dynamique
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

// Formulaire RSVP : Affichage conditionnel des invités
if ($("attendance")) {
  $("attendance").addEventListener("change", (event) => {
    const attending = event.target.value === "yes";
    if ($("guestCountWrap")) $("guestCountWrap").classList.toggle("hidden", !attending);
    if ($("guestCount")) $("guestCount").required = attending;
    if ($("guestNames")) $("guestNames").required = attending;
  });
}

// Soumission du formulaire RSVP
if ($("rsvpForm")) {
  $("rsvpForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = $("rsvpMessage");
    const attending = $("attendance").value === "yes";

    if (attending && !$("guestNames").value.trim()) {
      if (message) message.textContent = "Please enter the names of all attending guests.";
      return;
    }

    if (!WEDDING.rsvpUrl) {
      if (message) {
        message.textContent = "Thank you! Your response has been noted.";
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
      if (message) message.textContent = "Sending your response...";
      const response = await fetch(WEDDING.rsvpUrl, {
        method: "POST",
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Error sending");

      if (message) message.textContent = "Thank you! Your response has been recorded.";
      $("rsvpForm").reset();
      if ($("guestCountWrap")) $("guestCountWrap").classList.add("hidden");
    } catch (error) {
      if (message) {
        message.textContent = "Unable to send your response at the moment. Please contact the couple directly.";
      }
    }
  });
}
