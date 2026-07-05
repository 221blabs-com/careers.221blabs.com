# 221B Labs — Careers Site

A static careers site for **careers.221blabs.com**. No build step, no framework —
just `index.html`, `style.css`, `data.js`, and `app.js`.

- **Homepage** — 4 division boxes: Sales, Technical, Marketing, Design
- **Division pages** — list of specific open roles per division
- **Role pages** — full responsibilities/requirements + an application form
- Employment type is always **Part-time** (selectable) / **Full-time** (shown, disabled)
- On submit, the form POSTs a JSON payload to a **Make.com webhook** you configure below

---

## 1. Editing content

All role/department copy lives in **`data.js`**. Each department has a `roles` array —
add, remove, or edit role objects there; the site rebuilds itself automatically since
there's no static generation step. Fields per role:

```js
{
  id: "url-safe-slug",
  title: "Role title",
  oneLiner: "Shown in the division list",
  summary: "Shown at the top of the role page",
  responsibilities: [ "...", "..." ],
  requirements: [ "...", "..." ],
  niceToHave: [ "...", "..." ],
}
```

---

## 2. Wiring the Make.com webhook

### Step A — Create the scenario
1. In Make.com, create a new scenario.
2. Add a **Webhooks → Custom webhook** module as the trigger.
3. Click **Add**, name it (e.g. `221b-careers-applications`), and copy the generated URL.
4. Open `app.js` and replace the placeholder at the top:
   ```js
   const MAKE_WEBHOOK_URL = "https://hook.make.com/xxxxxxxxxxxxxxxxx";
   ```
5. Submit one test application from the site so Make.com can capture the payload
   structure (click "Redetermine data structure" in the webhook module if needed).

The payload sent on every submission looks like this:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 90000 00000",
  "resumeLink": "https://drive.google.com/...",
  "portfolioLink": "https://linkedin.com/in/janedoe",
  "coverNote": "Why they want the role...",
  "employmentType": "Part-time",
  "department": "Sales",
  "role": "Lead Generation Executive",
  "roleId": "lead-generation-executive",
  "appliedAt": "2026-07-05T10:22:00.000Z",
  "source": "careers.221blabs.com"
}
```

### Step B — Add a row to Google Sheets (for HR to review)
1. Add a **Google Sheets → Add a Row** module after the webhook trigger.
2. Connect your Google account and pick (or create) a sheet, e.g. with columns:
   `Applied At | Department | Role | Full Name | Email | Phone | Employment Type | Resume Link | Portfolio | Cover Note`
3. Map each column to the matching field from the webhook (Make.com will show them
   under the webhook module's output).

### Step C — Send a confirmation email via Resend
Make.com doesn't have a native Resend module, so use an **HTTP → Make a request** module:

1. Add an **HTTP** module after the webhook (can run in parallel with the Sheets module).
2. Configure it:
   - **URL:** `https://api.resend.com/emails`
   - **Method:** `POST`
   - **Headers:**
     - `Authorization: Bearer YOUR_RESEND_API_KEY`
     - `Content-Type: application/json`
   - **Body type:** Raw / JSON
   - **Body:**
     ```json
     {
       "from": "221B Labs Careers <careers@221blabs.com>",
       "to": ["{{email}}"],
       "subject": "We've received your application — 221B Labs",
       "html": "<p>Hi {{fullName}},</p><p>Thanks for applying for the <strong>{{role}}</strong> role at 221B Labs. Our team will review your application and get back to you if it's a fit.</p><p>— 221B Labs</p>"
     }
     ```
     (Use Make.com's mapping panel to insert the actual webhook fields instead of typing `{{ }}` manually.)
3. Before this works, verify your sending domain (`221blabs.com` or a subdomain like
   `mail.221blabs.com`) in the Resend dashboard under **Domains**, and add the DNS
   records they give you.

### Step D — Turn the scenario on
Save and toggle the scenario **ON** in Make.com. Every submission will now:
`Form submit → Webhook → Google Sheets row + Resend confirmation email` (in parallel).

---

## 3. Deploying to careers.221blabs.com

This is a fully static site, so any static host works. Two simple options:

### Option 1 — Netlify / Vercel / Cloudflare Pages (recommended)
1. Push this folder to a GitHub repo (or drag-and-drop the folder into Netlify's
   "Deploy manually" screen).
2. Deploy with default settings — no build command needed, publish directory is `/`.
3. In your host's dashboard, add a custom domain: `careers.221blabs.com`.
4. In your DNS provider (wherever `221blabs.com`'s DNS is managed), add the CNAME
   record the host gives you, usually something like:
   ```
   CNAME   careers   your-site-name.netlify.app
   ```

### Option 2 — Any basic static file host
Upload `index.html`, `style.css`, `data.js`, and `app.js` to the web root, then point
a `CNAME` record for `careers.221blabs.com` at that host.

---

## 4. Before going live — checklist

- [ ] Replace `MAKE_WEBHOOK_URL` in `app.js` with your real webhook URL
- [ ] Test a full submission end-to-end: form → Sheet row appears → email arrives
- [ ] Verify your sending domain in Resend (emails will fail silently otherwise)
- [ ] Proofread role copy in `data.js` for your actual current openings
- [ ] Point the `careers.221blabs.com` CNAME at your host
- [ ] Re-test on mobile — the form and division grid are both responsive by default
