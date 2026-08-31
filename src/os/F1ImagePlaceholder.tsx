type Props = {
  thumbnail?: boolean;
};

/** A deliberately quiet loading state for verified F1 photography. */
export default function F1ImagePlaceholder({ thumbnail = false }: Props) {
  return (
    <span className={thumbnail ? 'cv-f1-thumbnail-skeleton' : 'cv-f1-image-skeleton'} aria-hidden="true">
      <svg className="cv-f1-image-placeholder-icon" viewBox="0 0 24 24" focusable="false">
        <rect x="3" y="4" width="18" height="16" rx="1.5" />
        <circle cx="9" cy="9" r="1.75" />
        <path d="M5.5 18l4.6-5 3.2 3 2.1-2.3 3.2 4.3" />
      </svg>
    </span>
  );
}
