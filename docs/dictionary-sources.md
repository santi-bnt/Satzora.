# Dictionary sources and saved external words

The dictionary resolves entries in this order:

1. The reviewed local German A2 catalog.
2. German entries in Spanish Wiktionary through WiktAPI.
3. The Spanish translation table attached to a matching German Wiktionary sense, plus German entry forms.
4. English Wiktionary definitions, shown only as English when no Spanish gloss is available.

WiktAPI provides a structured API and is open-source under MIT; its data is derived from Wiktionary. The Wiktionary text reused here is attributed to the language-edition entry and treated as CC BY-SA 4.0. The modal links to both the source entry and the license. Source examples are retained only in German unless a Spanish example translation is separately verified. See [WiktAPI](https://wiktapi.dev/), [WiktAPI source and license](https://github.com/TheAlexLichter/wiktapi.dev), [Wiktionary copyright](https://en.wiktionary.org/wiki/Wiktionary:Copyrights), and [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Spanish translations fetched from a German entry are accepted only when the source is German, the source lemma matches the requested lemma, and the translation's attached sense matches a German gloss in that entry. Article and plural are included only when the German entry explicitly labels those forms. The fallback cache is separated by UI language. English-only results never fill the Spanish field.

## Saving a Wiktionary entry to a flashcard

Guest/local saves are stored in SQLite in an additive table and retain the source entry, sentence, and attribution. Authenticated cloud saves use the additive migration `supabase/migrations/202611090001_dictionary_cards.sql`. This migration creates a private table with owner-only RLS; it does not alter the initial schema or existing saved words. It has **not** been applied to Supabase automatically. Until it is applied, existing cloud cards continue to work, but saving a new external dictionary entry to an authenticated account returns a clear migration-required message. Local guest saves work without that migration.

Apply the migration through the project's reviewed Supabase migration process after confirming the target project. Do not run `db reset` or reapply initial migrations.
