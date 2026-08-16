# Classicverse Content Strategy

**Goal:** Preserve classic objects and events with clear, original and traceable editorial context

**Audience:** Enthusiasts, design reviewers and curious visitors

**Tone:** Knowledgeable, calm, visual and precise

## 1. Editorial Principle

Classicverse is an archive, not promotional copy. Writing can be evocative, but factual claims, dates and superlatives must remain traceable. The interface may be playful; the history must be careful.

Do:

1. Explain why something mattered in its own moment.
2. Connect engineering, design, competition, culture and adoption where sources support it.
3. Name uncertainty and disagreement.
4. Use plain language and original prose.
5. Keep results data distinct from editorial interpretation.

Do not:

1. Copy source prose.
2. Call every subject revolutionary, legendary or the greatest.
3. Invent technical specifications or historical context.
4. Treat a generated structured dataset as sufficient evidence for a broader significance claim.
5. Hide missing media behind a misleading substitute.

## 2. Car Records

The car archive contains one hero car for each year from 1885 through 1984.

Each record requires:

1. Year, name, manufacturer, country, era and category.
2. Production years and the basis for choosing this timeline year.
3. Why this year and why the car is iconic.
4. At least three verified facts.
5. Historical context.
6. Short and long original descriptions.
7. At least two credible source links.
8. Image URL, licence, creator and attribution page.
9. Alternates where the choice was genuinely contested.
10. Confidence and review status.

### Car source order

1. Manufacturer archives, museums, patents and concours records.
2. Period material, books and established automotive publications.
3. Wikidata/Wikimedia for discovery and rights-cleared media.
4. Enthusiast sources only as corroborating context.

Wikimedia files require review at the file page; the existence of an upload URL does not establish a usable licence by itself.

## 3. Formula One Records

F1 victory records are structured historical results, not original narrative articles. They require a documented source, a cutoff date and a reproducible normalization process.

Each victory requires:

1. Constructor/team identity.
2. Stable chronological win number within that constructor archive.
3. Season year and Grand Prix.
4. Circuit.
5. Driver.
6. Chassis and engine when supplied reliably by the source.
7. Car number when supplied reliably by the source.

Rules:

1. Team aliases and historical constructor identities must be mapped explicitly.
2. Do not merge statistically distinct constructors merely because they share an owner, engine or later brand.
3. Display the dataset cutoff wherever a live/current total might otherwise be implied.
4. Validate chronological order, unique identifiers and team counts after generation.
5. Ferrari's licensed chassis imagery is a separate attribution layer and must not alter result records.

## 4. Live Radio And Weather

Radio station names, descriptions and streams belong to their broadcasters. Classicverse acts as a tuner and does not imply endorsement or ownership. Dead, duplicated or unsafe streams should be removed when rebuilding the band snapshot.

Weather data is live utility content. Copy should state conditions plainly and distinguish a loading state, unavailable forecast and unknown place. Do not persist precise geolocation; only store the chosen place identifier and display preferences locally.

## 5. AI Use

AI may help normalize structured data or draft prose only after the source facts and schema are fixed.

AI cannot:

1. Invent missing results or specifications.
2. Select a hero car without an editorial decision.
3. Replace image-rights review.
4. Turn a low-confidence claim into a confident sentence.
5. silently change a source cutoff or team-alias rule.

Generated work must be reviewable through a script, source field, validation output or stored source notes.

## 6. Voice And Length

### Short car description

Target 35–70 words. State the defining contribution and why the subject belongs in the exhibition.

### Long car description

Target 140–350 words. Begin with the historical moment, explain the relevant design or engineering, connect it to wider use or culture, and end with the reason it still matters.

### Interface copy

Keep labels concise and literal: `Sources`, `Image credit`, `Selection basis`, `Confidence`, `Previous win`, `Fill view`. Retro character comes from the object and visual system, not cryptic control names.

### Good

> The 1959 Mini turned small-car packaging into a cultural event. Its transverse engine and front-wheel-drive layout created surprising interior space, while its compact silhouette became one of the defining shapes of postwar Britain.

### Avoid

> This amazing classic is a must-see icon and one of the best cars ever made.

## 7. Confidence And Review

- **High:** Dates, identity and significance are supported by strong sources.
- **Medium:** The subject is a strong choice, but placement or interpretation remains debatable.
- **Low:** Sources conflict, important research is missing or the choice remains provisional.

Review status records workflow state; confidence records the strength of the conclusion. They are not interchangeable.

## 8. Content Acceptance

Before publishing or regenerating an archive:

1. Required fields are present and correctly typed.
2. Counts and ranges match the documented scope.
3. Sources and cutoff dates are recorded.
4. Images have reachable attribution and licence data.
5. Original prose has been checked against its sources.
6. Generated F1 records use a unique editorial card until a source-linked win-image index has been curated. When photography is available, it must be tied to the winning race; a circuit photograph is the truthful fallback.
7. No placeholder is presented as a completed archive.
