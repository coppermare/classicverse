'use client';

import { useState } from 'react';
import { getBrandLogo } from '@/data/brandLogos';
import { toThumb } from '@/lib/wikimedia';
import type { CarRecord } from '@/types/car';
import type { AppProps } from '../types';
import { RetroButton, TitleBar, Bevel, INK, RADIUS, WELL } from '../ui';
import * as sfx from '../sound';

/**
 * One car, full-bleed, with the research behind it a button away.
 *
 * The dataset carries a lot per car — why this year, why it matters, verified
 * facts, historical context, sources, the cars it beat — and none of it was
 * reachable from the UI. The picture stays the hero; DETAILS opens the file.
 */
export default function CarApp({ node, os }: AppProps) {
  const car = node.data as CarRecord;
  const [details, setDetails] = useState(false);
  const [broken, setBroken] = useState(false);
  const logo = getBrandLogo(car.manufacturer);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {car.image_url && !broken ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={toThumb(car.image_url)}
          alt={`${car.hero_car_name} by ${car.manufacturer}`}
          onError={() => setBroken(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, background: '#1a1612',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#8a8278', textAlign: 'center', padding: '0 24px' }}>
            {car.hero_car_name}
          </span>
          <span style={{ fontSize: 14, letterSpacing: '0.16em', color: 'var(--cv-brass)', textTransform: 'uppercase' }}>
            {car.era}
          </span>
        </div>
      )}

      {/* Lower third */}
      {!details && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4,
          /* cqw against the screen — see .cv-tv-screen. */
          padding: 'clamp(16px, 3cqw, 28px) clamp(13px, 2.4cqw, 22px) clamp(11px, 2cqw, 18px)',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'flex-end', gap: 'clamp(8px, 1.4cqw, 13px)',
        }}>
          {logo && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              /* Fixed box, so the badge holds still from car to car however wide
                 or tall the marque's logo is. Height comes from the two lines of
                 type beside it (name × line-height + gap + meta × line-height). */
              width: 'clamp(56px, 9.8cqw, 88px)',
              height: 'calc(clamp(17px, 3.3cqw, 30px) * 1.15 + clamp(3px, 0.6cqw, 6px) + clamp(12px, 2.3cqw, 20px) * 1.35)',
              padding: 'clamp(3px, 0.5cqw, 5px) clamp(5px, 0.8cqw, 8px)', flexShrink: 0,
              background: 'rgba(248,246,241,0.96)', borderRadius: 7,
              boxShadow: '0 1px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}>
              {/* contain inside the fixed box — tall logos and wide ones both
                  fit without changing the badge around them. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="cv-tv-car-name">{car.hero_car_name}</div>
            <div className="cv-tv-car-meta">{car.manufacturer} - {car.year} - {car.country}</div>
          </div>
        </div>
      )}

      {/* Details toggle — below the toolbar, which spans the top of the tube. */}
      <div style={{ position: 'absolute', top: 46, right: 14, zIndex: 6 }}>
        <RetroButton
          icon
          label={details ? 'Close details' : 'Details'}
          active={details}
          onClick={() => setDetails((d) => !d)}
        >
          {/* An "i" in a ring - the same mark the Info channel wears, so
              "more about this" looks the same wherever it appears. */}
          <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="5.9" fill="none" stroke={INK} strokeWidth="1.3" />
            <rect x="6.25" y="5.8" width="1.5" height="4.4" rx="0.4" fill={INK} />
            <rect x="6.25" y="3.4" width="1.5" height="1.6" rx="0.4" fill={INK} />
          </svg>
        </RetroButton>
      </div>

      {details && <CarFile car={car} onClose={() => setDetails(false)} />}

      {/* Prev / next through the decade */}
      {!details && os.siblings.length > 1 && (
        <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 6, display: 'flex', gap: 5 }}>
          <RetroButton icon label="Previous car" disabled={os.index <= 0}
            onClick={() => os.navigate(`../${os.siblings[os.index - 1].id}`)}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>‹</span>
          </RetroButton>
          <RetroButton icon label="Next car" disabled={os.index >= os.siblings.length - 1}
            onClick={() => os.navigate(`../${os.siblings[os.index + 1].id}`)}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>›</span>
          </RetroButton>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 14 }}>
      {/* Ink, not blue — blue is reserved for links in this file. */}
      <h3 style={{ font: '700 13px/1 var(--font-sans)', color: '#1c1a17', marginBottom: 5 }}>{title}</h3>
      <div style={{ font: '400 13px/1.55 var(--font-sans)', color: '#1c1a17' }}>{children}</div>
    </section>
  );
}

/**
 * Some model names already carry the marque ("Ferrari 250 GTO"), others don't
 * ("Patent-Motorwagen"). Prefixing unconditionally produced "Ferrari Ferrari
 * 250 GTO".
 */
function fullName(car: CarRecord): string {
  const name = car.hero_car_name;
  const maker = car.manufacturer;
  return name.toLowerCase().startsWith(maker.toLowerCase().split(' ')[0])
    ? name
    : `${maker} ${name}`;
}

function CarFile({ car, onClose }: { car: CarRecord; onClose: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 7, padding: '40px 12px 12px', display: 'flex' }}>
      <Bevel style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 3 }}>
        <TitleBar
          title={`${car.year} - ${fullName(car)}`}
          right={
            <RetroButton icon label="Close" silent onClick={() => { sfx.back(); onClose(); }} style={{ height: 18, minWidth: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✕</span>
            </RetroButton>
          }
        />
        <div style={{
          flex: 1, minHeight: 0, overflowY: 'auto', background: '#fff',
          borderRadius: `0 0 ${RADIUS}px ${RADIUS}px`, boxShadow: WELL, padding: '14px 16px',
        }}>
          <Section title="Overview">{car.short_description}</Section>
          <Section title={`Why ${car.year}?`}>{car.why_this_year}</Section>
          <Section title="Why it matters">{car.why_iconic}</Section>

          {car.verified_facts?.length > 0 && (
            <Section title="Verified facts">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {car.verified_facts.map((f, i) => <li key={i} style={{ marginBottom: 5 }}>{f}</li>)}
              </ul>
            </Section>
          )}

          <Section title="Historical context">{car.historical_context}</Section>

          {car.alternate_cars?.length > 0 && (
            <Section title="Also considered">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {car.alternate_cars.map((a, i) => (
                  <li key={i} style={{ marginBottom: 5 }}>
                    <strong>{a.manufacturer} {a.name}</strong> - {a.reason}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Sources">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {car.source_urls?.map((s, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ color: '#2a4a8a', fontWeight: 600 }}>{s.title}</a>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 8, fontSize: 12, color: '#5a554d' }}>
              Photograph: {car.image_creator} - {car.image_license} -{' '}
              <a href={car.image_attribution_url} target="_blank" rel="noreferrer" style={{ color: '#2a4a8a', fontWeight: 600 }}>
                Source
              </a>
            </p>
          </Section>
        </div>
      </Bevel>
    </div>
  );
}
