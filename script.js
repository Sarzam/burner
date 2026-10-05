/* ------------------------------------------------------------------
   SETUP (one time):
   1. Go to https://web3forms.com and enter misbahsrshaikh@gmail.com
   2. They email you an "Access Key" - paste it below.
   Emails from the site will then land in that inbox.
------------------------------------------------------------------- */
const WEB3FORMS_ACCESS_KEY = "PASTE_YOUR_ACCESS_KEY_HERE";

/* ---------- Send email + navigate ---------- */
function notifyAndGo(buttonNumber, href) {
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: "Button " + buttonNumber + " clicked",
    from_name: "Ghost Website",
    message: "Button " + buttonNumber + " was clicked.",
    button: String(buttonNumber),
    time: new Date().toLocaleString()
  };

  // keepalive lets the request finish even as the page navigates away
  const request = fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(function () { /* never block the user if email fails */ });

  // Wait briefly for the request, but never longer than 1.5s
  Promise.race([
    request,
    new Promise(function (resolve) { setTimeout(resolve, 1500); })
  ]).then(function () {
    window.location.href = href;
  });
}

document.querySelectorAll("[data-button]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    btn.disabled = true;
    notifyAndGo(btn.dataset.button, btn.dataset.href);
  });
});

/* ---------- Runaway button (Button 3) ---------- */
const runaway = document.getElementById("runaway");

if (runaway) {
  const DANGER = 130; // px from the button's centre at which it flees
  let detached = false;

  function detach() {
    if (detached) return;
    const r = runaway.getBoundingClientRect();
    runaway.style.position = "fixed";
    runaway.style.width = r.width + "px";
    runaway.style.left = r.left + "px";
    runaway.style.top = r.top + "px";
    runaway.classList.add("runaway");
    detached = true;
  }

  function flee(px, py) {
    detach();
    const w = runaway.offsetWidth;
    const h = runaway.offsetHeight;
    const margin = 12;
    const maxX = window.innerWidth - w - margin;
    const maxY = window.innerHeight - h - margin;

    let x, y, tries = 0;
    do {
      x = margin + Math.random() * Math.max(maxX - margin, 1);
      y = margin + Math.random() * Math.max(maxY - margin, 1);
      tries++;
      // pick a spot that is far from the pointer
    } while (Math.hypot(x + w / 2 - px, y + h / 2 - py) < 220 && tries < 30);

    runaway.style.left = x + "px";
    runaway.style.top = y + "px";
  }

  function checkProximity(px, py) {
    const r = runaway.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    // treat the button as a rounded box: expand it by DANGER px
    const dx = Math.max(Math.abs(px - cx) - r.width / 2, 0);
    const dy = Math.max(Math.abs(py - cy) - r.height / 2, 0);
    if (Math.hypot(dx, dy) < DANGER * 0.6) flee(px, py);
  }

  document.addEventListener("mousemove", function (e) {
    checkProximity(e.clientX, e.clientY);
  });

  // Touch screens: dodge the moment a finger lands near it
  document.addEventListener("touchstart", function (e) {
    const t = e.touches[0];
    checkProximity(t.clientX, t.clientY);
  }, { passive: true });

  // Safety net: it can never actually be clicked
  runaway.addEventListener("click", function (e) {
    e.preventDefault();
    flee(e.clientX, e.clientY);
  });
  runaway.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    flee(e.clientX, e.clientY);
  });

  window.addEventListener("resize", function () {
    if (detached) flee(-999, -999);
  });
}
