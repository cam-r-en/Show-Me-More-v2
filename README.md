# Show Me More
A little more than what you're actually looking for

# Camren Henderson
Solo Designer, Prototyper, and API Handler (UI/UX Lead)

# Timeline
The idea of this project spawned from a college course that taught the fundamentals of web development, including HTML, CSS, JS, and React (with a little bit of backend programming included as well). I moved away from this project after completing the course, but decided to come back to it in between finishing college and focused more on it after graduating in September 2026. 

## Design & Prototyping
### Figma
- The original and updated UI design of the webpage was based on the wireframe.
- The Figma project was originally an assignment apart of the class, but I went back to update the project for a more improved look.
- Project Link: (https://www.figma.com/design/jxqz0bvuwVWRqm5qqjYqam/Show-Me-More?node-id=1-2564&t=puBXnuNzmy0ahBg2-1)
### React.js
- Home page begins with introductory video and a preview of content that can be found throughout the site
- Uses JavaScript form component to create the Form page, which allows users to search for more specific types of content
- All API result content grabbed with respective JavaScript components 
- All result cards provide more descriptive details about the item they click
    - Initial card display includes item picture and name
    - Extra details include genres, tags, overview, duration, release date, etc.
    - All details grabbed by respective APIs
- Currently only includes games and music
    - Music components are properly implemented, but games still need to be worked on
    - Due to API restrictions certain content cannot be displayed properly 
### APIs
_1. Last.fm_
  - The foundation for all music content discovered on the site
  - Grabs all appropriate details including:
      - Names/Titles
      - Genres
      - Album Durations
      - Overviews
      - etc.

_2. Spotify & Deezer_
  - Fallback for grabbing artists' images (since Last.fm restricted that feature)

_3. RAWG_
  - The foundation for all gaming content discovered on the site
  - Grabs all appropriate details including:
      - Names/Titles
      - Genres
      - Release Years
      - Overviews
      - etc.
### Media
- All custom media created by me, including:
    - Introductory Video
    - Placeholder Images
    - Text Scrollers
    - etc.

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
