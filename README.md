# Satzora · Goethe A2 Intensiv

An intensive, independent preparation platform for the **Goethe-Zertifikat A2 for adults**. Satzora includes Lesen, Hören, Schreiben, Sprechen, an A2 curriculum, exam simulations, an interactive dictionary, and spaced-repetition flashcards. Satzora is not affiliated with the Goethe-Institut.

**Public app:** [satzora-green.vercel.app](https://satzora-green.vercel.app). `satzora.vercel.app` is already in use by another project. Production was deployed from GitHub `main`; the page and `/api/health` return HTTP 200. Authenticated study data is stored in Supabase. Online study requires an account; SQLite guest mode remains local and can be explicitly imported into an account.

## Run locally

Requirements: Node.js 26 and npm. The project was verified with Node.js 26.13.

```powershell
npm ci
npm run dev
```

Vite normally runs at `http://127.0.0.1:5173`; the same command starts the Express API at `http://127.0.0.1:3001`.

```powershell
npm run build
npm start
```

The production build is served at `http://127.0.0.1:3001`. Set `PORT` to change the port. In development, update the Vite proxy in `vite.config.ts` as needed.

## Verified learning content

| Module | Lessons | Activities |
| --- | ---: | ---: |
| Satzbau und Konnektoren | 8 | 120 |
| Vergangenheit | 8 | 120 |
| Die Fälle | 8 | 120 |
| Präpositionen | 8 | 120 |
| Verben | 8 | 120 |
| Adjektive und Pronomen | 8 | 120 |
| Arbeit und Kommunikation | 8 | 120 |
| Alltag und Reisen | 8 | 120 |
| Lesen, Hören und Schreiben | 8 | 120 |
| Goethe A2 Intensiv | 8 | 120 |
| **Total** | **80** | **1,200** |

Each lesson has an objective, Spanish and English explanations, eight annotated German examples, a common-error example, contextual vocabulary, and 15 activities across multiple formats. The curriculum validator checks the lesson structure and answer data; this is not an independent editorial review or a guarantee that every valid free response is accepted.

The 1,200 activities use 400 base contexts in different activity formats; they are not 1,200 independent passages. The structural inventory is in [docs/content-validation.json](docs/content-validation.json).

There are three original exam models and 36 exam audio files. Each model has 45 tasks: 20 Lesen questions, 20 Hören questions, two Schreiben tasks, and three Sprechen activities. Exam-model tasks are not counted toward the lesson total.

The practice-bank validator currently counts 20 reading materials, 12 listening activities, 28 writing prompts, and 86 oral cards grouped into 41 activities. The bank includes materials used by the three exam models and does not count those materials again as independent items. These validated counts remain below the larger requested goals: 100 reading materials, 100 listening activities, 150 writing prompts, 200 speaking cards, and 10 full exam models. See [docs/bank-validation.json](docs/bank-validation.json).

## Features

### Wortschatz – Flashcards

The initial curated vocabulary set contains 20 cards, with Spanish and English meanings and two original examples per entry. This is below the initial 500-card target. Users can also save words from the dictionary and exercises as personal cards. Cards include noun articles and plurals, relevant verb forms, pronunciation when a German browser voice is available, and examples in context.

The scheduling algorithm is a documented adaptation of SM-2, not an identical implementation. “Again” schedules a review in 10 minutes and resets the streak. Initial successful intervals vary by rating; mastery requires at least three consecutive successes and a 21-day interval. Daily limits start at 10 new cards and 30 reviews and are customizable. Reverse cards accept a correct noun article or no article; spelling normalization preserves umlauts and ß.

Authenticated review history and scheduling use Supabase. Local guest progress uses SQLite. Dictionary help is disabled during an active exam.

### Lessons and daily practice

- Searchable, filterable lesson catalog with open access, progress, resume, repeat, and module review.
- Practice bank filters by skill, exam part, and topic; it avoids recent activities, supports error review, and records history.
- **A2 Intensiv** sessions of 15, 30, 45, or 60 minutes, for all skills or a selected skill/topic. The heuristic prioritizes weak topics, unseen questions, and recent objective results; it does not predict an exam outcome.
- **Meine Fehler** groups objectively incorrect answers by topic and offers related practice. Free writing is not marked wrong merely because it differs from one model answer.
- Statistics are based on persisted attempts. A completed activity means it was finished with answers submitted; mastery reflects reference answers in closed-response exercises.
- Tap German words to open the curated dictionary. Local lookups resolve validated inflections; unknown terms use a rate-limited, cached Wiktionary definition fallback where available. Fallback glosses are attributed and do not invent a Spanish translation. External entries are not yet persistable as personal flashcards. Run `npm run audit:dictionary` for measured offline coverage and the unresolved-term report; see [docs/dictionary-coverage.md](docs/dictionary-coverage.md).
- Goethe Schreiben tasks use structured situation, format, three required points, and word-count fields in both the practice `RunView` and the exam `ExamView`. Guided curriculum writing prompts without three actual points remain unchanged. Run `npm run audit:writing` to check task inventory and structure.
- Light/dark themes and the Spanish/English interface preference persist. German lesson titles, module names, and skill names remain in German.
- Speaking practice supports recording through `MediaRecorder` where supported; HTTPS or localhost is required. Text entry remains available.

### Goethe A2 exam simulator

The simulator follows the public adult-exam structure without copying Goethe content or identity graphics:

- **Lesen:** 30 minutes; four parts with five questions each (article, information, email, and advertisements). One matching item allows “X” when no advertisement fits.
- **Hören:** about 30 minutes; four parts with five questions each and playback limits of 2 / 1 / 1 / 2. Part 2 uses nine pictograms; Part 3 includes image choices. The pictograms are original emoji and can look different across devices.
- **Schreiben:** 30 minutes; one 20–30-word SMS and one 30–40-word email, each with three required points.
- **Sprechen:** about 15 minutes for two participants: personal questions, a daily-life topic, and shared planning.

Practice Mode provides dictionary help, explanations, and replay. Exam Mode uses server-held deadlines, disables hints and transcripts until completion, and limits audio plays. A full simulation schedules consecutive 30 + 30 + 30 + 15-minute sections. Audio clips start manually; the simulator does not reproduce the full official room timing or playback cadence. A browser exam is not cheat-proof.

Closed-response grading tolerates punctuation, capitalization, and spacing. Alternative word orders not recognized by the validator remain pending rather than being marked automatically wrong. Written and spoken responses are saved. Without an external service, feedback is an indicative checklist; word and connector counts alone do not assess grammar, task completion, coherence, or pronunciation. No official Goethe scores or certificates are generated.

### Optional AI feedback and transcription

Copy `.env.example` to `.env` and configure a text provider on the server. Gemini is supported for writing feedback and dialogue; the default model is `gemini-2.5-flash-lite`. Never put private keys in `VITE_` variables.

- `A2_AI_PROVIDER`: `gemini` or `openai` (if omitted, Gemini is preferred when its key exists).
- `GEMINI_API_KEY`: server-only key from Google AI Studio.
- `GEMINI_TEXT_MODEL`: defaults to `gemini-2.5-flash-lite`.
- `OPENAI_API_KEY`: enables transcription; also required for OpenAI text feedback if selected.
- `OPENAI_TEXT_MODEL`: writing feedback and turn-based dialogue when `A2_AI_PROVIDER=openai`.
- `OPENAI_TRANSCRIBE_MODEL`: transcription model; the example uses `gpt-4o-mini-transcribe`.
- `OPENAI_SPEECH_MODEL`: optional speech generation.

**Gemini free-tier privacy:** Google lists Gemini 2.5 Flash-Lite with free-tier access subject to quotas and rate limits. Google states that content submitted through unpaid Gemini API services may be used to improve its products. satzivo discloses this before the review request; students should avoid including personal or sensitive information. Free availability and limits may change. See [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) and [additional terms](https://ai.google.dev/gemini-api/terms).

Content is sent only after the corresponding action is selected. Transcribed text cannot assess pronunciation. Dialogue is turn-based, not a live call. Without an AI service, learners can record, listen back, or practice with another person.

### Accounts, cloud data, and local data

Supabase Auth provides accounts. Authenticated profiles, preferences, study sessions, responses, exam results, saved words, flashcards, reviews, and private recordings use the `dl_*` tables and Supabase Storage under Row Level Security. The server identifies each user from the verified access token; clients do not choose an arbitrary `user_id`.

Guest progress continues to use the local SQLite database at `data/deutsch-lernen.sqlite`; `DATA_DIR` changes its location. The preserved backup is `data/backup-before-cloud-1794124894385.sqlite`. Neither file is committed. Guest data is not a shared server-side store in Vercel. Importing guest data is explicit and idempotent; it is never done automatically.

The Vercel API blocks shared SQLite study routes. On the web, learners must sign in to study and sync across devices. Temporary disconnections and stale revisions are handled without silently overwriting newer cloud data. Daily dates use `America/Mexico_City`; recorded study time is elapsed time, not a measure of active attention.

The Supabase Keep-Alive workflow is not configured yet. It requires a dedicated least-privilege PostgreSQL role and secrets in Vercel and GitHub. See [docs/supabase-keepalive.md](docs/supabase-keepalive.md). It cannot guarantee that a free Supabase project will avoid inactivity pauses.

## Validation

```powershell
npm run validate:content
npm run validate:exams
npm run validate:bank
npm test
npm run test:ui
npm run build
```

On 8 November 2026, 66 server/content tests, four UI tests, and the production build passed. The Vercel Production page and health endpoint returned HTTP 200. An unauthenticated cloud-study request returned 401; a test account received HTTP 200 from the authenticated Production study API. Real Supabase test accounts A/B verified imports, idempotent retries, and user isolation. A Vercel Preview test created a study session with HTTP 201 and read it back with HTTP 200.

Manual checks still needed: physical iOS/Android layout and microphone behavior, listening through real speakers, and independent linguistic review. Component tests do not replace those device checks. See [docs/verification.md](docs/verification.md) and [docs/cloud-deployment.md](docs/cloud-deployment.md) for details.

Audio assets are listed in `public/audio/manifest.json`. Regenerate them with `node scripts/audio-manifest.js`; install `edge-tts` and `mutagen` for Python and run `python scripts/generate_audio.py`. Generation requires network access; the included MP3 files play without an AI provider or installed voice.

## Public references

- [Official Goethe-Zertifikat A2 information for adults](https://www.goethe.de/ins/de/de/prf/gzsd2.cfm)
- Public model: [Lesen](https://bfu.goethe.de/a2_mod_2MX5/lesen.php), [Hören](https://bfu.goethe.de/a2_mod_2MX5/hoeren.php), [Schreiben](https://bfu.goethe.de/a2_mod_2MX5/schreiben.php), [Sprechen](https://bfu.goethe.de/a2_mod_2MX5/sprechen.php)
