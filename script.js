const cursor = document.querySelector(".cursor-tag");
const signalLine = document.querySelector(".signal-line");
const modeToggle = document.querySelector("[data-mode-toggle]");
const shuffle = document.querySelector("[data-shuffle]");
const videoModal = document.querySelector("[data-video-modal]");
const modalFrame = document.querySelector("[data-modal-frame]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalClose = document.querySelector("[data-modal-close]");
const entry = document.querySelector("[data-entry]");

const cursorWords = ["movement", "rhythm", "weight", "relation", "archive"];
let cursorWordIndex = 0;

entry?.addEventListener("click", () => entry.classList.add("is-dismissed"));

document.addEventListener("mousemove", (event) => {
  if (!cursor) return;
  cursor.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`;
});

document.querySelectorAll("[data-cursor]").forEach((element) => {
  element.addEventListener("mouseenter", () => {
    if (cursor) cursor.textContent = element.dataset.cursor;
  });
  element.addEventListener("mouseleave", () => {
    if (cursor) cursor.textContent = cursorWords[cursorWordIndex];
  });
});

document.addEventListener("click", () => {
  cursorWordIndex = (cursorWordIndex + 1) % cursorWords.length;
  if (cursor) cursor.textContent = cursorWords[cursorWordIndex];
});

modeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("alt");
  modeToggle.textContent = document.body.classList.contains("alt") ? "archive mode" : "performance mode";
});

shuffle?.addEventListener("click", () => {
  document.querySelector(".movement-grid")?.classList.toggle("is-shuffled");
  signalLine?.classList.remove("is-scanning");
  requestAnimationFrame(() => signalLine?.classList.add("is-scanning"));
});

function videoSource(trigger) {
  if (trigger.dataset.provider === "vimeo") {
    return `https://player.vimeo.com/video/${trigger.dataset.video}?autoplay=1`;
  }
  const start = trigger.dataset.start ? `&start=${trigger.dataset.start}` : "";
  return `https://www.youtube.com/embed/${trigger.dataset.video}?autoplay=1&rel=0&modestbranding=1${start}`;
}

document.querySelectorAll("[data-video]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    modalTitle.textContent = `${trigger.dataset.title}.video`;
    modalFrame.innerHTML = `<iframe src="${videoSource(trigger)}" title="${trigger.dataset.title}" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>`;
    videoModal.showModal();
  });
});

function closeVideo() {
  videoModal.close();
  modalFrame.replaceChildren();
}

modalClose?.addEventListener("click", closeVideo);
videoModal?.addEventListener("click", (event) => {
  if (event.target === videoModal) closeVideo();
});
videoModal?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeVideo();
});
