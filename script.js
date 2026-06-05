const config = window.WEDDING_CONFIG;

const byId = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-IN", { minimumIntegerDigits: 2 });

function setConfigText() {
  document.querySelector("[data-config='familyLine']").textContent = config.couple.familyLine;
  document.querySelector("[data-config='groomDisplay']").textContent = config.couple.groomDisplay;
  document.querySelector("[data-config='brideDisplay']").textContent = config.couple.brideDisplay;
  document.querySelector("[data-config='weddingDateLabel']").textContent = config.couple.weddingDateLabel;
  document.title = `${config.couple.groom} & ${config.couple.bride} Wedding Invitation`;
}

function renderCountdown() {
  const target = new Date(config.couple.weddingDate).getTime();
  const timer = byId("countdownTimer");

  function tick() {
    const distance = Math.max(0, target - Date.now());
    const values = [
      ["Days", Math.floor(distance / 86400000)],
      ["Hours", Math.floor((distance / 3600000) % 24)],
      ["Minutes", Math.floor((distance / 60000) % 60)],
      ["Seconds", Math.floor((distance / 1000) % 60)]
    ];
    timer.innerHTML = values.map(([label, value]) => `
      <div class="time-box">
        <strong>${money.format(value)}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  tick();
  setInterval(tick, 1000);
}

function renderProfiles() {
  const people = [
    ["Groom", config.profiles.groom],
    ["Bride", config.profiles.bride]
  ];
  byId("profiles").innerHTML = people.map(([role, person]) => `
    <article class="profile-card" data-profile-role="${role.toLowerCase()}" data-aos="zoom-in">
      <div class="profile-role">${role}</div>
      <img src="${person.photo}" alt="${person.name}" loading="lazy">
      <div class="copy">
        <h3>${person.name}</h3>
        <strong>${person.family}</strong>
        <p>${person.description}</p>
      </div>
    </article>
  `).join("");
}

function renderEvents() {
  byId("eventCards").innerHTML = config.events.map((event) => `
    <article class="event-card" data-aos="fade-up">
      <div class="event-copy">
        <div class="event-title">
          <p>${event.id === "wedding" ? "Sacred Muhurtham" : "Grand Reception Evening"}</p>
          <h3>${event.type}</h3>
        </div>
        <div class="event-visual">
          <img src="${event.visual}" alt="${event.type}" loading="lazy">
        </div>
        <div class="event-meta">
          <div><strong>Date</strong><br>${event.date}</div>
          <div><strong>Time</strong><br>${event.time}</div>
          <div><strong>Venue</strong><br>${event.venue}</div>
          
        </div>
        <div class="event-actions">
          <a href="${event.mapLink}" target="_blank" rel="noopener">View Location</a>
          
        </div>
      </div>
      <div class="event-location">
        <h4>${event.type} Location</h4>
        <iframe class="map" src="${event.mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${event.type} map"></iframe>
      </div>
    </article>
  `).join("");
}

function renderGallery() {
  byId("galleryGrid").innerHTML = config.gallery.map((item, index) => `
    <figure class="gallery-item" data-aos="zoom-in" data-index="${index}">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <figcaption>${item.title}</figcaption>
    </figure>
  `).join("");
}

function renderFamilies() {
  byId("familyGrid").innerHTML = [
    ["Bride Family", config.families.bride],
    ["Groom Family", config.families.groom]
  ].map(([title, members]) => `
    <article class="family-card" data-aos="fade-up">
      <h3>${title}</h3>
      <ul>${members.map((member) => `<li>${member}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function setupWishes() {
  const form = byId("wishForm");
  const wishes = byId("wishes");
  const saved = JSON.parse(localStorage.getItem("wedding-wishes") || "[]");
  const submitButton = form.querySelector("button[type='submit']");

  function paint() {
    wishes.innerHTML = saved.map((wish) => `
      <article class="wish-card">
        <strong>${wish.name}</strong>
        <p>${wish.message}</p>
      </article>
    `).join("");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const wish = {
      name: byId("wishName").value.trim(),
      message: byId("wishMessage").value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!wish.name || !wish.message) return;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      if (config.blessings.googleSheetWebAppUrl) {
        await fetch(config.blessings.googleSheetWebAppUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            couple: `${config.couple.groom} & ${config.couple.bride}`,
            name: wish.name,
            message: wish.message,
            createdAt: wish.createdAt
          })
        });
      }

      if (config.blessings.saveLocalCopy !== false) {
        saved.unshift(wish);
        localStorage.setItem("wedding-wishes", JSON.stringify(saved));
        paint();
        if (window.gsap) {
          gsap.from(".wish-card:first-child", { y: 24, opacity: 0, duration: .45 });
        }
      }

      form.reset();
      submitButton.textContent = "Blessing Sent";
      setTimeout(() => {
        submitButton.textContent = "Submit Blessing";
      }, 1800);
    } catch (error) {
      submitButton.textContent = "Try Again";
      alert("Could not send your blessing. Please try again.");
    } finally {
      submitButton.disabled = false;
    }
  });

  paint();
}

function setupGallery() {
  const lightbox = byId("lightbox");
  const img = byId("lightboxImage");
  const caption = byId("lightboxCaption");

  byId("galleryGrid").addEventListener("click", (event) => {
    const item = event.target.closest(".gallery-item");
    if (!item) return;
    const data = config.gallery[Number(item.dataset.index)];
    img.src = data.image;
    img.alt = data.title;
    caption.textContent = data.title;
    lightbox.classList.add("is-open");
  });

  byId("closeLightbox").addEventListener("click", () => lightbox.classList.remove("is-open"));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.classList.remove("is-open");
  });
}

function createParticles() {
  const petals = byId("petals");
  const sparkles = byId("sparkles");
  for (let i = 0; i < 22; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.animationDuration = `${9 + Math.random() * 11}s`;
    petal.style.animationDelay = `${Math.random() * -12}s`;
    petal.style.setProperty("--x-drift", `${-60 + Math.random() * 120}px`);
    petals.appendChild(petal);
  }
  for (let i = 0; i < 46; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${Math.random() * 100}vw`;
    spark.style.animationDuration = `${5 + Math.random() * 8}s`;
    spark.style.animationDelay = `${Math.random() * -10}s`;
    spark.style.setProperty("--x-drift", `${-90 + Math.random() * 180}px`);
    sparkles.appendChild(spark);
  }
}

function setupMusic() {
  if (!config.music.enabled || !config.music.src) {
    return { play() {} };
  }

  const audio = new Audio(config.music.src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = config.music.volume ?? 0.55;

  function play() {
    audio.play().catch(() => {});
  }

  return { play };
}

function setupActions(music) {
  byId("openInvite").addEventListener("click", () => {
    byId("invitation").classList.remove("is-closed");
    music.play();
    byId("countdown").scrollIntoView({ behavior: "smooth" });

  });

  byId("backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupScroll() {
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    byId("progress").style.width = `${(scrollY / max) * 100}%`;
    byId("backTop").classList.toggle("is-visible", scrollY > innerHeight * .7);
  });
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}



function setupShareLinks() {
  const text = encodeURIComponent(`${config.couple.groom} & ${config.couple.bride} Wedding Celebration - ${config.couple.weddingDateLabel}`);
  const url = encodeURIComponent(location.href);
  byId("whatsappShare").href = `https://wa.me/?text=${text}%20${url}`;
  byId("facebookShare").href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
}

function animateIntro() {
  if (!window.gsap) return;
  gsap.from(".reveal", {
    y: 34,
    opacity: 0,
    duration: 1,
    stagger: .16,
    ease: "power3.out"
  });
}

window.addEventListener("load", () => {
  byId("loader").classList.add("is-hidden");
  if (window.AOS) {
    AOS.init({ once: true, duration: 820, easing: "ease-out-cubic" });
  }
  animateIntro();
});

setConfigText();
renderCountdown();
renderProfiles();
renderEvents();
renderGallery();
renderFamilies();
setupWishes();
setupGallery();
createParticles();
setupActions(setupMusic());
setupScroll();
setupShareLinks();
