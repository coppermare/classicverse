'use client';

import type { AppProps } from '../types';

/**
 * The colophon: what the place is, in one paragraph.
 *
 * It used to run to six headed sections, then two paragraphs, and both versions
 * spent their length on inventory - how many cars, how many wins, what the radio
 * does. The set already shows you all of that the moment you turn the knob, and
 * an inventory dates the instant a channel is added. What a visitor cannot work
 * out by looking is why any of it exists, so that is all this says.
 *
 * The page IS the screen, not a window floating on it.
 */
export default function InfoApp({}: AppProps) {
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44, overflowY: 'auto',
      background: 'linear-gradient(180deg, #fdfbf5 0%, #f4efe2 100%)',
    }}>
      <div style={{ maxWidth: 620, padding: '22px 26px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ display: 'inline-flex', borderRadius: 3, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(0,0,0,0.4)' }}>
            {['#9a2a2a', '#d4a017', '#1f6f3e', '#2a4a8a'].map((c) => (
              <span key={c} style={{ width: 12, height: 26, background: c, display: 'block' }} />
            ))}
          </span>
          <h2 style={{ font: '800 27px/1 var(--font-sans)', color: '#1c1a17' }}>Classicverse</h2>
        </div>

        <p style={{ font: '400 15px/1.7 var(--font-sans)', color: '#1c1a17', marginBottom: 20 }}>
          A universe of classic things people still love. Anything made well enough to outlive its
          own moment can live here, each subject a channel on a vintage television set you operate
          rather than a database you query. Nothing is labelled on the dial: you turn the knob, a
          channel comes in, and what you find is what you were not looking for, which is how anybody
          ever fell for any of this in the first place. It is built on the belief that the things
          people love deserve to be kept with the same care they were made with.
        </p>

        {/* Deliberately general. The specific projects behind each channel change
            as channels are added, and the per-item DETAILS panel is where the
            actual credit lives - naming sources twice only lets one of the two
            go stale. What belongs here is the principle. */}
        <p style={{ font: '400 13px/1.6 var(--font-sans)', color: '#5a554d' }}>
          Nothing here is ours alone. Material is used under open licences or in the public domain,
          with the source and the terms named on the item itself; anything that streams belongs to
          whoever broadcasts it and is played, not stored. Marques and logos are the property of
          their respective owners and are shown for identification only.
        </p>
      </div>
    </div>
  );
}
