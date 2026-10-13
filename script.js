/* =========================================================
   Portfolio script
   1. Dark / light mode toggle (remembers the choice)
   2. Smooth scrolling for navigation links
   3. Highlight the nav link of the section in view
   4. Footer year
   5. Back to top button
   ========================================================= */

// Wait until the HTML is fully loaded before touching the page
document.addEventListener("DOMContentLoaded", function () {

    var root = document.documentElement;                       // the <html> element
    var themeToggle = document.getElementById("theme-toggle"); // the toggle button
    var STORAGE_KEY = "portfolio-theme";                       // localStorage key


    /* ---------- 1. Dark / light mode ---------- */

    // Read the saved theme. Returns null if nothing is saved or storage is blocked.
    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    // Save the chosen theme so it is kept after a page reload.
    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            // Storage is unavailable; the theme simply will not be remembered.
        }
    }

    // Apply a theme ("light" or "dark") to the page and update the button label.
    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);

        var isDark = theme === "dark";
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    }

    // Pick the starting theme: saved choice first, otherwise the device setting.
    function getInitialTheme() {
        var saved = getSavedTheme();
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    }

    // Switch to the opposite theme when the button is clicked.
    themeToggle.addEventListener("click", function () {
        var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        saveTheme(nextTheme);
    });

    applyTheme(getInitialTheme());


    /* ---------- 2. Smooth scroll ---------- */

    var navLinks = document.querySelectorAll(".nav__link");
    var anchorLinks = document.querySelectorAll('a[href^="#"]:not(.back-to-top)');

    // Scroll smoothly to the section an anchor link points to.
    function handleAnchorClick(event) {
        var targetId = this.getAttribute("href");
        var target = document.querySelector(targetId);

        if (!target) {
            return; // no matching section, let the browser handle it
        }

        event.preventDefault();

        // Skip the animation for people who prefer reduced motion
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });

        // Put the address bar link in sync (e.g. .../#projects)
        history.pushState(null, "", targetId);

        // Move keyboard focus to the section for screen reader and keyboard users
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
    }

    anchorLinks.forEach(function (link) {
        link.addEventListener("click", handleAnchorClick);
    });


    /* ---------- 3. Active nav link while scrolling ---------- */

    // The sections the nav links point to, in page order (the hero above them has no link).
    var sections = Array.prototype.map.call(navLinks, function (link) {
        return document.querySelector(link.getAttribute("href"));
    });

    // Mark the link of the section currently in view as active.
    function updateActiveLink() {
        var scrollPosition = window.scrollY + 140; // small offset for the sticky nav
        var atPageBottom =
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 4;
        var activeIndex = -1; // -1 = still in the hero, so no link is highlighted

        sections.forEach(function (section, index) {
            if (section && section.offsetTop <= scrollPosition) {
                activeIndex = index;
            }
        });

        // At the very bottom the short Contact footer should win
        if (atPageBottom) {
            activeIndex = sections.length - 1;
        }

        navLinks.forEach(function (link, index) {
            link.classList.toggle("is-active", index === activeIndex);
        });
    }

    // Run once on load, then on scroll (throttled with requestAnimationFrame).
    var ticking = false;
    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });
    updateActiveLink();


    /* ---------- 4. Footer year ---------- */

    // Keep the copyright year current automatically.
    var yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    /* ---------- 5. Back to top ---------- */

    // Scroll smoothly to the top of the page when the footer text is clicked.
    var backToTop = document.getElementById("back-to-top");
    if (backToTop) {
        backToTop.addEventListener("click", function (event) {
            event.preventDefault(); // the "#" href must not touch the address bar
            var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
            history.pushState(null, "", window.location.pathname);
        });
    }
});