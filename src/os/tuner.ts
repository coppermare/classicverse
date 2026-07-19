/**
 * Lets an app take over the tuning roller.
 *
 * By default the roller steps whatever the current screen is a list of — a
 * folder's contents, or an app's siblings. But an app can be a list of its own
 * thing: the Radio's stations aren't nodes in the tree, so without this the knob
 * on the Radio screen tuned the desktop behind it, which is not what a dial on a
 * radio is for.
 *
 * It's a tiny external store rather than React state so an app can publish from
 * an effect — "update external systems with the latest state from React", which
 * is exactly what effects are for — without the shell owning a piece of state it
 * has no business knowing about, and without a render loop between the two.
 */

export interface TunerOption {
  id: string;
  /** Short face text for the roller, e.g. a frequency. */
  mark: string;
}

export interface TunerSpec {
  options: TunerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
}

let current: TunerSpec | null = null;
const listeners = new Set<() => void>();

/** Publish (or clear, with null) the roller the current app wants. */
export function setTuner(spec: TunerSpec | null) {
  if (current === spec) return;
  current = spec;
  listeners.forEach((l) => l());
}

/** Stable between writes, so useSyncExternalStore won't spin. */
export function getTuner(): TunerSpec | null {
  return current;
}

/** The server has no app mounted, so there is never a tuner to report. */
export function getServerTuner(): TunerSpec | null {
  return null;
}

export function subscribeTuner(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
