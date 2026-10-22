javascript

const WEDDING = {
  // Format: YYYY-MM-DDTHH:MM:SS
  date: "",
  dateLabel: "Date to be announced",
  timeLabel: "Time to be announced",
  venueName: "Wedding venue name",
  venueAddress: "Venue address",
  mapsUrl: "https://maps.google.com/",
  rsvpUrl: "" // We will connect the private Google Sheet later.
};

const $ = (id) => document.getElementById(id);

$("dateLabel").textContent = WEDDING.dateLabel;
$("timeLabel").textContent = WEDDING.timeLabel;
$("venueName").textContent = WEDDING.venueName;
$("venueAddress").textContent = WEDDING.venueAddress;
$("mapLink").href = WEDDING.mapsUrl;

$("openEnvelope").addEventListener("click", () => {
  const screen = $("envelopeScreen");
  screen.classList.add("opening");

  setTimeout(() => {
    screen.classList.add("hidden");
    $("invitation").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 650);
});

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
    message.textContent = "Please enter the names of all attending guests.";
    return;
  }

  if (!WEDDING.rsvpUrl) {
    message.textContent =
      "Thank you! The RSVP form is a preview and is not connected yet. Please check back soon.";
    return;
  }

  const data = {
    guestName: $("guestName").value.trim(),
    attendance: $("attendance").value,
    guestCount: attending ? $("guestCount").value : 0,
    guestNames: attending ? $("guestNames").value.trim() : ""
  };

  try {
    message.textContent = "Sending your RSVP...";
    const response = await fetch(WEDDING.rsvpUrl, {
      method: "POST",
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Submission failed");

    message.textContent = "Thank you! Your response has been received.";
    $("rsvpForm").reset();
    $("guestCountWrap").classList.add("hidden");
  } catch (error) {
    message.textContent =
      "We could not send your RSVP. Please contact the hosts directly.";
  }
});
