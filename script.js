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
$("dateLabel").textContent = WEDDING.dateLabel;
$("timeLabel").textContent = WEDDING.timeLabel;
$("venueName").textContent = WEDDING.venueName;
$("venueAddress").textContent = WEDDING.venueAddress;
$("mapLink").href = WEDDING.mapsUrl;

// Animation d'ouverture de l'enveloppe au clic sur le sceau
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

// Compte à rebours
function updateCountdown() {
  if (!WEDDING.date) return;

  const target = new Date(WEDDING.date).getTime();
  if (Number.isNaN(target)) return;

  $("countdown").classList.remove("hidden");

  function tick() {
    const distance = target - Date.now();

    if (distance <= 0) {
      $("countdown").classList.add("hidden");
      return;
    }

    $("days").textContent = String(Math.floor(distance / 86400000)).padStart(2, "0");
    $("hours").textContent = String(Math.floor((distance % 86400000) / 3600000)).padStart(2, "0");
    $("minutes").textContent = String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0");
    $("seconds").textContent = String(Math.floor((distance % 60000) / 1000)).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

updateCountdown();

// Gestion du formulaire RSVP
$("attendance").addEventListener("change", (event) => {
  const attending = event.target.value === "yes";
  $("guestCountWrap").classList.toggle("hidden", !attending);
  $("guestCount").required = attending;
  $("guestNames").required = attending;
});

$("rsvpForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = $("rsvpMessage");
  const attending = $("attendance").value === "yes";

  if (attending && !$("guestNames").value.trim()) {
    message.textContent = "Veuillez entrer les noms de tous les invités présents.";
    return;
  }

  if (!WEDDING.rsvpUrl) {
    message.textContent =
      "Merci ! Le formulaire d'aperçu n'est pas encore connecté au serveur. Revenez très bientôt.";
    return;
  }

  const data = {
    guestName: $("guestName").value.trim(),
    attendance: $("attendance").value,
    guestCount: attending ? $("guestCount").value : 0,
    guestNames: attending ? $("guestNames").value.trim() : ""
  };

  try {
    message.textContent = "Envoi de votre réponse...";
    const response = await fetch(WEDDING.rsvpUrl, {
      method: "POST",
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Erreur d'envoi");

    message.textContent = "Merci ! Votre réponse a bien été enregistrée.";
    $("rsvpForm").reset();
    $("guestCountWrap").classList.add("hidden");
  } catch (error) {
    message.textContent =
      "Impossible d'envoyer votre réponse pour le moment. Veuillez contacter directement les mariés.";
  }
});
