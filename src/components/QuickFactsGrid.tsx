'use client';

interface QuickFactsGridProps {
  facts: string[];
}

export default function QuickFactsGrid({ facts }: QuickFactsGridProps) {
  if (!facts || facts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
        Verified Facts
      </h3>
      <div className="grid gap-3">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border"
            style={{ backgroundColor: '#F5F0E8', borderColor: '#B5913A20' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8B9BAE' }}>
              Fact {String(i + 1).padStart(2, '0')}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
              {fact}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
