# Classicverse Planning Summary

**Date**: 2026-04-29
**Status**: Planning revised, not ready to build
**Project type**: Experiment and portfolio piece
**Scope**: Classic iconic cars from 1885 to 2000

## What Changed

The existing marketplace planning has been replaced with Classicverse planning, then revised after a critical review.

Classicverse is now defined as an interactive classic car timeline archive. It is not a marketplace and should not be planned as one.

Changes made in the revision:

1. Era labels corrected: Postwar now starts at 1945 (not 1939). WWII (1939 to 1944) is a separate era. "Muscle And Motorsport" replaced with "Transition" for the 1970s, which more accurately reflects the fuel crisis, emissions regulations, and rise of Japanese imports that defined the decade.
2. Scrubber redesigned as a position indicator that snaps to decades. Era and decade jumps are now the primary navigation controls.
3. Selection rubric now uses weighted scoring (historical importance x3, engineering innovation x2, cultural recognition x2, design influence x2, production impact x1, motorsport impact x1, museum relevance x1). Global representation is a tiebreaker signal only, not a scored dimension.
4. Image rights contingency added: clear fallback order when an acceptable image does not exist for a record.
5. Phase timeline estimates corrected to realistic ranges. The vertical slice is 1 to 2 weeks, full dataset research is 6 to 10 weeks, content production is 4 to 8 weeks.
6. McLaren F1 year in the vertical slice corrected to 1994 (first production delivery), flagged as medium confidence.
7. Geographic diversity gap in the vertical slice sample noted: 8 of 10 cars are European.
8. Minimum shippable path added: one complete era (recommended Origins plus Brass Era, 1885 to 1918, 34 years) can be shipped before the full 116 year dataset is complete.

## What Classicverse Is

Classicverse is a curated archive of classic iconic cars. Users move through the years from 1885 to 2000 and discover one hero car for every year.

Each hero car should include:

1. A clear selection reason.
2. Verified facts.
3. Original writing.
4. Source links.
5. Image attribution.
6. Confidence label.
7. Alternate cars where useful.

## Product Positioning

Classicverse is a portfolio piece first.

It should demonstrate:

1. Product thinking.
2. Historical research.
3. Data modeling.
4. Editorial judgment.
5. Visual design.
6. Interaction design.
7. Responsible use of sources.

## Key Decisions

1. The working name is Classicverse.
2. The full scope is 1885 to 2000 inclusive.
3. V1 guarantees one hero car per year.
4. The first implementation should begin with a 10 car vertical slice.
5. Open and properly attributed sources are the default.
6. AI can help draft content only after verified facts are locked.
7. The folder path remains unchanged for now.
8. No code implementation is part of this planning update.
9. The selection rubric uses weighted scoring; global representation is a tiebreaker only.
10. The minimum shippable version is one complete era, not the full 116 years.
11. The year scrubber is a position indicator; era and decade jumps are primary navigation.
12. The 1970s era label is Transition, not Muscle And Motorsport.

## Source Strategy

Preferred source tiers:

1. Manufacturer archives, museum collections, and concours records.
2. Books, period materials, and reputable automotive publications.
3. Wikidata and Wikimedia Commons for seed data and image discovery.
4. Enthusiast sites only as supporting context.

Important rules:

1. Every hero car needs at least two credible source links.
2. Every image needs license and attribution metadata.
3. Wikimedia Commons images require file level review.
4. NHTSA vPIC is useful only from 1981 onward.
5. Wikipedia can help discover references, but it should not be the hidden primary source.

## Interface Direction

Classicverse should open directly into the archive.

Opening screen:

1. 1885 selected.
2. Benz Patent Motorwagen shown as the hero car.
3. Large image.
4. One sentence of significance.
5. Three quick facts.
6. Year scrubber from 1885 to 2000.
7. Source and confidence visible.

Desktop layout:

1. Left decade rail.
2. Center hero car story.
3. Right context and sources.

Mobile layout:

1. Single column.
2. Hero image first.
3. Sticky year selector.
4. Tabs for story, specs, context, and sources.

## Planning Deliverables

Updated documents:

1. [README.md](README.md): Project overview and scope.
2. [PRODUCTION-PLAN.md](PRODUCTION-PLAN.md): Research workflow, data contract, source ledger, and phased plan.
3. [UI-UX-SPEC.md](UI-UX-SPEC.md): Timeline interface and design direction.
4. [CONTENT-STRATEGY.md](CONTENT-STRATEGY.md): Writing rules, source policy, and content templates.
5. [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md): Planning only checklist.
6. [PLANNING-SUMMARY.md](PLANNING-SUMMARY.md): Current summary.

## Next Step

Do not build yet.

The next step is to create the 10 car vertical slice and source ledger. That work should prove the research workflow before expanding to the complete 116 year dataset.

## Build Readiness Criteria

The project is ready to build only when:

1. The 10 car vertical slice is complete.
2. Every sample record has at least two credible sources.
3. Every sample image has license and attribution metadata.
4. The data contract has been validated.
5. The selection rubric has been tested.
6. The writing style has been reviewed.
7. The interface direction can display all sample records.

## Known Constraints

1. This update does not rename the folder.
2. This update does not create code.
3. This update does not install dependencies.
4. This update does not update Linear.
5. This update does not touch unrelated files.
