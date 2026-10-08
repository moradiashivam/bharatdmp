# Languages and translations

## For Super Admins
1. **Master Data > Languages** - add a language (name, two-letter ISO 639-1 code such as `gu`, status, default).
   The default language cannot be deleted or made inactive. A language that already has translations
   or answers cannot be deleted - set it to Inactive instead.
2. **Translations** (sidebar) - pick a language and a module (interface text, DMP sections, questions and
   help text, answer options), filter Missing / Translated, search, type translations and click Save.
   Leave a box empty to use the default text. Export CSV/JSON, fill the `translation` column and import it back.
3. Everyone can switch language from the selector in the top bar. The choice is saved for the session and the user.

## Fallback rule
Selected language -> default language -> built-in English text -> readable key. A blank or raw key is never shown.
Code: `src/services/i18n.service.js` (`resolveText`, `makeT`, `translateEntity`, `localizeForm`). Tests: `npm test`.

## For funders: multilingual answers
Project settings > **Multilingual answers**: switch on, choose extra languages, optionally require them.
Researchers then see language tabs on short text, long text and rich text questions. The default-language
answer is always required. All languages appear in the preview and the PDF.
Existing answers are the default-language answers (stored as before) - nothing is migrated or lost.

## Developers: adding a translatable text
- **Static text:** add `'area.my_key': 'English text'` to `src/i18n/en.js`, then use `<%= t('area.my_key') %>`
  (variables: `t('researcher.welcome', { name })` with `{name}` in the text). It appears in the Translation Manager automatically.
- **Database content:** add the column name to `ENTITY_FIELDS` in `i18n.service.js` (or a new entity type plus a
  query in `sourceRows()` of `translation.controller.js`), then display it via `translateEntity()` or `localizeForm()`.
Translations are cached in memory and cleared on every save.
