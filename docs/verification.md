# Verification report

## Latest verification — 8 November 2026

| Check | Result |
| --- | --- |
| `npm test` | 66 server/content tests passed |
| `npm run test:ui` | 4 UI tests passed |
| `npm run build` | TypeScript and Vite build passed |
| Vercel Preview | Deployment reached `READY`; page and health endpoint returned HTTP 200 |
| Vercel nested study route | Anonymous request returned 401; authenticated test request reached the study API |
| Vercel session persistence | Test session create returned HTTP 201; readback returned HTTP 200 from Supabase |
| Vercel flashcard route | Authenticated test request returned HTTP 200 |
| Vercel Production | Public page and `/api/health` returned HTTP 200; anonymous cloud-study request returned 401; authenticated study API returned HTTP 200 |
| Supabase real-account tests | Test accounts A/B verified import, persistence, idempotency, and cross-account isolation |
| Git status | Clean after push to `main` |

The live integration checks used dedicated test accounts, not student accounts. No service-role key was used for ordinary reads or writes. Supabase user requests carried verified user access tokens and were subject to RLS.

The curriculum validator reports 10 modules, 80 lessons, and 1,200 structurally valid activities. These activities are generated from 400 base contexts and are not 1,200 independent passages. The practice-bank inventory separately counts complete reading, listening, writing, and speaking materials in `docs/bank-validation.json`.

## Checks and limitations

The UI component tests cover bilingual navigation, the dictionary, lesson autosave/resume, theme, profile safety, writing, and flashcards. JSDOM does not reproduce physical audio output, microphone permissions, or real device dimensions.

Still requiring manual device/editorial review: iOS and Android layout and microphone behavior, listening through physical speakers, and independent linguistic review. The app's feedback is indicative and is not an official Goethe score. These checks are not reported as complete.

Supabase Keep-Alive has not been configured or run in GitHub Actions. It requires a dedicated least-privilege PostgreSQL role and the variables documented in [supabase-keepalive.md](supabase-keepalive.md).

## Earlier baseline

Before cloud integration, on 7 November 2026, the content expansion had 36 automated tests, one JSDOM integration test, and a passing build. Those are historical baseline counts; the latest counts are in the table above.