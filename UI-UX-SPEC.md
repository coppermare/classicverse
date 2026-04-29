# Classicverse UI UX Specification

**Product type**: Interactive classic car timeline
**Scope**: 1885 to 2000
**Design goal**: Useful archive first, beautiful portfolio piece second

## 1. Experience Principle

Classicverse should feel like a collector archive brought to life.

The interface should not start with a marketing pitch. Users should immediately land inside the timeline with a selected year, a hero car, and clear ways to move through history.

## 2. Opening Screen

Default state:

1. Selected year: 1885.
2. Hero car: Benz Patent Motorwagen.
3. Large hero image.
4. Car name and manufacturer.
5. One sentence explaining why the car matters.
6. Three quick facts.
7. Year scrubber from 1885 to 2000.
8. Visible source and confidence label.

The first screen should make the product understandable without explanatory onboarding.

## 3. Desktop Layout

Use a three zone archive layout.

### Left Zone

Purpose: time navigation.

Content:

1. Decade rail.
2. Era labels.
3. Current year marker.
4. Keyboard hint shown subtly when focused.

### Center Zone

Purpose: emotional and visual focus.

Content:

1. Hero image.
2. Year.
3. Car name.
4. Manufacturer and country.
5. Short description.
6. Long story section.

### Right Zone

Purpose: context and trust.

Content:

1. Quick facts.
2. Why this year.
3. Why iconic.
4. Selection basis.
5. Confidence label.
6. Source links.
7. Alternate cars.

## 4. Mobile Layout

Use a single column.

Order:

1. Hero image.
2. Year and car name.
3. Quick facts.
4. Story.
5. Tabbed context.
6. Sources.
7. Alternates.

Mobile navigation:

1. Sticky compact year selector at the bottom.
2. Horizontal decade tray.
3. Search opens as a full screen command view.

## 5. Navigation

Primary navigation:

1. Era jumps.
2. Decade jumps.
3. Keyboard arrows for year by year movement.
4. Search command.

The year scrubber (1885 to 2000) serves as a visual position indicator, not a precise interaction surface. At typical desktop widths, 116 years produces roughly 5 pixels per year, making drag-to-year unreliable. The scrubber should snap to the nearest decade when dragged and display the exact year only as a label. Precise year selection happens via keyboard or decade navigation.

Keyboard behavior:

1. Left arrow moves one year back.
2. Right arrow moves one year forward.
3. Shift plus left arrow moves one decade back.
4. Shift plus right arrow moves one decade forward.
5. Escape closes search or panels.

Search should support:

1. Year.
2. Make.
3. Model.
4. Country.
5. Category.
6. Era.

## 6. Era Labels

Use era labels to help people understand the shape of automotive history.

Suggested eras:

1. Origins: 1885 to 1904.
2. Brass Era: 1905 to 1918.
3. Interwar: 1919 to 1938.
4. WWII: 1939 to 1944.
5. Postwar: 1945 to 1959.
6. Jet Age: 1960 to 1969.
7. Transition: 1970 to 1979.
8. Modern Classic: 1980 to 2000.

These labels are navigation aids, not strict historical claims.

Note on the 1970s label: this decade is defined by the fuel crisis, emissions regulation, Japanese import growth, and the end of American muscle. Transition is a more accurate label than Muscle And Motorsport, which better describes the late 1960s.

## 7. Visual System

Palette:

1. Warm white for the page background.
2. Charcoal for primary text.
3. Muted steel for borders and secondary surfaces.
4. Deep racing red for active states.
5. Brass accents for historical details.

Typography:

1. Clean sans for navigation, metadata, and interface labels.
2. Characterful serif for car names and historical notes.
3. Avoid oversized type inside dense panels.
4. Keep labels short and scannable.

Imagery:

1. Images should show the full silhouette where possible.
2. Avoid overly cropped hero images.
3. Preserve attribution visibility.
4. Use a neutral image frame that does not overpower the car.

## 8. Components

Core components:

1. Timeline scrubber.
2. Decade rail.
3. Era jump tray.
4. Hero car panel.
5. Quick facts grid.
6. Historical story section.
7. Source panel.
8. Confidence badge.
9. Alternate cars module.
10. Search command.
11. Mobile year selector.

## 9. Motion

Motion should be quiet and tactile.

Year change:

1. Hero image cross fades.
2. Content slides slightly along the horizontal axis.
3. Facts stagger in under 300 ms.
4. Timeline thumb glides to the new year.

Reduced motion:

1. Disable slide motion.
2. Use simple opacity changes.
3. Keep all content accessible without animation.

## 10. Accessibility

Requirements:

1. Use real buttons for year and decade controls.
2. Provide visible focus states.
3. Label the current year for screen readers.
4. Do not rely on color alone for confidence.
5. Use strong contrast for all text.
6. Provide meaningful alt text for car images.
7. Make keyboard navigation complete.
8. Support reduced motion.

Image alt text should describe the car and visible angle, not only repeat the model name.

Example:

`Three quarter front view of a 1959 Mini in red, showing its compact two box silhouette.`

## 11. Empty And Uncertain States

The final V1 should not have empty years.

During research and prototype work, incomplete years should show:

1. Year.
2. Research status.
3. Candidate cars.
4. Missing source count.
5. Next review action.

Low confidence records should remain visible with a confidence label and notes.

## 12. Design Acceptance Criteria

The interface direction is ready for build when:

1. The 1885 opening screen is designed.
2. Year navigation works in prototype form.
3. Mobile year selection is designed.
4. Source and confidence panels are visible.
5. A low confidence state is designed.
6. The 10 car vertical slice can be displayed without layout changes.
