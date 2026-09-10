const toastEl = document.getElementById("toast");

function toast(message){
  if(!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2200);
}

function scrollToSection(id){
  document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
}

document.querySelectorAll(".switcher button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".switcher button")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");
    document.body.dataset.theme = btn.dataset.theme;

    toast(
      btn.dataset.theme === "batman"
        ? "BATMAN MODE AKTIF 🦇"
        : "GOTHAM MODE AKTIF 🌃"
    );
  });
});

document.querySelectorAll(".filters button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filters button")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");
    toast("Filter: " + btn.textContent);
  });
});

document.getElementById("menuBtn")?.addEventListener("click", () => {
  scrollToSection("about");
  toast("Menu dibuka");
});

document.getElementById("soundBtn")?.addEventListener("click", () => {
  toast("Sound effect bisa ditambahkan di script.js");
});

document.getElementById("stopBtn")?.addEventListener("click", () => {
  toast("Sound dihentikan");
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.animate(
        [
          {opacity:0, transform:"translateY(25px)"},
          {opacity:1, transform:"translateY(0)"}
        ],
        {
          duration:500,
          fill:"forwards",
          easing:"ease-out"
        }
      );
      observer.unobserve(entry.target);
    }
  });
},{threshold:.08});

document.querySelectorAll(".tech,.project,.resource-group,.stat")
  .forEach(el => observer.observe(el));
