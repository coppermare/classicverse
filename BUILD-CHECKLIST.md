# Classicverse Release Checklist

**Status:** Active

**Purpose:** Verify the implemented product before merging or deploying

## Automated Checks

- [ ] Install succeeds from the lockfile.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] No generated archive or validation script leaves uncommitted accidental output.

## Documentation And Scope

- [ ] README channels and controls match the desktop registry.
- [ ] Car range is consistently described as 1885–1984.
- [ ] F1 team roster, win totals, source and cutoff match the generated data.
- [ ] The expected snapshot contains 899 generated non-Ferrari wins plus 250 curated Ferrari wins.
- [ ] No enabled folder is described as coming soon.
- [ ] No disabled/zero-record folder is described as complete.
- [ ] New shortcuts and cabinet controls appear in README and UI specification.

## Cabinet

- [ ] The screen starts off and the power button is reachable.
- [ ] Power-on reaches the desktop after the boot sequence.
- [ ] Rapid power clicks do not corrupt state.
- [ ] Power-off and power-on retain the current OS path.
- [ ] Volume, mute, brightness and contrast respond to pointer and wheel input.
- [ ] The tuning roller controls the visible list or owning app.
- [ ] Fill view removes the decorative cabinet, base and shadow.
- [ ] The bezel reaches all four viewport edges and has square outer corners.
- [ ] Browser chrome remains visible and compact layouts remain scrollable.
- [ ] Restore returns the framed television.
- [ ] Fill view does not reset media, Snake or archive selection.

## Navigation And Search

- [ ] Desktop items open with click and keyboard Enter.
- [ ] Arrow keys move to visually adjacent folder items.
- [ ] Back, Forward, Up and Home have correct enabled states.
- [ ] Browser Back/Forward and toolbar Back/Forward remain synchronized.
- [ ] Address breadcrumbs navigate to the selected ancestor.
- [ ] A copied `?p=` deep link resolves to the expected destination.
- [ ] An invalid path is replaced with the nearest valid path.
- [ ] `Ctrl/Command + K` opens search with focus in the field.
- [ ] Search finds cars, years, manufacturers, constructors, drivers, circuits and apps.
- [ ] Search Up/Down/Enter/Escape works.

## Car Archive

- [ ] Exactly 100 unique records cover every year from 1885 through 1984.
- [ ] The gallery is chronological.
- [ ] Previous/next controls stop correctly at the first and last record.
- [ ] Detail facts and descriptions remain readable over the image.
- [ ] Sources, confidence, selection basis, alternates and attribution are reachable.
- [ ] Broken or slow remote images do not block navigation.

## Formula One Archive

- [ ] Every enabled constructor folder contains at least one victory.
- [ ] Constructor victories are chronological and numbered from one without gaps.
- [ ] Displayed totals equal generated data lengths.
- [ ] Grand Prix, circuit, driver, chassis and engine render correctly.
- [ ] Previous/next controls stay inside the current constructor.
- [ ] Ferrari records retain correct chassis images and attribution where available.
- [ ] Every non-Ferrari victory has a distinct source-linked Commons photograph tied to the winning race; circuit photography is the fallback. The image index is curated before this item is marked complete.
- [ ] Source and cutoff documentation match the generation script.

## Radio

- [ ] The band snapshot loads.
- [ ] Tuning changes frequency and station identification.
- [ ] Play/pause and mute reflect actual audio state.
- [ ] A failed stream reports failure and permits another station.
- [ ] Keyboard and roller tuning agree.
- [ ] Saved station state recovers safely from invalid local storage.

## Weather

- [ ] Place search returns and selects results.
- [ ] Forecast loading, success and error states are distinct.
- [ ] Unit switching updates displayed values.
- [ ] Saved place and unit recover safely.
- [ ] Location permission denial leaves manual search usable.

## Snake

- [ ] Start, pause, resume and restart work.
- [ ] Arrow keys and WASD work without scrolling the page.
- [ ] Touch swipes steer the snake without scrolling the board.
- [ ] Opposite turns and overfilled turn buffers are rejected.
- [ ] Eating grows the snake, raises the score and speeds the game to its floor.
- [ ] Wall and body collision end the run.
- [ ] Following a tail cell that moves away remains legal.
- [ ] Filling the board reports a win.
- [ ] Best score persists and a tied score is not labelled a new best.
- [ ] Resizing before a run fits a new board; resizing during a run does not move its walls.

## Responsive And Accessible QA

- [ ] Test a narrow phone, tablet and desktop viewport.
- [ ] No cabinet control is clipped or unreachable.
- [ ] Screen toolbar remains legible at the smallest supported width.
- [ ] All interactive elements have accessible names.
- [ ] Keyboard focus is visible.
- [ ] Screen power and archive counts are announced appropriately.
- [ ] Muted operation remains understandable.
- [ ] `prefers-reduced-motion` removes positional/scale motion from boot, power and app transitions.
- [ ] The system pointer remains available outside an active lit screen.

## Release Sign-Off

- [ ] Review the deployed build, not only the development server.
- [ ] Check console errors on initial load and each channel.
- [ ] Verify external weather, radio and remote-image requests under realistic network conditions.
- [ ] Confirm no private keys, local paths or temporary research files are shipped.
- [ ] Record the F1 data cutoff and any known incomplete media coverage in the release notes.
