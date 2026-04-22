# SpaksTrip

## Stack
- Full repo Node floor: `>=20.9.0` (`client` uses Next `16.2.4`).
- `client/`: Next `16.2.4`, React `19.2.4`, React DOM `19.2.4`, TypeScript `5.9.3`, Tailwind CSS `4.2.3`, PostCSS via `@tailwindcss/postcss`, ESLint `9.39.4`, React Compiler enabled.
- `server/`: scaffold only; manifest deps are Express `5.2.1`, Axios `1.15.1`, bcrypt `6.0.0`, cookie-parser `1.4.7`, jsonwebtoken `9.0.3`, nodemon `3.1.14`.

## Structure
- `client/src/app/*`: App Router layout, page, global styles.
- `client/public/*`: static assets.
- `client/{package.json,tsconfig.json,eslint.config.mjs,next.config.ts,postcss.config.mjs}`: client toolchain config.
- `client/CLAUDE.md` -> `client/AGENTS.md`: nested instructions for any `client/` work.
- `server/package.json`: backend manifest; no server source files yet.
- `client/package-lock.json`, `server/package-lock.json`: touch only for dependency changes.

## Conventions
- Use TypeScript/TSX, double quotes, semicolons, ESM `export default`.
- Prefer simple default-export App Router components; import types with `import type`.
- Keep strict typing intact; `@/*` alias is available for `client/src/*`.
- Use Tailwind utility classes inline; keep shared tokens in `client/src/app/globals.css` via CSS variables and `@theme inline`.
- Keep React Compiler / Next config compatible; avoid patterns that fight compile-time optimization.

## Do Not Modify Unless Asked
- `client/CLAUDE.md`, `client/AGENTS.md`
- `client/package-lock.json`, `server/package-lock.json`
- `client/{tsconfig.json,eslint.config.mjs,next.config.ts,postcss.config.mjs}` unless the task is config/tooling-related

## Prefer
- Read only the target files plus the nearest relevant config.
- In `client/`, read `client/CLAUDE.md` and `client/AGENTS.md` once, then work from file-local context.
- Keep diffs minimal; preserve existing App Router, Tailwind, and strict-TS patterns.
- End each edit batch with a 3-line delta: `Added`, `Changed`, `Verification/Gap`.

## Avoid
- Reading `package-lock.json` or `node_modules` unless version/debug data is required.
- Running installs unless manifests changed or a missing dependency blocks work.
- Inventing backend routes/files/scripts without an explicit request; `server/` is currently only a dependency scaffold.
- Editing default assets/config just for cleanup or style preference.
## Do Not
- Read entire directories unless asked
- Install packages without confirming
- Modify client/CLAUDE.md or server/package.json unless dependency change