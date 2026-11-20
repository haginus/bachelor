# Bachelor frontend

This is my bachelor project, a web platform made specially for the Faculty of Mathematics and Computer Science of the University of Bucharest. It features a way for students to find the coordinating teachers that will help them write the end of study paper. It also allows students and teachers to upload the sign up documents, including the generation of some of these documents. Evaluation committees can then grade the papers and generate the committee catalogs.

This is the frontend app, made with Angular 21.

[Check out the backend app here](https://github.com/haginus/bachelor-backend)

## Development server
Configure the `src/environments` files by including the backend api URL.

Run `npm start` for the Romanian dev server at `http://localhost:4200/`.
Angular's dev server serves one locale at a time. The switcher saves the language choice
locally and shows a notice without navigating; use the production build to test switching.

## Build

Run `npm run build` to build both locales. Romanian is the source and default language,
served from `dist/bachelor/browser/` at `/`. British English is built into
`dist/bachelor/browser/en/` and served at `/en/`. The shared `app-controls` component groups
the theme and language buttons in the drawer, sign-in page and setup toolbar.
The flag button switches languages, preserving the deployment prefix, current Angular route,
query string and fragment. It reloads the selected build and saves the choice in browser
storage.
The supplied Nginx configurations support deep links in both locales.

## Translations

Student and teacher views, their shared components, authentication, FAQs and Material
labels use Angular i18n. Admin-only views remain in Romanian. User-entered content,
backend error messages and generated document contents retain their original language.
Document titles and upload instructions are displayed as returned by the backend.
API requests include `Accept-Language: ro` or `en`, ready for backend i18n support.
Country names use locale-aware display names while retaining Romanian API values.

Mark template text and attributes with `i18n` / `i18n-<attribute>` and use `$localize`
for TypeScript messages. Keep Romanian as the source text. FAQ content lives in
`src/app/shared/components/faq/faq-content.ts` so it is extracted with other messages.

Run `npm run i18n:extract` to refresh `src/locale/messages.xlf`, then update
`src/locale/messages.en-GB.xlf`, preserving interpolation and markup placeholders.
Missing translations fail the build. Run `npm run build` to validate both locales.
