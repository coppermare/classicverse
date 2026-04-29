# Classicverse

**Category**: Experiment and portfolio project
**Status**: Planning updated, not ready to build
**Scope**: Classic iconic cars from 1885 to 2000
**Primary outcome**: Interactive timeline archive
**Current folder**: `Projects/experiments/classicverse`

## Vision

Classicverse is an interactive archive of classic iconic cars, designed as a polished portfolio piece that shows product thinking, research discipline, editorial judgment, and visual interface craft.

The product lets users move through automotive history year by year. Each year from 1885 to 2000 has one hero car, a clear reason for why it represents that year, original historical writing, source links, image attribution, and a confidence level.

## Product Definition

Classicverse is not a commerce product. It does not include buying flows, valuation, ownership transfer, or live inventory.

Classicverse is a curated history product with three priorities:

1. Tell the story of classic cars through time.
2. Build a credible dataset with transparent sources.
3. Present the archive through an elegant timeline interface.

## V1 Scope

V1 guarantees:

1. One hero car for every year from 1885 to 2000.
2. A complete 116 year timeline.
3. At least two credible sources per hero car.
4. Image metadata with license and attribution.
5. Original descriptions written from verified facts.
6. Confidence labels for uncertain or debated selections.
7. Alternates for years where multiple cars are strong candidates.

V1 excludes:

1. Live inventory.
2. Seller pages.
3. Accounts.
4. Saved searches.
5. Vehicle valuation.
6. Purchase flows.
7. Real time data ingestion.

## Planning Documents

Read these before any implementation:

1. [PRODUCTION-PLAN.md](PRODUCTION-PLAN.md): Research workflow, source ledger, data contract, curation rules, and phased build plan.
2. [UI-UX-SPEC.md](UI-UX-SPEC.md): Timeline archive interface, navigation, visual system, motion, mobile behavior, and accessibility.
3. [CONTENT-STRATEGY.md](CONTENT-STRATEGY.md): Historical writing rules, source policy, tone, confidence labels, and description templates.
4. [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md): Planning and research checklist before build work starts.
5. [PLANNING-SUMMARY.md](PLANNING-SUMMARY.md): Current project summary and planning decisions.

## Source Policy

Classicverse uses open and properly attributed sources first.

Preferred source tiers:

1. Manufacturer archives, museum collections, and concours records.
2. Books, period materials, and reputable automotive publications.
3. Wikidata and Wikimedia Commons for seed data and image discovery.
4. Enthusiast sites only as supporting context.

Rules:

1. Each hero car needs at least two credible source links.
2. Wikimedia Commons images are allowed only when license and attribution metadata can be stored.
3. NHTSA vPIC is useful only from 1981 onward.
4. AI may help draft descriptions only after verified facts are locked.
5. Descriptions must be original and must not copy source prose.

## Research First Workflow

The first implementation must begin with a 10 car vertical slice before the full 116 year dataset.

The vertical slice proves:

1. Source quality.
2. Image rights workflow.
3. Data contract.
4. Selection rubric.
5. Writing tone.
6. Timeline interface direction.
7. Manual QA process.

Recommended sample spread:

1. 1885 Benz Patent Motorwagen.
2. 1908 Ford Model T.
3. 1922 Austin Seven.
4. 1934 Citroen Traction Avant.
5. 1938 Volkswagen Beetle.
6. 1948 Land Rover Series I.
7. 1959 Mini.
8. 1964 Ford Mustang.
9. 1974 Volkswagen Golf.
10. 1992 McLaren F1.

## Success Criteria

Planning is ready for implementation when:

1. The 10 car vertical slice is fully sourced and reviewed.
2. The source ledger format is validated.
3. The data contract supports all required fields.
4. The interface prototype supports year navigation.
5. The content workflow prevents unsourced claims.
6. The full 1885 to 2000 dataset can be produced without changing the core model.

## Current Next Step

Do not build yet.

The next step is to create the 10 car vertical slice and source ledger, then review the research quality before committing to the full dataset.
