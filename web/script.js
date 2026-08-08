const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const dots = document.querySelectorAll(".dot");
const sections = document.querySelectorAll(".snap-section");
const revealItems = document.querySelectorAll(".reveal");
const orbs = document.querySelectorAll(".orb");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach(item => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      dots.forEach(dot => {
        dot.classList.toggle("active", dot.getAttribute("href") === `#${id}`);
      });
    });
  },
  { threshold: 0.58 }
);

sections.forEach(section => sectionObserver.observe(section));

window.addEventListener("pointermove", event => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  orbs.forEach((orb, index) => {
    const strength = 10 + index * 7;
    orb.style.marginLeft = `${x * strength}px`;
    orb.style.marginTop = `${y * strength}px`;
  });
});

document.querySelectorAll('a[href="#"]').forEach(link => {
  link.addEventListener("click", event => event.preventDefault());
});
