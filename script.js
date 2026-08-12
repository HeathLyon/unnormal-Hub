document.documentElement.classList.add("js");

/* =========================================================
   SOCIAL LINKS — EDIT THESE URLS
   Paste the real URL between the quotes.
   Leave blank ("") until you have the link.
   ========================================================= */
const SOCIAL_LINKS = {
  youtube: "https://www.youtube.com/@unnormalstories9051",
  instagram: "",       // Example: https://www.instagram.com/unnormalstories/
  coffee: "",          // Example: https://www.buymeacoffee.com/unnormalstories
  spotify: "https://podcasters.spotify.com/pod/show/unnormalstories",
  apple: "",
  reddit: ""
};

function applySocialLinks() {
  document.querySelectorAll("[data-social]").forEach(link => {
    const key = link.dataset.social;
    const url = SOCIAL_LINKS[key] || "";

    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.classList.remove("is-unset");
    } else {
      link.href = "#";
      link.classList.add("is-unset");
      link.removeAttribute("target");
      link.removeAttribute("rel");

      link.addEventListener("click", event => {
        event.preventDefault();
      });
    }
  });
}



/* =========================================================
   INTRO — runs first so the overlay can never get stuck
   ========================================================= */
const logoIntro = document.getElementById("logoIntro");

function dismissLogoIntro() {
  if (!logoIntro || logoIntro.classList.contains("is-finished")) return;

  logoIntro.classList.add("is-finished");
  document.body.classList.remove("intro-running");
  document.body.classList.add("intro-complete");

  window.setTimeout(() => {
    logoIntro.remove();
  }, 380);
}

if (logoIntro && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("intro-running");

  // Faster branded sting: about 1.4 seconds, then a short fade.
  window.setTimeout(dismissLogoIntro, 1400);

  // Optional skip: click/tap anywhere on the intro.
  logoIntro.addEventListener("click", dismissLogoIntro);
} else {
  logoIntro?.remove();
  document.body.classList.add("intro-complete");
}

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const dots = document.querySelectorAll(".dot");
const sections = document.querySelectorAll(".snap-section");
const revealItems = document.querySelectorAll(".reveal");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach(item => revealObserver.observe(item));

function updateActiveDot() {
  if (!sections.length || !dots.length) return;

  const center = window.innerHeight / 2;
  let activeSection = sections[0];
  let bestDistance = Infinity;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs((rect.top + rect.height / 2) - center);
    if (distance < bestDistance) {
      bestDistance = distance;
      activeSection = section;
    }
  });

  dots.forEach(dot => {
    dot.classList.toggle(
      "active",
      dot.getAttribute("href") === `#${activeSection.id}`
    );
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateActiveDot();
    ticking = false;
  });
}, { passive: true });

window.addEventListener("resize", updateActiveDot);

dots.forEach(dot => {
  dot.addEventListener("click", event => {
    event.preventDefault();
    const target = document.querySelector(dot.getAttribute("href"));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll('a[href="#"]').forEach(link => {
  link.addEventListener("click", event => event.preventDefault());
});

updateActiveDot();

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    revealItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * .95) item.classList.add("visible");
    });
  });
});


/* =========================================================
   COVER STACK HOVER SHUFFLE
   No HTML changes required.
   ========================================================= */
const coverStack = document.querySelector(".cover-stack");
const coverCards = coverStack ? Array.from(coverStack.querySelectorAll(".stack-cover")) : [];
const coverPositions = ["stack-pos-a", "stack-pos-b", "stack-pos-c"];
let coverShuffleTimer = null;
let lastCoverOrder = "";

function shuffledCoverPositions() {
  const result = [...coverPositions];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  const order = result.join("|");

  // Avoid occasionally "shuffling" into exactly the same layout.
  if (order === lastCoverOrder && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }

  lastCoverOrder = result.join("|");
  return result;
}

function applyCoverOrder(order = coverPositions) {
  coverCards.forEach((card, index) => {
    coverPositions.forEach(positionClass => card.classList.remove(positionClass));
    card.classList.add(order[index]);
  });
}

function shuffleCovers() {
  if (coverCards.length !== 3) return;
  applyCoverOrder(shuffledCoverPositions());
}

if (coverStack && coverCards.length === 3) {
  // Initial spread.
  applyCoverOrder(coverPositions);

  coverStack.addEventListener("mouseenter", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    coverStack.classList.add("is-shuffling");
    shuffleCovers();

    clearInterval(coverShuffleTimer);
    coverShuffleTimer = window.setInterval(shuffleCovers, 720);
  });

  coverStack.addEventListener("mouseleave", () => {
    coverStack.classList.remove("is-shuffling");
    clearInterval(coverShuffleTimer);
    coverShuffleTimer = null;

    // Leave them in a clean, readable spread after the hover ends.
    window.setTimeout(() => applyCoverOrder(coverPositions), 120);
  });
}


/* =========================================================
   STORY FORM — static-site mailto builder
   ========================================================= */
const storyForm = document.getElementById("storyForm");

if (storyForm) {
  storyForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!storyForm.reportValidity()) return;

    const data = new FormData(storyForm);
    const get = key => (data.get(key) || "").toString().trim();

    const subjectSummary = get("summary") || "Listener Story Submission";
    const subject = `Unnormal Stories Submission — ${subjectSummary}`.slice(0, 150);

    const body = [
      "UNNORMAL STORIES — LISTENER STORY SUBMISSION",
      "",
      `Name: ${get("name") || "Not provided"}`,
      `Email: ${get("email") || "Not provided"}`,
      `Story type: ${get("storyType") || "Not provided"}`,
      `Location: ${get("location") || "Not provided"}`,
      `Approximate date: ${get("date") || "Not provided"}`,
      `Other witnesses: ${get("witnesses") || "Not provided"}`,
      "",
      "SHORT SUMMARY",
      get("summary") || "Not provided",
      "",
      "FULL STORY",
      get("story") || "Not provided",
      "",
      "EVIDENCE / MEDIA",
      get("evidence") || "None described",
      "",
      "ADDITIONAL INFORMATION",
      get("followup") || "None",
      "",
      `Prefers anonymity: ${data.get("anonymous") ? "Yes" : "No"}`,
      `Permission to contact: ${data.get("contactPermission") ? "Yes" : "No"}`,
      "",
      "Generated from the Unnormal Stories website submission form."
    ].join("\n");

    const mailto = `mailto:unnormalstories@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const status = document.getElementById("formStatus");
    if (status) {
      status.textContent = "Opening your email app with the form information. Review it, attach any files, and send when ready.";
    }

    window.location.href = mailto;
  });
}


/* Apply configured platform URLs. */
applySocialLinks();
