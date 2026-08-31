# Classicverse Product Summary

**Updated:** 2026-08-16

**Status:** Working portfolio product under active development

**Form:** A registry-driven archive OS inside an operable vintage television

## What Classicverse Is

Classicverse is a collection of historical archives and live applications presented as channels on a television. Visitors turn on the set, browse its desktop, tune lists with a physical roller, search the entire registry and open detailed records without leaving the product metaphor.

It currently combines:

1. A Formula One archive with 1,149 constructor victories across 34 winning team identities, current through 2026-07-26.
2. An exact century of iconic cars, 1885–1984.
3. Live internet radio.
4. Live weather.
5. A complete Snake game.
6. A visitor-facing changelog distilled from the project history.

## What Changed From The Original Plan

The repository's original planning described an unbuilt 1885–2000 car timeline with a conventional scrubber and three-column editorial layout. The implemented product took a different, stronger direction:

1. The scope expanded from a single car timeline to a universe of classic subjects and utilities.
2. The primary interface became a functioning physical TV and desktop-style OS.
3. The car exhibition became an exact 100-year run from 1885 through 1984.
4. The archive opens as a chronological gallery rather than decade folders and a global scrubber.
5. F1 constructor victories became a second major historical archive.
6. Radio, Weather and Snake demonstrate that the system can host applications as well as static records.
7. Search, browser history, deep links, sound, a custom cursor and hardware-style controls became shared platform capabilities.

The old 116-year promise, "do not build" status and pre-implementation gates are superseded. They have been removed from the active documentation.

## Current Product Decisions

1. **Exact-century cars:** 1885–1984 is intentional and should be presented consistently.
2. **Constructor-specific F1 records:** A win belongs to the statistically recognized constructor identity represented by its team folder; aliases require documented mappings.
3. **No hidden ownership claims:** Historical sources, Wikimedia media, logos and radio streams retain attribution or ownership context.
4. **No account system:** Preferences such as station, weather place, units and Snake best score stay in local storage.
5. **URL location is authoritative:** `?p=` makes destinations deep-linkable and keeps toolbar/browser history aligned.
6. **Fill view changes presentation, not application state:** Expanding or restoring the cabinet must not remount the TV or reset a channel.
7. **The TV metaphor serves usability:** Physical delight is welcome; inaccessible controls, misleading fallbacks or slow routine actions are not.

## Current Strengths

- A distinctive, coherent visual identity.
- A generic registry and folder/app contract that supports new channels.
- Rich car records with sources and rights metadata.
- Large archive navigation with memoized gallery tiles and keyboard support.
- Live radio and weather states that tolerate changing external services.
- A pure, deterministic Snake rulebook separated from rendering.
- Shareable OS paths and global search.

## Active Risks

1. F1 result cutoffs and team aliases can drift unless regenerated and validated deliberately.
2. Remote car images and public radio streams can disappear.
3. Large archive data currently contributes to client payload size.
4. The manual visual QA surface is broader than the automated test suite.
5. Some older application files may be implemented but unreachable; each should be registered intentionally or removed.

## Immediate Priorities

1. Maintain the iconic F1 constructor snapshot and its documented source/2026-07-26 cutoff, while replacing quarantined circuit-only and cross-team image candidates with exact-win photography.
2. Verify edge-to-edge fill-view behavior across desktop and narrow layouts.
3. Stabilize Snake across resize, focus, timing and persistence edge cases.
4. Add archive-data validation and browser smoke coverage.
5. Split heavy channel data and generate smaller gallery thumbnails.
6. Keep the active documentation synchronized with the registry and generated counts.

## Definition Of Done

Classicverse is release-ready when lint, tests and the production build pass; every enabled folder contains a coherent experience; data counts and cutoffs validate; fill-view mode and OS navigation preserve state; live applications fail gracefully; and the television remains operable with keyboard, reduced motion and narrow viewports.
