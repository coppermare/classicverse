# Classicverse Production Plan

**Status**: Planning updated, not ready to build
**Scope**: Classic iconic cars from 1885 to 2000
**Product type**: Interactive timeline archive
**Primary risk**: Data quality and source rights

## 1. Product Summary

Classicverse is a curated classic car history archive. Users navigate from 1885 to 2000 and see one hero car for every year.

The product is built around research quality first. The timeline is only as strong as the source ledger, image rights, and curation decisions behind it.

V1 is a portfolio piece that demonstrates:

1. Product strategy.
2. Structured research.
3. Data modeling.
4. Editorial writing.
5. Interaction design.
6. Responsible source attribution.

## 2. Scope

### In Scope

1. 116 year timeline from 1885 to 2000.
2. One hero car per year.
3. Alternate cars for debated years.
4. Original descriptions.
5. Source panel per car.
6. Confidence labels.
7. Image license and attribution metadata.
8. Search by year, make, model, country, category, and era.
9. Desktop and mobile timeline navigation.

### Out Of Scope

1. Live inventory.
2. Seller pages.
3. Purchase flows.
4. Accounts.
5. Saved searches.
6. Vehicle valuation.
7. Real time data ingestion.
8. User submissions.
9. Community features.

## 3. Research Workflow

Classicverse should be built through a source ledger, not through direct ingestion into the interface.

The workflow:

1. Create the year skeleton from 1885 to 2000.
2. Add candidate cars for each year.
3. Add source links and claim notes.
4. Score each candidate with the curation rubric.
5. Select one hero car per year.
6. Store alternates where useful.
7. Lock verified facts.
8. Write original descriptions from the locked facts.
9. Add image metadata and attribution.
10. Mark review status and confidence level.

## 4. Source Tiers

Use the highest quality source available for each claim.

### Tier 1

1. Manufacturer archives.
2. Museum collections.
3. Concours records.
4. Official heritage pages.

### Tier 2

1. Books.
2. Period materials.
3. Reputable automotive publications.
4. Established classic car magazines.

### Tier 3

1. Wikidata for seed metadata.
2. Wikimedia Commons for image discovery.
3. Wikipedia references as leads, not as final proof.

### Tier 4

1. Enthusiast sites.
2. Forums.
3. Fan maintained model pages.

Tier 4 sources can support context, but they should not be the only evidence for a hero selection.

## 5. Image Rights Contingency

Image sourcing is a blocking dependency for every hero car record. The plan must handle cases where an acceptable image does not exist.

Decision order when sourcing images:

1. Wikimedia Commons with verifiable license, creator, and attribution URL: preferred.
2. Manufacturer or museum provided press images with confirmed reuse rights: acceptable.
3. Period illustration, technical drawing, or patent diagram in the public domain: acceptable fallback for pre-1920 vehicles.
4. No image available: mark record as image-pending with a research flag; do not block content from launching if the rest of the record is complete.

Rules:

1. Never use an image where the license is unclear.
2. Never hotlink to external images that may disappear.
3. Pre-1945 cars will often have only low resolution period photography. Accept this where the image is otherwise correct.
4. Do not use modern auto show or replica photography as a substitute for period images without a clear label.

## 6. Source Ledger

Each claim should be traceable.

Recommended source ledger fields:

1. `year`
2. `candidate_car_name`
3. `claim`
4. `source_url`
5. `source_title`
6. `source_type`
7. `source_tier`
8. `claim_confidence`
9. `image_url`
10. `image_license`
11. `image_creator`
12. `image_attribution_url`
13. `notes`
14. `review_status`

## 7. Car Data Contract

Each hero car record should include:

1. `year`
2. `hero_car_name`
3. `manufacturer`
4. `country`
5. `era`
6. `category`
7. `production_start_year`
8. `production_end_year`
9. `exact_date`
10. `date_precision`
11. `selection_basis`
12. `why_this_year`
13. `why_iconic`
14. `verified_facts`
15. `historical_context`
16. `short_description`
17. `long_description`
18. `source_urls`
19. `image_url`
20. `image_license`
21. `image_creator`
22. `image_attribution_url`
23. `alternate_cars`
24. `confidence_level`
25. `review_status`

## 8. Selection Rules

The hero car for a year should be selected using this priority order:

1. Production start year.
2. Public debut year.
3. Patent or registration year for early vehicles.
4. Major motorsport or cultural breakthrough year only when the model itself did not clearly launch that year.

Candidate cars should be scored from 1 to 5 across the following weighted dimensions:

1. Historical importance (weight: 3).
2. Engineering innovation (weight: 2).
3. Cultural recognition (weight: 2).
4. Design influence (weight: 2).
5. Production impact (weight: 1).
6. Motorsport impact (weight: 1).
7. Collector or museum relevance (weight: 1).

