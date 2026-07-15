'use client';

import { useState } from 'react';
import { getWinImage } from '@/data/ferrariChassisImages';
import { FERRARI_WINS } from '@/data/ferrariWins';
import type { FerrariWin } from '@/types/f1';
import type { AppProps } from '../types';
import { RetroButton, TitleBar, Bevel, RADIUS, WELL } from '../ui';
import * as sfx from '../sound';

/** One Grand Prix victory: the car that scored it, and the record behind it. */
export default function WinApp({ node, os }: AppProps) {
  const win = node.data as FerrariWin;
  const [details, setDetails] = useState(false);
  const [broken, setBroken] = useState(false);
  const img = getWinImage(win);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {img?.src && !broken ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={img.src}
          alt={`Ferrari ${win.chassis} — win ${win.number}, ${win.grand_prix} Grand Prix ${win.year}`}
          onError={() => setBroken(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, background: '#1a1612',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#8a8278' }}>Ferrari {win.chassis}</span>
          <span style={{ fontSize: 14, letterSpacing: '0.16em', color: 'var(--cv-brass)', textTransform: 'uppercase' }}>
            {win.grand_prix} · {win.year}
          </span>
        </div>
      )}

      {!details && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4,
          padding: '28px 22px 18px', pointerEvents: 'none',
          display: 'flex', alignItems: 'flex-end', gap: 14,
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minWidth: 68, padding: '8px 14px', borderRadius: 9, flexShrink: 0,
            background: '#c0c0c0', color: '#1a1a1a', lineHeight: 1,
          }}>
            <span style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 600 }}>WIN</span>
            <span style={{ fontSize: 32, fontWeight: 800, marginTop: 3 }}>{win.number}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="cv-tv-car-name">{win.grand_prix} Grand Prix</div>
            <div className="cv-tv-car-meta">{win.year} · {win.driver} · {win.chassis}</div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 6 }}>
        <RetroButton label={details ? 'Close details' : 'Details'} active={details} onClick={() => setDetails((d) => !d)}>
          {details ? 'CLOSE' : 'DETAILS'}
        </RetroButton>
      </div>

      {details && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 7, padding: '40px 12px 12px', display: 'flex' }}>
          <Bevel style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 3 }}>
            <TitleBar
              title={`Win ${win.number} of ${FERRARI_WINS.length} — ${win.grand_prix} ${win.year}`}
              right={
                <RetroButton icon label="Close" silent onClick={() => { sfx.back(); setDetails(false); }} style={{ height: 18, minWidth: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✕</span>
                </RetroButton>
              }
            />
            <div style={{
              flex: 1, minHeight: 0, overflowY: 'auto', background: '#fff',
              borderRadius: `0 0 ${RADIUS}px ${RADIUS}px`, boxShadow: WELL, padding: '14px 16px',
            }}>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', font: '400 13px/1.5 var(--font-sans)' }}>
                {([
                  ['Grand Prix', win.grand_prix], ['Circuit', win.circuit], ['Season', String(win.year)],
                  ['Driver', win.driver], ['Chassis', win.chassis], ['Engine', win.engine],
                  ['Car number', win.car_number], ['Victory', `${win.number} of ${FERRARI_WINS.length}`],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt style={{ fontWeight: 700, color: '#2a4a8a' }}>{k}</dt>
                    <dd style={{ margin: 0 }}>{v}</dd>
                  </div>
                ))}
              </dl>
              {img && (
                <p style={{ marginTop: 14, fontSize: 12, color: '#5a554d', lineHeight: 1.5 }}>
                  {img.note ? <>{img.note}<br /></> : null}
                  Photograph: {img.creator} · {img.license} ·{' '}
                  <a href={img.attribution_url} target="_blank" rel="noreferrer" style={{ color: '#2a4a8a', fontWeight: 600 }}>source</a>
                </p>
              )}
            </div>
          </Bevel>
        </div>
      )}

      {!details && os.siblings.length > 1 && (
        <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 6, display: 'flex', gap: 5 }}>
          <RetroButton icon label="Previous win" disabled={os.index <= 0}
            onClick={() => os.navigate(`../${os.siblings[os.index - 1].id}`)}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>‹</span>
          </RetroButton>
          <RetroButton icon label="Next win" disabled={os.index >= os.siblings.length - 1}
            onClick={() => os.navigate(`../${os.siblings[os.index + 1].id}`)}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>›</span>
          </RetroButton>
        </div>
      )}
    </div>
  );
}
