# Classicverse Production Plan

**Status:** Implemented and under active expansion

**Product type:** Interactive editorial archive presented as a vintage television

**Primary risks:** Historical accuracy, rights metadata, live-service reliability and client performance

## 1. Current Product

Classicverse now ships as a small browser-based operating system. The TV cabinet owns power, sound, display controls and fill-view behavior. Inside its screen, a registry-driven desktop exposes archive folders and applications with shared navigation, search and keyboard behavior.

The current channels are:

1. F1 constructor victories.
2. One century of iconic cars, 1885–1984.
3. Live internet radio.
4. Live weather.
5. Snake.
6. A visitor-facing changelog of meaningful product milestones.

The project remains a portfolio and editorial product. Commerce, accounts, valuations, inventory and community features remain out of scope.

## 2. Product Principles

1. **The cabinet is functional.** Physical controls must affect the experience consistently.
2. **The registry is the system.** A new channel or folder should join through the common node contract.
3. **Archives are explainable.** Historical data and media need provenance, attribution and a reproducible update path.
4. **Discovery matters.** Search, tuning, Back/Forward and deep links should all lead to the same destinations.
5. **The illusion must not harm usability.** Retro texture cannot remove keyboard access, focus visibility, readable type or reduced-motion support.
6. **Live features fail gracefully.** Radio and weather must retain useful loading, empty and error states.

## 3. Implemented Architecture

- `src/app/page.tsx` — cabinet, power lifecycle, fill-view state, screen rendering and hardware controls.
- `src/os/registry.ts` — the desktop tree and archive-to-node adapters.
- `src/os/types.ts` — folder, app and shared OS contracts.
- `src/os/useOSNav.ts` — query-string navigation synchronized with browser history.
- `src/os/FolderView.tsx` — icon and gallery folder layouts.
- `src/os/SearchPanel.tsx` and `src/os/search.ts` — global registry index and ranking.
- `src/os/apps/*` — channel screens.
- `src/data/*` — curated records, generated snapshots and media mappings.

The page is a client application. Large archive additions should therefore be evaluated for bundle and memory cost, not only source-file size.

## 4. Archive Data Workflows

### Cars

The car exhibition is an exact century: one record per year from 1885 through 1984. Each record includes selection reasoning, original descriptions, verified facts, source links, image rights, confidence, alternates and review status.

Maintenance rules:

1. Keep exactly one unique record for every year in the range.
2. Require at least two credible historical sources.
3. Preserve image creator, licence and attribution URL.
4. Do not replace uncertainty with invented precision.
5. Validate the complete range after every generated or manual edit.

### Formula One

The implemented archive contains 1,149 victories: 250 curated Ferrari records and 899 generated records across 33 other winning constructor identities. Its generated snapshot uses Jolpica F1 through the 2026 Hungarian Grand Prix on 2026-07-26. An Aston Martin folder is retained but disabled because it has no World Championship Grand Prix win at that cutoff.

Constructor victory records must come from a documented results source and be generated or normalized through a repeatable script. Every output records its source and cutoff date. Team aliases must be explicit because constructor names change across eras and datasets. Indianapolis-only chassis winners are excluded because those entries were Indianapolis 500 constructors rather than Formula One teams, even though that race once counted toward the World Drivers' Championship.

Maintenance rules:

1. Preserve chronological ordering and a stable per-team win number.
2. Validate team counts against the source snapshot.
3. Keep Ferrari's chassis-image attribution separate from results data.
4. Curate a distinct contextual image for each victory. The display resolver admits only a rights-cleared photograph whose metadata connects it to the winning team, driver, season or event; circuit-only, cross-team and rights-unverified candidates stay quarantined. Every gap uses unique generated artwork with an explicit non-photographic label.
5. Re-run the generator deliberately; never silently fetch changing results during a production page request.

### Radio

`public/live-band.json` is a generated snapshot of public streams. Generation should filter malformed entries, normalize country/genre labels and deduplicate identical station/stream combinations. Runtime failures are expected: broadcasters can disappear or reject playback.

### Weather

Place search and forecast requests are live. The UI must keep previous useful state while a new request is pending, abort superseded requests and distinguish network failure from an empty result.

## 5. Source And Rights Policy

Preferred historical source order:

1. Governing bodies, constructor/manufacturer archives and museums.
2. Period records, books and established specialist publications.
3. Reputable structured datasets for discovery and generation.
4. Community or enthusiast material only as supporting context.

Wikimedia media is accepted only when the file-level licence, creator and attribution page are stored. Logos are identification marks and remain the property of their owners. Live audio is streamed from the broadcaster and is not republished by Classicverse.

## 6. Development Workflow

1. Install from the lockfile with `npm install` locally or `npm ci` in automation.
2. Work in a focused module without bypassing the shared OS contracts.
3. Add or update deterministic tests for pure rules and data transforms.
4. Run `npm run lint` and `npm test`.
5. Run `npm run build` before merging.
6. Exercise the changed path in a real browser, including keyboard and reduced-motion behavior where applicable.
7. Update documentation whenever a channel, shortcut, data cutoff or scope decision changes.

## 7. Quality Gates

A release is acceptable when:

1. Lint, tests and the production build pass.
2. The TV boots, powers down and enters/exits fill-view mode without losing the current channel.
3. Back, Forward, Up, Home, search and deep links agree about location.
4. All enabled archive folders contain records and no disabled placeholder claims to be complete.
5. F1 and car validation counts pass.
6. Snake accepts keyboard and touch-swipe input, pauses safely and survives responsive resizing.
7. Weather and radio show useful failure states.
8. Content and image attribution remain reachable from detail screens.
9. The primary experience remains usable with reduced motion and keyboard-only input.

See [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md) for the manual release pass.

## 8. Near-Term Roadmap

1. Complete and validate iconic F1 constructor archives.
2. Verify the edge-to-edge fill-view TV mode across desktop and mobile layouts.
3. Expand automated coverage from Snake rules to search, path resolution and archive data invariants.
4. Reduce archive payload cost with channel-level code/data splitting and responsive thumbnails.
5. Surface the existing Guide and Info applications or remove them if they are not part of the product.
6. Add share imagery and richer metadata for deep-linked archive items.

## 9. Intentional Non-Goals

Classicverse does not need accounts, a backend database, live inventory, purchasing, valuations, social features or user submissions to satisfy its purpose. Additions should strengthen the archive, the television metaphor or the reliability of those two things.
