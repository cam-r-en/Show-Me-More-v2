# React + Vite

## GitHub Pages

The site deploys to GitHub Pages when changes are pushed to `main` using
`.github/workflows/deploy.yml`. In the repository settings, select **Settings >
Pages > Build and deployment > GitHub Actions** as the Pages source.

Add repository Actions variables named `VITE_LASTFM_API_KEY` and
`VITE_RAWG_API_KEY` so Last.fm and RAWG features are configured in the Pages
build. These browser API keys are visible to site visitors; do not use this
mechanism for confidential credentials.

GitHub Pages serves static files and cannot protect the Spotify client secret.
The Spotify client-credentials flow currently used by the app needs a secure
backend token endpoint, or a browser-based Spotify Authorization Code with
PKCE flow, before Spotify API features can be safely enabled on the public
deployment. Do not add the Spotify client secret as a `VITE_` variable.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
