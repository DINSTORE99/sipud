const menuButton =
  document.getElementById("menuButton");

const mobileMenu =
  document.getElementById("mobileMenu");

const year =
  document.getElementById("year");

menuButton.addEventListener(
  "click",
  () => {
    mobileMenu.classList.toggle(
      "active"
    );
  }
);

document
  .querySelectorAll(".mobile-menu a")
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {
        mobileMenu.classList.remove(
          "active"
        );
      }
    );

  });

year.textContent =
  new Date().getFullYear();

const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "show"
          );

        }

      });

    },
    {
      threshold: 0.12
    }
  );

document
  .querySelectorAll(
    ".section, .project, .info-card div"
  )
  .forEach(element => {

    element.classList.add(
      "reveal"
    );

    observer.observe(element);

  });
