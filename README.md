# Classicverse

Classicverse is an interactive archive of classic things presented as a working vintage television. The cabinet is not decorative framing: its power button, tuning roller, volume control, brightness and contrast knobs operate the software shown on the screen.

**Status:** Active portfolio project

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

**Primary experience:** A browsable desktop-style archive inside a tactile TV interface

## What Is In The Set

- **F1 Archive** — 1,013 chronological Grand Prix victories across nine selected major constructor identities: Ferrari, McLaren, Mercedes, Red Bull, Williams, Team Lotus, Renault, Benetton and Brabham. Ferrari retains 250 curated records and licensed chassis imagery; 763 non-Ferrari records are generated from Jolpica F1 through the 2026 Hungarian Grand Prix. The archive displays 298 locally hosted, rights-cleared real photographs; records without a verified contextual photo remain explicitly unavailable. Circuit-only, cross-team and rights-unverified candidates never appear as win photographs.
- **A century of cars** — one curated hero car for every year from 1885 through 1984, with original historical writing, verified facts, sources, selection reasoning, alternates, confidence and image attribution.
- **Radio** — a live FM-style tuner backed by a generated snapshot of public internet radio stations.
- **Weather** — searchable live forecasts with saved place and unit preferences.
- **Snake** — a complete responsive game whose board fits the television screen, with score, best score, one contextual action and swipe input on touch devices.
- **Changelog** — a visitor-facing history of the meaningful ways the archive and television have evolved.

The system also provides global search, URL-addressable navigation, browser-style Back/Forward/Up/Home controls, keyboard navigation, a custom screen cursor and synthesised interface sounds.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development server also prints a LAN URL for testing on another device.

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

`npm test` exercises the pure Snake rules and validates the generated F1 archive deterministically. The release checklist in [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md) covers interactive and content QA that is not yet automated.

The F1 image manifest covers all 1,013 retained victories and records whether each has a real photograph or is unavailable. It preserves rights-cleared Commons race-context photographs as local WebP assets where the record and source metadata agree. Circuit-only, cross-team and rights-unverified candidates stay quarantined in the research indexes. Each displayed image carries a role label, subject metadata, source page, reuse basis and verification status.

Regenerate the non-Ferrari results snapshot deliberately with `npm run generate:f1`; the generated file records its [Jolpica F1](https://github.com/jolpica/jolpica-f1) source and 2026-07-26 cutoff date.

## Controls

- Click the cabinet power button to boot or shut down the set.
- Use the tuning roller to move through the list currently on screen.
- Drag or scroll the volume, brightness and contrast controls.
- Use the toolbar for Back, Forward, Up, Home, Search and Mute.
- Press `Ctrl/Command + K` for search.
- Use arrow keys to move through folders, archives, the radio and Snake according to context.
- Press `Enter` to open the selected item and `Escape` or `Backspace` to move up.
- Use the cabinet's view icon to remove the decorative frame and make the square-cornered bezel fill the viewport; the same icon restores the framed television.

## Architecture

The interface is modeled as a small operating system:

- [src/os/registry.ts](src/os/registry.ts) defines the folder and application tree.
- [src/os/types.ts](src/os/types.ts) defines the generic folder/app contract and the API handed to each app.
- [src/app/page.tsx](src/app/page.tsx) owns the cabinet, power lifecycle, navigation shell and physical controls.
- [src/os/FolderView.tsx](src/os/FolderView.tsx), [src/os/Toolbar.tsx](src/os/Toolbar.tsx) and [src/os/SearchPanel.tsx](src/os/SearchPanel.tsx) provide shared OS behavior.
- [src/os/apps](src/os/apps) contains the individual channels.
- [src/data](src/data) contains curated and generated archive data.

Folders expose children lazily and the shell renders them generically. Registering another channel or archive should not require special-casing the cabinet.

Navigation is stored in the `?p=` URL parameter. That makes archive items deep-linkable while allowing the simulated toolbar and the browser history to remain synchronized.

## Content And Sources

Historical claims and images must remain traceable. Car records store source links, review status, confidence, image licence, creator and attribution URL. F1 results use a documented results source and a reproducible generation path. Live radio belongs to its broadcasters and is streamed rather than stored.

See:

- [CONTENT-STRATEGY.md](CONTENT-STRATEGY.md) for editorial and attribution rules.
- [PRODUCTION-PLAN.md](PRODUCTION-PLAN.md) for the current maintenance and expansion plan.
- [UI-UX-SPEC.md](UI-UX-SPEC.md) for the implemented interaction model and design constraints.
- [PLANNING-SUMMARY.md](PLANNING-SUMMARY.md) for the present product state and intentional scope decisions.

## Intentional Scope

Classicverse is an editorial archive and interaction-design project, not a marketplace. It has no accounts, inventory, valuation, buying flow or user-generated content. Persistent preferences are local to the browser.

The car channel is intentionally an exact century, 1885–1984. Earlier planning documents described a 116-year 1885–2000 timeline; that direction was superseded by the tighter century exhibition now implemented.
