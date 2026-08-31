# Classicverse UI/UX Specification

**Status:** Implemented interaction model

**Product form:** A working archive OS inside a vintage television

**Design goal:** Make discovery tactile and memorable without sacrificing clarity

## 1. Experience Model

The page presents one physical object: a television set. The screen contains the Classicverse desktop, while the cabinet contains controls that operate it. The interface should feel like tuning and exploring a machine, not browsing a conventional dashboard.

The television metaphor has three layers:

1. **Cabinet** — power, tuning, volume, display controls and fill-view presentation.
2. **System** — toolbar, folders, global search, navigation history and cursor.
3. **Channels** — archives and applications such as Cars, F1, Radio, Weather and Snake.

The desktop also includes a Changelog system application: a scrollable, visitor-facing record of meaningful product milestones derived from repository history.

## 2. Opening And Power

The set begins off. The power button is a real button with an explicit accessible name and pressed state. Turning it on plays the rare, explanatory CRT boot sequence; routine navigation after boot is immediate.

Requirements:

1. The unlit screen explains to assistive technology that the set is off.
2. Power transitions cannot destroy the current OS path or archive selection.
3. Repeated power clicks are ignored while a transition is active.
4. Reduced motion replaces scan, scale and static movement with a short opacity transition.
5. The real pointer remains available while the screen is off; the custom pixel pointer is confined to the lit screen.

## 3. Fill-View TV

Fill view is an explicit cabinet layout action. It does not invoke the browser Fullscreen API or hide browser chrome.

Requirements:

1. A compact icon-only cabinet button exposes stateful `Fill television viewport` and `Restore television frame` accessible names.
2. Remove the decorative outer cabinet, base and shadow while leaving their structural nodes mounted.
3. Promote the inner bezel to a square-cornered surface spanning the full viewport width and height.
4. Keep browser chrome and normal browser mode unchanged.
5. Preserve power, path, current media and application state while changing presentation.
6. Retain every operative cabinet control in the expanded layout.
7. Do not animate the layout change; the immediate response keeps this frequently toggled control crisp and avoids animating layout properties.

## 4. System Navigation

Every location is an OS path serialized in the `?p=` query parameter. The toolbar and browser history operate the same path stack.

Toolbar actions:

1. Back.
2. Forward.
3. Up one level.
4. Home.
5. Clickable address breadcrumbs.
6. Global search.
7. Mute.

Folder behavior:

- Icon folders use pointer hover or arrow keys to select and Enter/click to open.
- Gallery folders use rendered tile positions for vertical keyboard movement rather than assuming a fixed column count.
- The F1 folder roster is limited to the nine selected major constructors; smaller and short-history constructors are not user-visible destinations.

Application behavior:

- The tuning roller moves through the list that owns the current screen.
- Archive detail screens offer previous/next controls.
- Radio and other apps can temporarily claim the roller through the tuner contract.

## 5. Search

Search opens with `Ctrl/Command + K` or the toolbar button and indexes the OS registry rather than maintaining a separate destination list.

Requirements:

1. Results support car names, years, manufacturers, countries, categories, eras, drivers, circuits, constructors and app keywords.
2. The field receives focus on open.
3. Up/Down changes selection, Enter opens and Escape closes.
4. Empty queries show deterministic suggestions and top-level destinations.
5. Empty results explain useful query types.
6. Opening search from the keyboard is immediate and does not wait for decorative animation.

## 6. Archive Views

### Cars

The car folder is a chronological gallery covering 1885–1984. A car detail view uses the image as the visual focus and keeps name, year, manufacturer and country legible on the television. Supporting panels expose facts, selection reasoning, the long story, sources, confidence and attribution.

### Formula One

The F1 root presents constructor folders. Enabled teams open to a chronological victory gallery. Every victory view identifies the team, Grand Prix, year, driver, circuit and its position in that constructor's archive. Ferrari's curated records also show chassis and engine details plus licensed chassis media where mapped. Every record displays either a verified contextual photograph with an honest same-event, same-season or team-era label, or a unique editorial archive artwork card that names the record and is explicitly not a race photograph; circuit-only, cross-team and rights-unverified candidates never appear as fallbacks.

## 7. Physical Controls

### Tuning roller

The roller is a list-control surface. Drag, wheel and keyboard input change discrete options and provide restrained tick feedback. It must not invent a separate navigation state.

### Volume

The volume dial controls all synthesized interface sounds and application audio through one shared level. Mute is reflected both in the toolbar and output graph.

### Brightness and contrast

These knobs adjust the screen presentation without reducing text below a usable contrast threshold. Values remain bounded and support pointer and wheel input.

### Press feedback

Buttons use immediate depressed styling or a subtle `scale(0.97)` response. Hover-only effects are limited to devices with a fine pointer.

## 8. Responsive Layout

Above the compact breakpoint, the screen and control column sit side by side in the cabinet. At smaller widths, the screen becomes a 4:3 region and the physical controls stack below it.

Requirements:

1. The screen remains operable before decorative cabinet details.
2. Toolbar controls do not collide or become unreachable.
3. Galleries respond to available screen width.
4. Snake accepts direct swipe controls on touch devices without adding a persistent directional pad.
5. Fill-view presentation spans the viewport at desktop sizes and remains fully scrollable when compact layouts need more than one viewport of height.
6. Test at a narrow phone viewport, a tablet viewport and a desktop viewport.

## 9. Motion

Motion expresses physical state or prevents a jarring change:

- Boot explains the screen acquiring a signal.
- Power-off explains the screen collapsing.
- Radio identification marks a newly tuned station.
- Small press feedback confirms input.

Routine folder navigation, keyboard commands and fast archive stepping should not accumulate animation delay. UI transitions stay below 300 ms unless they are rare explanatory sequences such as first boot.

## 10. Accessibility

1. All controls use native buttons, inputs or sliders with accessible names.
2. Keyboard behavior covers folders, archives, search and Snake; the fill-view control is a native keyboard-focusable button.
3. Focus remains visible even where pointer selection uses a retro dotted highlight.
4. Status changes such as screen power and item counts have live text.
5. Meaning is never encoded by colour alone.
6. Reduced motion removes position/scale movement while retaining useful fades.
7. Images use meaningful alt text where they convey content; decorative logos and thumbnails may be empty when the adjacent label supplies the name.
8. Sound is optional and muteable.
9. The custom cursor never prevents use of the system pointer outside the lit screen.

## 11. Acceptance Criteria

The experience is ready when:

1. Power, fill-view state and OS navigation remain synchronized through mouse, keyboard and browser Back actions.
2. Every enabled desktop item opens a complete or explicitly bounded experience.
3. Search reaches all enabled archives and apps.
4. Archive galleries remain responsive with hundreds of items.
5. Media failure does not hide textual history or navigation.
6. The set is usable with muted sound, reduced motion and keyboard-only input.
7. Narrow and fill-view layouts retain the television's operative controls.
