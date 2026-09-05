/** Native controls own their keys, even when focus is on a child element. */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(
    'button, a[href], input, textarea, select, summary, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="button"]',
  );
}

export function isEditingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
  );
}
