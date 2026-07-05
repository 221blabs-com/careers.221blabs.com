/* ==========================================================================
   221B LABS — CAREERS APP
   Vanilla JS, hash-based router. No build step required.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG — paste your Make.com webhook URL below before deploying.
   See README.md for how to build the Make.com scenario end to end.
   -------------------------------------------------------------------------- */
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/1gk11fprn8yzznfkhfiewuib85x593xe";

const COMPANY = {
  name: "221B Labs",
  city: "India",
};

const $app = document.getElementById("app");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------- utils ---------------------------------- */

function escapeHtml(str){
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ordinal(index){
  return String(index + 1).padStart(2, "0");
}

function totalOpenRoles(){
  return DEPARTMENTS.reduce((sum, d) => sum + d.roles.length, 0);
}

function header(activeCrumb){
  return `
    <header class="site-header">
      <div class="wrap">
        <a href="#" class="brand">
          <span class="mark">221B</span>
          <span>Labs</span>
          <span class="city">— ${COMPANY.city}</span>
        </a>
        <nav>
          <a href="https://www.221blabs.com">About</a>
          <a href="#/">Careers</a>
          ${activeCrumb ? `<span class="crumb-current">${escapeHtml(activeCrumb)}</span>` : ""}
        </nav>
      </div>
    </header>
  `;
}


function footer(){
  return `
    <footer class="site-footer">
      <div class="wrap">
        <span>© ${new Date().getFullYear()} 221B Labs Private Limited</span>
        <span>Careers · ${COMPANY.city}</span>
      </div>
    </footer>
  `;
}

/* ---------------------------------- home page ---------------------------------- */

function renderHome(){
  const cards = DEPARTMENTS.map((d, i) => `
    <a class="division-card reveal" href="#/division/${d.id}">
      <div class="index">${ordinal(i)}</div>
      <h3>${escapeHtml(d.name)}</h3>
      <p>${escapeHtml(d.tagline)}</p>
      <div class="meta-row">
        <span>${d.roles.length} open role${d.roles.length === 1 ? "" : "s"}</span>
        <span class="open-link">View roles <span class="arrow">→</span></span>
      </div>
    </a>
  `).join("");

  $app.innerHTML = `
    ${header()}
    <section class="hero">
      <div class="hero-glow" id="hero-glow"></div>
      <div class="wrap">
        <div class="eyebrow"><span class="dot"></span> NOW HIRING</div>
        <h1>Join the team building <em>221B Labs</em>.</h1>
        <p class="lede">
          We are a fast-growing product and software company seeking talented part-time professionals to join our team. 
          We offer flexible schedules, meaningful ownership, and the opportunity to build products that create real-world impact.
        </p>
        <div class="file-index">
          <span><b>${totalOpenRoles()}</b> open roles</span>
          <span><b>4</b> departments</span>
          <!-- <span><b>Part-time</b> only, for now</span> -->
        </div>
      </div>
    </section>

    <section class="divisions">
      <div class="wrap">
        <div class="section-label reveal">Departments</div>
        <h2 class="reveal">Where would you like to work?</h2>
        <div class="division-grid">
          ${cards}
        </div>
      </div>
    </section>
    ${footer()}
  `;

  initHeroGlow();
  initReveal();
}

function initHeroGlow(){
  const glow = document.getElementById("hero-glow");
  const heroSection = document.querySelector(".hero");
  if(!glow || !heroSection || prefersReducedMotion) return;

  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glow.style.setProperty("--gx", x + "%");
    glow.style.setProperty("--gy", y + "%");
  });
}

/* ---------------------------------- division page ---------------------------------- */

