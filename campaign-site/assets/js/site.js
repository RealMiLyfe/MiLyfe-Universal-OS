/* ─────────────────────────────────────────────────────────────
   MiJaxx site.js — live data + forms
   Resilient by design: every live element degrades gracefully
   when the campaign API is unreachable (nothing shows "broken",
   the site keeps working fully offline).
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // API base: explicit override → production domain → same-origin /api
  // (same-origin fallback lets the site run behind any reverse proxy,
  //  e.g. the sandbox preview where /api is proxied to the API server).
  var bases = [];
  if (window.CAMPAIGN_API_BASE) bases.push(window.CAMPAIGN_API_BASE);
  bases.push('https://campaign-api.milyfe.fun');
  if (window.location.protocol.indexOf('http') === 0) bases.push('/api');

  var chosenBase = null;

  function pickBase() {
    if (chosenBase) return chosenBase;
    // If the page itself is already being served from the campaign API
    // domain, prefer same-origin.
    var host = window.location.hostname;
    if (host === 'campaign-api.milyfe.fun' || host === 'www.campaign-api.milyfe.fun') {
      chosenBase = '';
    } else {
      chosenBase = bases[0] === '/api' ? '/api' : bases[0];
    }
    return chosenBase;
  }

  async function api(path, opts) {
    var lastErr = null;
    for (var i = 0; i < bases.length; i++) {
      var base = bases[i];
      var url = base.replace(/\/$/, '') + path;
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, 4000) : null;
      try {
        var res = await fetch(url, Object.assign({ headers: { Accept: 'application/json' }, signal: controller ? controller.signal : undefined }, opts || {}));
        if (timer) clearTimeout(timer);
        if (res.ok) return await res.json();
        // 4xx is a real answer from the API — don't try other bases.
        if (res.status >= 400 && res.status < 500) {
          var body = await res.json().catch(function () { return {}; });
          throw Object.assign(new Error(body.detail || 'Request failed'), { status: res.status, body: body });
        }
        lastErr = new Error('HTTP ' + res.status);
      } catch (e) {
        if (e && e.status) throw e; // real API error
        lastErr = e;
      }
    }
    throw lastErr || new Error('API unreachable');
  }

  // ── Live counters ─────────────────────────────────────────
  function setNum(el, value) {
    el.textContent = value === null || value === undefined ? '—' : value;
  }

  function markOffline(scope) {
    (scope || document).querySelectorAll('[data-live]').forEach(function (el) {
      el.classList.add('offline');
    });
  }

  function markLive(scope) {
    (scope || document).querySelectorAll('[data-live]').forEach(function (el) {
      el.classList.remove('offline');
    });
  }

  async function refreshLive() {
    try {
      var status = await api('/petition/status');

      document.querySelectorAll('[data-count="petition"]').forEach(function (el) {
        setNum(el, (status.collected || 0).toLocaleString());
      });
      document.querySelectorAll('[data-count="target"]').forEach(function (el) {
        setNum(el, (status.target || 1000).toLocaleString());
      });
      document.querySelectorAll('[data-count="remaining"]').forEach(function (el) {
        setNum(el, Math.max(0, (status.target || 1000) - (status.collected || 0)).toLocaleString());
      });
      document.querySelectorAll('[data-count="days"]').forEach(function (el) {
        setNum(el, Math.max(0, status.days_left || 0));
      });
      document.querySelectorAll('[data-count="pct"]').forEach(function (el) {
        setNum(el, (status.pct || 0).toFixed(status.pct < 10 ? 1 : 0) + '%');
      });
      document.querySelectorAll('[data-progress="petition"]').forEach(function (el) {
        var bar = el.querySelector('.bar');
        if (bar) bar.style.width = Math.min(100, status.pct || 0) + '%';
      });
      markLive();
    } catch (e) {
      markOffline();
    }

    // Scoreboard (illuminate page)
    var board = document.querySelector('[data-board]');
    if (board) {
      try {
        var s = await api('/metrics/scoreboard');
        var rows = board.querySelector('[data-board-miles]');
        if (rows && s.milestones) {
          rows.innerHTML = s.milestones.map(function (m) {
            var cls = 'milestone' + (m.done ? ' done' : '');
            return '<div class="' + cls + '"><span class="dot"></span>' +
              '<span class="date">' + esc(m.label) + '</span>' +
              '<span class="what">' + esc(m.description || '') + (m.days_left != null ? ' <strong>· ' + m.days_left + ' days</strong>' : '') + '</span></div>';
          }).join('');
        }
        if (s.election) {
          var cal = document.querySelector('[data-election-calendar]');
          if (cal) {
            cal.innerHTML = Object.keys(s.election).map(function (k) {
              return '<tr><td>' + esc(k) + '</td><td class="num">' + esc(s.election[k]) + '</td></tr>';
            }).join('');
          }
        }
        board.classList.remove('offline');
      } catch (e) {
        board.classList.add('offline');
      }
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Forms ────────────────────────────────────────────────
  function bindForm(id, path, okMsg, transform) {
    var form = document.getElementById(id);
    if (!form) return;
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      if (status) { status.className = 'form-status'; status.textContent = ''; }
      try {
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });
        if (transform) data = transform(data);
        var res = await api(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (status) {
          status.className = 'form-status ok';
          status.textContent = okMsg(res);
        }
        form.reset();
      } catch (e) {
        if (status) {
          status.className = 'form-status err';
          status.textContent = (e && e.body && e.body.detail)
            ? e.body.detail
            : 'Could not reach the campaign server. Please try again in a moment — or email us instead.';
        }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Sign the petition'; }
      }
    });
  }

  // ── Mobile nav ────────────────────────────────────────────
  function bindNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindNav();
    if (document.querySelector('[data-count]') || document.querySelector('[data-board]')) refreshLive();
    bindForm('petition-form', '/petition/add', function (r) {
      return 'Signed. Thank you — ' + (r && r.total != null ? r.total.toLocaleString() + ' total signatures and counting.' : 'you are part of this.');
    });
    bindForm('volunteer-form', '/intake/volunteer', function () {
      return 'You are on the team. We will reach out with next steps — check your phone for a text.';
    }, function (d) {
      d.skills = (d.skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      return d;
    });
    bindForm('contact-form', '/intake/external', function () {
      return 'Message received. A real human will get back to you.';
    }, function (d) {
      d.form = 'contact';
      return d;
    });
  });
})();
