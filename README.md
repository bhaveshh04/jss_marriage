# Maratha Vadhu Var Melava

Enter groom / bride bio-data once, then **print** it on A4, **download** it (PDF / image) or show it on a **big screen** for the whole hall.
UI is in English. Everything that is printed or displayed is in Marathi (Devanagari).

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Neon Postgres (free tier)

## 1. Set up (5 minutes)

1. Create a free project at https://neon.tech and copy the **pooled connection string**.
2. In this folder:
   ```bash
   npm install
   cp .env.example .env.local     # then edit it (DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET)
   npm run db:init                # creates the tables on Neon
   npm run db:seed                # optional: 7 sample profiles so you can try everything
   npm run dev                    # http://localhost:3000
   ```
3. Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env.local`.

Deploy: push to GitHub → import in Vercel → add the same env variables → deploy.

## 2. How it works

| Action | Where |
|---|---|
| Add / edit | **Add bio-data**. Live A4 preview updates as you type (wide screens). |
| Photos | Up to 3 per profile. The first is the main photo on the sheet. Resized in the browser before upload. |
| Print | Open a profile → **Print** (A4, no margins, colours preserved). Choose "Save as PDF" in the print dialog if you want a PDF that way. |
| Download | **Download PDF** or **Image** (PNG) from the profile page. |
| Display | **Display** on a profile = that profile full-size. **Live display** (top bar) = auto-playing slideshow of every visible profile. |

### Live display shortcuts
`→ / ←` next / previous · `Space` pause / play · `F` full screen · `H` hide controls.
Controls hide by themselves after 3.5 s. New profiles appear within a minute without reloading. The screen is kept awake.

### Marathi typing
Type English letters and press space: `patil ` becomes `पाटील `. This uses Google Input Tools in the browser, so it needs internet.
Each field has a small button to switch conversion on/off (education and company fields start with it off, since they are usually English). If you use a Marathi keyboard, switch the master toggle at the top of the form off.

### Privacy
Phone numbers and address are **hidden on the big screen** unless you switch on "Show contact details on the big screen" for that profile. They always appear on print / download.

## 3. Database
`db/schema.sql` mirrors your old table (`registration_id`, `candidate_name`, `father_*`, `uncle_*`, `pavati_*` …) with clean names, plus `gender`, `show_contact_on_screen` and a separate `candidate_photos` table. Delete is a soft delete (`is_deleted`).

## 4. Customise
- Event / organisation name and footer contact: `NEXT_PUBLIC_*` variables in `.env.local`.
- Bio-data layout: `src/components/BioDataSheet.tsx` (fixed A4, 794×1123 px).
- Form fields: `src/components/CandidateForm.tsx` (`SECTIONS`) and `src/lib/fields.ts`.
- Colours: `tailwind.config.ts` (kumkum, haldi, mehendi).

## 5. Notes
- Fonts (Manrope, Noto Sans/Serif Devanagari) are downloaded by `next/font` at build time, so the first build needs internet.
- Neon free tier is 0.5 GB; photos are compressed to roughly 60–150 KB each, so thousands of profiles fit.
- Old data: use `scripts/init-db.mjs` as a template to import rows from your previous database.