function renderDivision(deptId){
  const dept = findDepartment(deptId);
  if(!dept){ renderNotFound(); return; }

  const rows = dept.roles.map((r, i) => `
    <a class="role-row reveal" href="#/division/${dept.id}/${r.id}">
      <span class="row-index">${ordinal(i)}</span>
      <div class="role-main">
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.oneLiner)}</p>
      </div>
      <div class="badges">
        <span class="badge">Part-time</span>
      </div>
      <span class="view-btn">View role →</span>
    </a>
  `).join("");

  $app.innerHTML = `
    ${header(dept.name)}
    <section class="page-head">
      <div class="wrap">
        <a class="back-link" href="#/">← All departments</a>
        <div class="division-eyebrow">${dept.name} / ${dept.roles.length} open roles</div>
        <h1>${escapeHtml(dept.name)}</h1>
        <p class="desc">${escapeHtml(dept.description)}</p>
      </div>
    </section>
    <section class="role-list">
      <div class="wrap">
        ${rows}
      </div>
    </section>
    ${footer()}
  `;

  initReveal();
}

/* ---------------------------------- role page ---------------------------------- */

function listBlock(title, items){
  if(!items || !items.length) return "";
  return `
    <section>
      <h2>${escapeHtml(title)}</h2>
      <ul>
        ${items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderRole(deptId, roleId){
  const found = findRole(deptId, roleId);
  if(!found){ renderNotFound(); return; }
  const { dept, role } = found;

  $app.innerHTML = `
    ${header(role.title)}
    <section class="role-hero">
      <div class="wrap">
        <a class="back-link" href="#/division/${dept.id}">← ${escapeHtml(dept.name)}</a>
        <div class="role-tagline">${escapeHtml(dept.name)}</div>
        <h1>${escapeHtml(role.title)}</h1>
        <div class="meta-line">
          <span>${COMPANY.city} · Remote-friendly</span>
          <span>Part-time</span>
        </div>
      </div>
    </section>

    <section class="role-body">
      <div class="wrap">
        <div class="role-content reveal">
          <section>
            <h2>About the role</h2>
            <p style="color:var(--text-mute); margin:0;">${escapeHtml(role.summary)}</p>
          </section>
          ${listBlock("What you'll do", role.responsibilities)}
          ${listBlock("What we're looking for", role.requirements)}
          ${listBlock("Nice to have", role.niceToHave)}
        </div>

        <aside class="apply-panel reveal">
          <div class="inner">
            <h3>Apply for this role</h3>

            <!--<p class="apply-sub">Takes about 3 minutes. We'll email you a confirmation right after you submit.</p>-->
            ${renderApplyForm(dept, role)}
          </div>
        </aside>
      </div>
    </section>
    ${footer()}
  `;

  wireApplyForm(dept, role);
  initReveal();
}

/* ---------------------------------- application form ---------------------------------- */

function renderApplyForm(dept, role){
  return `
    <form id="apply-form" novalidate>
      <div class="field">
        <label for="f-name">Full name</label>
        <input type="text" id="f-name" name="fullName" required autocomplete="name">
      </div>
      <div class="field">
        <label for="f-email">Email</label>
        <input type="email" id="f-email" name="email" required autocomplete="email">
      </div>
      <div class="field">
        <label for="f-phone">Phone number</label>
        <input type="tel" id="f-phone" name="phone" required autocomplete="tel">
      </div>
      <div class="field">
        <label for="f-resume">Resume link</label>
        <input type="url" id="f-resume" name="resumeLink" placeholder="Google Drive / Dropbox link" required>
        <div class="hint">Upload your resume to Drive, set sharing to "Anyone with the link", then paste it here.</div>
      </div>
      <div class="field">
        <label for="f-portfolio">Portfolio / LinkedIn <span style="text-transform:none;">(optional)</span></label>
        <input type="url" id="f-portfolio" name="portfolioLink" placeholder="Optional">
      </div>
      <div class="field">
        <label for="f-note">Why this role?</label>
        <textarea id="f-note" name="coverNote" placeholder="A few lines is plenty." required></textarea>
      </div>

      <div class="field">
        <label>Employment type</label>
        <div class="type-options">
          <label class="type-option selected" data-value="part-time">
            <input type="radio" name="employmentType" value="Part-time" checked>
            <div class="opt-title">Part-time</div>
            <div class="opt-note">Currently hiring</div>
          </label>
          <label class="type-option disabled" data-value="full-time">
            <input type="radio" name="employmentType" value="Full-time" disabled>
            <div class="opt-title">Full-time</div>
            <div class="opt-note">Not hiring right now</div>
          </label>
        </div>
      </div>

      <label class="consent">
        <input type="checkbox" id="f-consent" required>
        <span>I agree that 221B Labs can store and use my details above to evaluate this application.</span>
      </label>

      <button type="submit" class="submit-btn" id="apply-submit">Submit application</button>
      <div class="form-msg" id="apply-msg"></div>
    </form>
  `;
}

function wireApplyForm(dept, role){
  const form = document.getElementById("apply-form");
  if(!form) return;

  // Clicking the disabled full-time option should do nothing but stay visibly disabled.
  form.querySelectorAll(".type-option").forEach(opt => {
    opt.addEventListener("click", (e) => {
      if(opt.classList.contains("disabled")){
        e.preventDefault();
        return;
      }
      form.querySelectorAll(".type-option").forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("apply-msg");
    const submitBtn = document.getElementById("apply-submit");

    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    const payload = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      resumeLink: form.resumeLink.value.trim(),
      portfolioLink: form.portfolioLink.value.trim(),
      coverNote: form.coverNote.value.trim(),
      employmentType: form.employmentType.value,
      department: dept.name,
      role: role.title,
      roleId: role.id,
      appliedAt: new Date().toISOString(),
      source: "careers.221blabs.com",
    };

    if(MAKE_WEBHOOK_URL.includes("PASTE_YOUR_MAKE_COM_WEBHOOK_URL_HERE")){
      msg.className = "form-msg show err";
      msg.textContent = "Webhook not configured yet — set MAKE_WEBHOOK_URL in app.js.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    msg.className = "form-msg";
    msg.textContent = "";

    try{
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if(!res.ok) throw new Error("Webhook responded with " + res.status);

      form.reset();
      form.querySelectorAll(".type-option").forEach(o => o.classList.remove("selected"));
      form.querySelector('.type-option[data-value="part-time"]').classList.add("selected");

      msg.className = "form-msg show ok";
      msg.textContent = "Application received.";
      submitBtn.textContent = "Submit application";
      submitBtn.disabled = false;
    }catch(err){
      msg.className = "form-msg show err";
      msg.textContent = "Something went wrong sending your application. Please try again in a moment.";
      submitBtn.textContent = "Submit application";
      submitBtn.disabled = false;
    }
  });
}

/* ---------------------------------- 404 ---------------------------------- */

function renderNotFound(){
  $app.innerHTML = `
    ${header()}
    <section class="notfound">
      <div class="wrap">
        <h1>Page not found</h1>
        <p>That department or role doesn't exist (yet).</p>
        <a class="back-link" href="#/">← Back to all departments</a>
      </div>
    </section>
    ${footer()}
  `;
}

/* ---------------------------------- scroll reveal ---------------------------------- */

function initReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!items.length) return;

  if(prefersReducedMotion || !("IntersectionObserver" in window)){
    items.forEach(el => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if(entry.isIntersecting){
        const el = entry.target;
        const delay = Math.min(i, 6) * 60;
        setTimeout(() => el.classList.add("in-view"), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

  items.forEach(el => observer.observe(el));
}

/* ---------------------------------- router (with fade transition) ---------------------------------- */

function renderRoute(){
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);

  if(parts.length === 0){
    renderHome();
  }else if(parts[0] === "division" && parts[1] && !parts[2]){
    renderDivision(parts[1]);
  }else if(parts[0] === "division" && parts[1] && parts[2]){
    renderRole(parts[1], parts[2]);
  }else{
    renderNotFound();
  }
}

let isFirstRoute = true;

function route(){
  window.scrollTo(0, 0);

  if(isFirstRoute || prefersReducedMotion){
    isFirstRoute = false;
    renderRoute();
    return;
  }

  $app.classList.add("transitioning");
  setTimeout(() => {
    renderRoute();
    // Force a reflow so the browser registers the "before" state, then fade in.
    void $app.offsetWidth;
    $app.classList.remove("transitioning");
  }, 220);
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
