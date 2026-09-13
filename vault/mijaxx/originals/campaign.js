/**
 * Mayor MiLyfe — Campaign Integrations
 * Connects the mayor site to the HTC Campaign API, Listmonk, and Mastodon
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // CONFIG — Update these URLs when tunnels change or go to production
  // ═══════════════════════════════════════════════════════════════
  var API_BASE = "https://campaign-api.milyfe.fun"; // Campaign API — stable named-tunnel domain
  var LISTMONK_BASE = "https://list.milyfe.fun"; // Listmonk — stable named-tunnel subdomain (was an ephemeral trycloudflare URL)
  var LISTMONK_LIST_UUID = "7d05bab2-85e3-45ab-acf2-b0de27709188"; // Opt-in list

  // ═══════════════════════════════════════════════════════════════
  // PETITION FORM (#13)
  // ═══════════════════════════════════════════════════════════════
  window.submitPetition = function (e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector("button[type=submit]");
    var success = document.getElementById("petition-success");
    var error = document.getElementById("petition-error");

    var data = {
      signer_name: form.querySelector("[name=signer_name]").value.trim(),
      address: form.querySelector("[name=address]") ? form.querySelector("[name=address]").value.trim() : "",
      neighborhood: form.querySelector("[name=neighborhood]") ? form.querySelector("[name=neighborhood]").value.trim() : "",
      email: form.querySelector("[name=email]") ? form.querySelector("[name=email]").value.trim() : "",
      registered_voter: form.querySelector("[name=registered_voter]") ? form.querySelector("[name=registered_voter]").checked : false,
    };

    if (!data.signer_name) {
      showError(error, "Please enter your name.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Submitting...";

    fetch(API_BASE + "/petition/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) {
          form.reset();
          showSuccess(success, "Thank you! Signature #" + res.total_collected + " of 1,000. " + res.remaining + " more needed.");
          updatePetitionCounter(res.total_collected);
        } else {
          showError(error, res.detail || "Something went wrong. Please try again.");
        }
      })
      .catch(function () {
        showError(error, "Could not connect. Please try again later.");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Sign the Petition";
      });
  };

  // ═══════════════════════════════════════════════════════════════
  // VOLUNTEER FORM (#14)
  // ═══════════════════════════════════════════════════════════════
  window.submitVolunteer = function (e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector("button[type=submit]") || document.getElementById("vol-submit");
    var success = document.getElementById("vol-success");
    var error = document.getElementById("vol-error");

    var name = (form.querySelector("[name=name]") || {}).value || "";
    var email = (form.querySelector("[name=email]") || {}).value || "";
    var neighborhood = (form.querySelector("[name=neighborhood]") || {}).value || "";
    var skills = [];
    form.querySelectorAll("[name=skills]:checked").forEach(function (cb) {
      skills.push(cb.value);
    });

    if (!name.trim() || !email.trim()) {
      showError(error, "Name and email are required.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Submitting...";

    var params = new URLSearchParams({
      name: name.trim(),
      email: email.trim(),
      phone: "",
      neighborhood: neighborhood.trim(),
      skills: skills.join(","),
    });

    fetch(API_BASE + "/intake/volunteer?" + params.toString(), {
      method: "POST",
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) {
          form.reset();
          showSuccess(success, "Welcome aboard! We'll be in touch soon.");
          // Also subscribe them to email list
          subscribeEmail(name, email);
        } else {
          showError(error, res.detail || "Something went wrong.");
        }
      })
      .catch(function () {
        showError(error, "Could not connect. Please try again later.");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Sign Up to Volunteer";
      });
  };

  // ═══════════════════════════════════════════════════════════════
  // EMAIL SIGNUP (#15)
  // ═══════════════════════════════════════════════════════════════
  window.submitEmailSignup = function (e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector("button[type=submit]");
    var success = document.getElementById("email-success");
    var error = document.getElementById("email-error");

    var email = (form.querySelector("[name=email]") || {}).value || "";
    var name = (form.querySelector("[name=name]") || {}).value || "";

    if (!email.trim()) {
      showError(error, "Please enter your email.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Subscribing...";

    subscribeEmail(name, email)
      .then(function () {
        form.reset();
        showSuccess(success, "You're in! Check your inbox for updates.");
      })
      .catch(function () {
        showError(error, "Could not subscribe. Please try again.");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Subscribe";
      });
  };

  function subscribeEmail(name, email) {
    return fetch(LISTMONK_BASE + "/subscription/form", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=" + encodeURIComponent(email) + "&name=" + encodeURIComponent(name) + "&l=" + LISTMONK_LIST_UUID,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PETITION COUNTER (#16)
  // ═══════════════════════════════════════════════════════════════
  function loadPetitionStatus() {
    var counter = document.getElementById("petition-count");
    var progress = document.getElementById("petition-progress");
    var remaining = document.getElementById("petition-remaining");
    if (!counter) return;

    fetch(API_BASE + "/petition/status")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        updatePetitionCounter(data.collected);
        if (progress) progress.style.width = data.progress_percent + "%";
        if (remaining) remaining.textContent = data.remaining + " signatures remaining";
      })
      .catch(function () {
        counter.textContent = "—";
      });
  }

  function updatePetitionCounter(count) {
    var counter = document.getElementById("petition-count");
    if (counter) counter.textContent = count;
  }

  // ═══════════════════════════════════════════════════════════════
  // COUNTDOWN TIMERS (#17)
  // ═══════════════════════════════════════════════════════════════
  var DATES = {
    petition: new Date("2026-12-14T23:59:59-05:00"),
    qualifying: new Date("2027-01-11T08:00:00-05:00"),
    primary: new Date("2027-03-09T07:00:00-05:00"),
    general: new Date("2027-05-18T07:00:00-05:00"),
  };

  function updateCountdowns() {
    var now = new Date();
    Object.keys(DATES).forEach(function (key) {
      var el = document.getElementById("countdown-" + key);
      if (!el) return;
      var diff = DATES[key] - now;
      if (diff <= 0) {
        el.textContent = "TODAY";
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      el.textContent = days + "d " + hours + "h";
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MASTODON FEED (#18)
  // ═══════════════════════════════════════════════════════════════
  function loadMastodonFeed() {
    var feed = document.getElementById("mastodon-feed");
    if (!feed) return;

    // Use the public Mastodon API - update this URL when you have a real instance
    var mastodonUrl = "https://mastodon.social/api/v1/accounts/lookup?acct=milyfe";
    // For local dev: http://localhost:3004/api/v1/accounts/1/statuses?limit=5

    feed.innerHTML = '<p class="text-muted">Loading posts...</p>';

    fetch(mastodonUrl)
      .then(function (r) { return r.json(); })
      .then(function (account) {
        return fetch(account.url.replace("/@", "/api/v1/accounts/") + "/statuses?limit=5");
      })
      .then(function (r) { return r.json(); })
      .then(function (statuses) {
        if (!statuses || !statuses.length) {
          feed.innerHTML = '<p class="text-muted">No posts yet. Follow us on Mastodon!</p>';
          return;
        }
        var html = statuses.map(function (s) {
          var text = s.content.replace(/<[^>]*>/g, "").substring(0, 280);
          var date = new Date(s.created_at).toLocaleDateString();
          return '<div class="mastodon-post"><p>' + text + '</p><small>' + date + '</small></div>';
        }).join("");
        feed.innerHTML = html;
      })
      .catch(function () {
        feed.innerHTML = '<p class="text-muted">Follow us on <a href="https://mastodon.social/@milyfe" target="_blank" rel="noopener">Mastodon</a></p>';
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════
  function showSuccess(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(function () { el.style.display = "none"; }, 8000);
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(function () { el.style.display = "none"; }, 6000);
  }

  // ═══════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════
  document.addEventListener("DOMContentLoaded", function () {
    loadPetitionStatus();
    updateCountdowns();
    setInterval(updateCountdowns, 60000); // Update every minute
    loadMastodonFeed();
  });
})();
