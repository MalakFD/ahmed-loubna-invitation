
/*
  AHMED & LOUBNA — WEDDING INVITATION

  We will fill in the real wedding details
  and connect Google Apps Script later.
*/

const WEDDING = {
  date: "", // Example: 2027-06-20T19:00:00
  dateLabel: "Date to be announced",
  timeLabel: "Time to be announced",
  venueName: "Wedding venue name",
  venueAddress: "Venue address",
  mapsUrl: "https://maps.google.com/"
};

// Opening the envelope
const opening = document.getElementById("opening");
const invitation = document.getElementById("invitation");
const openButton = document.getElementById("open-envelope");

openButton.addEventListener("click", () => {
  if (opening.classList.contains("opening-done")) return;

  opening.classList.add("opening-done");
  openButton.disabled = true;

  // Allow the envelope animation to play.
  window.setTimeout(() => {
    opening.classList.add("hidden");
    invitation.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 1000);
});

// Insert the wedding details
document.getElementById("wedding-date").textContent =
  WEDDING.dateLabel;

document.getElementById("wedding-time").textContent =
  WEDDING.timeLabel;

document.getElementById("venue-name").textContent =
  WEDDING.venueName;

document.getElementById("venue-address").textContent =
  WEDDING.venueAddress;

document.getElementById("map-link").href =
  WEDDING.mapsUrl;

// Countdown
const countdown = document.getElementById("countdown");

function updateCountdown() {
  if (!WEDDING.date) {
    countdown.classList.add("hidden");
    return;
  }

  const target = new Date(WEDDING.date).getTime();

  if (!Number.isFinite(target)) {
    countdown.classList.add("hidden");
    return;
  }

  const remaining = target - Date.now();

  if (remaining <= 0) {
    countdown.classList.add("hidden");
    return;
  }

  countdown.classList.remove("hidden");

  document.getElementById("days").textContent =
    Math.floor(remaining / 86400000);

  document.getElementById("hours").textContent =
    Math.floor((remaining % 86400000) / 3600000);

  document.getElementById("minutes").textContent =
    Math.floor((remaining % 3600000) / 60000);

  document.getElementById("seconds").textContent =
    Math.floor((remaining % 60000) / 1000);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

// Show guest fields only when attending
const attendance = document.getElementById("attendance");
const guestFields = document.getElementById("guest-fields");
const guestCount = document.getElementById("guest-count");
const guestList = document.getElementById("guest-list");

function updateGuestFields() {
  const attending = attendance.value === "yes";

  guestFields.classList.toggle("hidden", !attending);
  guestCount.required = attending;
  guestList.required = attending;

  guestCount.disabled = !attending;
  guestList.disabled = !attending;
}

attendance.addEventListener("change", updateGuestFields);
updateGuestFields();

// RSVP — the backend will be connected in a later step.
const form = document.getElementById("rsvp-form");
const formMessage = document.getElementById("form-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  formMessage.textContent =
    "The RSVP form is not connected yet. Please wait until setup is complete.";

  formMessage.style.color = "#80612f";
});

