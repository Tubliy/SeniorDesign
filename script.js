// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", (evt) => {
    if (evt.target.tagName === "A") {
      navLinks.classList.remove("open");
    }
  });
}

// Smooth scrolling for in-page links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (evt) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;

    evt.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Reveal-on-scroll animations
const animated = document.querySelectorAll("[data-animate]");

if ("IntersectionObserver" in window && animated.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  animated.forEach((el) => observer.observe(el));
} else {
  // Fallback: just show everything
  animated.forEach((el) => el.classList.add("revealed"));
}

/* ===========================
   Fake live GUI typing effect
   =========================== */

const statusEl = document.getElementById("sensor-status");
const outputEl = document.getElementById("sensor-output");

// Only run if the GUI elements exist on the page
if (statusEl && outputEl) {
  outputEl.classList.add("typing");

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomFloat(min, max, digits = 2) {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(digits));
  }

  function randomGesture() {
    const gestures = ["fist", "finger-gun", "open-hand", "idle"];
    return gestures[randomInt(0, gestures.length - 1)];
  }

  function generateFakeFrame() {
    const ts = new Date().toISOString();
    const gesture = randomGesture();
    const confidence = randomFloat(0.82, 0.99, 3);

    const coils = {
      coil_0: randomInt(11800, 12350),
      coil_1: randomInt(11800, 12350),
      coil_2: randomInt(11800, 12350),
      coil_3: randomInt(11800, 12350),
    };

    const imu = {
      pitch: randomFloat(-20, 20, 1),
      roll: randomFloat(-20, 20, 1),
      yaw: randomFloat(0, 360, 1),
    };

    // Make it look like structured log / JSON coming from the glove
    return (
`[${ts}] glove_frame {
  gesture: "${gesture}",
  confidence: ${confidence},
  coils: {
    ch0: ${coils.coil_0},
    ch1: ${coils.coil_1},
    ch2: ${coils.coil_2},
    ch3: ${coils.coil_3}
  },
  imu: {
    pitch_deg: ${imu.pitch},
    roll_deg:  ${imu.roll},
    yaw_deg:   ${imu.yaw}
  }
}`
    );
  }

  let buffer = "";
  let typingIndex = 0;
  let currentBlock = generateFakeFrame() + "\n\n";

  statusEl.textContent = "Streaming glove frames from ESP32 → GUI…";

  function typeStep() {
    // When we finish one block, append a new one and keep going
    if (typingIndex >= currentBlock.length) {
      currentBlock = generateFakeFrame() + "\n\n";
      typingIndex = 0;

      // Keep the console from growing forever
      if (buffer.length > 4000) {
        buffer = buffer.slice(Math.floor(buffer.length / 2));
      }
    }

    buffer += currentBlock.charAt(typingIndex);
    typingIndex++;

    outputEl.textContent = buffer;
    // Auto-scroll to bottom so it looks like a live console
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // Smaller interval = faster typing; bump this up if it's too fast
  setInterval(typeStep, 15);
}
