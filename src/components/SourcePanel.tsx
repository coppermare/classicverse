'use client';

import type { CarRecord, ReviewStatus } from '@/types/car';
import ConfidenceBadge from './ConfidenceBadge';

interface SourcePanelProps {
  car: CarRecord | undefined;
}

const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: 'Pending review',
  in_review: 'Under review',
  reviewed: 'Reviewed',
  approved: 'Approved',
};

const SELECTION_BASIS_LABEL: Record<string, string> = {
  production_start: 'Production start',
  public_debut: 'Public debut',
  patent_registration: 'Patent registration',
  motorsport_breakthrough: 'Motorsport breakthrough',
  cultural_breakthrough: 'Cultural breakthrough',
};

export default function SourcePanel({ car }: SourcePanelProps) {
  if (!car) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: '#8B9BAE' }}>
          No record for this year.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Confidence & status */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
          Record Status
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          <ConfidenceBadge level={car.confidence_level} />
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#F5F0E8', color: '#6B7280' }}
          >
            {REVIEW_LABEL[car.review_status]}
          </span>
        </div>
      </div>

      {/* Why this year */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
          Why This Year
        </h3>
        <p className="text-sm leading-relaxed italic" style={{ color: '#2C2C2C' }}>
          {car.why_this_year}
        </p>
      </div>

      {/* Why iconic */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
          Why Iconic
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
          {car.why_iconic}
        </p>
      </div>

      {/* Selection basis */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
          Selection Basis
        </h3>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {SELECTION_BASIS_LABEL[car.selection_basis] ?? car.selection_basis}
        </p>
      </div>

      {/* Sources */}
      {car.source_urls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
            Sources
          </h3>
          <ol className="space-y-1.5">
            {car.source_urls.map((src, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="shrink-0 text-xs pt-0.5" style={{ color: '#8B9BAE' }}>
                  {i + 1}.
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 decoration-dotted hover:decoration-solid transition-all"
                  style={{ color: '#B91C1C' }}
                >
                  {src.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Image credit */}
      {(car.image_license || car.image_creator || car.image_attribution_url) && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
            Image Credit
          </h3>
          <div className="text-xs space-y-0.5" style={{ color: '#6B7280' }}>
            {car.image_license && <p>License: {car.image_license}</p>}
            {car.image_creator && <p>Creator: {car.image_creator}</p>}
            {car.image_attribution_url && (
              <a
                href={car.image_attribution_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
                style={{ color: '#B91C1C' }}
              >
                Attribution
              </a>
            )}
          </div>
        </div>
      )}

      {/* Alternate cars */}
      {car.alternate_cars.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
            Considered Alternatives
          </h3>
          <div className="space-y-3">
            {car.alternate_cars.map((alt, i) => (
              <div key={i} className="text-sm space-y-0.5">
                <p className="font-medium" style={{ color: '#2C2C2C' }}>
                  {alt.manufacturer} {alt.name}
                </p>
                <p className="leading-relaxed" style={{ color: '#6B7280' }}>
                  {alt.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
