# Adrián Vega — portfolio

Public URL: https://www.adrianvega.art/

The homepage is a single continuous portfolio with Spanish as its default language.
The language selector also supports English, Catalan, French and Dutch; `?lang=en`
(or `es`, `ca`, `fr`, `nl`) provides a direct language link.

- `index.html`: introduction, language selector and contact.
- `portfolio-content.js`: translated works, education, supports and biography.
- `portfolio.js`: sections, language selection and video players loaded on click.
- `portfolio.css`: responsive layout and existing cream/black/lime palette.

Serve the repository with a static HTTP server for preview. Pushes to `main`
publish through the existing GitHub Pages workflow, including all dossier subpages.
The earlier `sampling-*` files are retained as source history and are no longer
loaded by the homepage.