Multiply each score by its weight and sum for a weighted total out of 60. Global representation is a tiebreaker signal only, not a scored dimension. It should not override a clearly stronger candidate.

Tie breaker order when weighted totals are within 3 points:

1. Stronger source quality wins.
2. Broader global or historical reach wins.
3. Better visual documentation wins only after source and significance are equal.

## 9. Content Rules

Descriptions must be original.

AI can support writing only after verified facts are locked. It cannot decide historical significance or invent context.

Every final description should be checked against:

1. Source claims.
2. Dates.
3. Manufacturer names.
4. Model names.
5. Production context.
6. Image attribution.
7. Confidence label.

## 10. Interface Plan

The interface should open directly into the archive, not a marketing landing page.

Opening state:

1. Year selected: 1885.
2. Hero car: Benz Patent Motorwagen.
3. Large hero image.
4. One sentence explaining why it matters.
5. Three quick facts.
6. Year scrubber as position indicator from 1885 to 2000 (snaps to decade; keyboard arrows handle year by year navigation).

Desktop layout:

1. Left: decade rail with era labels.
2. Center: hero image, year, car name, and story.
3. Right: specs, historical context, source panel, and alternates.

Mobile layout:

1. Single column.
2. Hero image first.
3. Sticky compact year selector at the bottom.
4. Tabs for Story, Specs, Context, and Sources.

Era labels used in navigation:

1. Origins: 1885 to 1904.
2. Brass Era: 1905 to 1918.
3. Interwar: 1919 to 1938.
4. WWII: 1939 to 1944.
5. Postwar: 1945 to 1959.
6. Jet Age: 1960 to 1969.
7. Transition: 1970 to 1979.
8. Modern Classic: 1980 to 2000.

## 11. Phased Plan

### Phase 1: Planning Lock

Duration: 1 day.

Output:

1. Final source tiers.
2. Final data contract.
3. Final selection rules.
4. Final QA checklist.

### Phase 2: Source Ledger And Vertical Slice

Duration: 1 to 2 weeks.

Output:

1. Source ledger.
2. 10 complete hero car records.
3. Image attribution for each record.
4. Manual review notes.

Note: each record requires source discovery, image rights review, fact locking, and writing. Budget 1 to 2 hours per car at minimum.

### Phase 3: Design Prototype

Duration: 3 to 5 days.

Output:

1. 1885 hero view.
2. Year scrubber (position indicator with decade snap).
3. Decade and era navigation.
4. Mobile selector.
5. Source panel.
6. Low confidence record state.

### Phase 4: Full Dataset Research

Duration: 6 to 10 weeks.

Output:

1. Candidate cars for every year.
2. Sources for each candidate.
3. Final hero selection for each year.
4. Confidence labels.

Note: 116 years with 2 to 3 candidates each and source validation per candidate is a substantial research commitment. The earlier estimate of 6 to 10 days was not realistic.

### Phase 5: Content Production

Duration: 4 to 8 weeks.

Output:

1. Short description per hero car.
2. Long description per hero car.
3. Why iconic note per hero car.
4. Historical context note per hero car.

Note: writing 116 original descriptions at 140 to 220 words each, each requiring fact review before drafting, takes weeks not days. AI-assisted drafting after facts are locked will compress this, but the review step cannot be skipped.

### Phase 6: Implementation

Duration: future phase.

Output:

1. Timeline interface.
2. Search and filters.
3. Car detail view.
4. Responsive behavior.
5. Accessibility support.

## 12. Quality Gates

No full build should begin until:

1. The 10 car vertical slice is complete.
2. The source ledger format is validated.
3. Image rights workflow is proven.
4. The data contract covers all sample records.
5. The writing style is approved.
6. The timeline navigation is prototyped.

## 13. Minimum Shippable Path

The 116 year scope is the full vision. It should not be a prerequisite for shipping.

A shippable portfolio version can be one complete era, fully researched and built to the same quality standard as V1. The recommended minimum is Origins plus Brass Era: 1885 to 1918, covering 34 years.

This is achievable because:

1. Pre-1920 cars have clear historical consensus and well-documented sources.
2. Manufacturer archives and museum collections are strongest for this period.
3. Wikimedia Commons has good coverage of early automotive photography.
4. The design and interface can be fully demonstrated with 34 records.

After shipping an era, additional eras can be added incrementally. The portfolio case study can document both the shipped version and the full 116 year plan as the vision.

## 14. Success Metrics

Planning success:

1. 10 complete sample records.
2. Zero unsourced hero claims.
3. Every sample image has attribution.
4. Curation choices are explainable.
5. The full 116 year production plan is clear.

Portfolio success:

1. The project is publicly shippable with at least one complete era.
2. The interface feels polished and original.
3. The dataset is credible enough for public viewing.
4. The case study can explain the product decisions and the scope choices.
