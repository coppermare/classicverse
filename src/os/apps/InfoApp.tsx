'use client';

import { CARS } from '@/data/cars';
import { FERRARI_WINS } from '@/data/ferrariWins';
import { RADIO_STATIONS } from '@/data/radioStations';
import type { AppProps } from '../types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3 style={{ font: '700 14px/1 var(--font-sans)', color: '#2a4a8a', marginBottom: 7 }}>{title}</h3>
      <div style={{ font: '400 14px/1.65 var(--font-sans)', color: '#1c1a17' }}>{children}</div>
    </section>
  );
}

/**
 * The colophon: what this is, what's in it, and where every asset came from.
 *
 * The page IS the screen — not a window floating on it. It used to be a beveled
 * card with its own "About Classicverse" title bar, which boxed a page inside a
 * box and repeated a title the toolbar's address trail was already showing.
 */
export default function InfoApp({}: AppProps) {
  const tracks = RADIO_STATIONS.reduce((n, s) => n + s.tracks.length, 0);
  const minutes = Math.round(RADIO_STATIONS.reduce((n, s) => n + s.tracks.reduce((m, t) => m + t.duration, 0), 0) / 60);

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

        <Section title="What this is">
          An interactive archive of the automobile&apos;s first century — one landmark car for every
          year from 1885 to 1984 — presented as a vintage television set you operate. Turn the dial,
          tune through the decades, and read each machine in the context of the world that built it.
        </Section>

        <Section title="What's inside">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li style={{ marginBottom: 5 }}><strong>A century of cars</strong> — {CARS.length} cars, one for every year, each with sources and the reasoning for its selection.</li>
            <li style={{ marginBottom: 5 }}><strong>F1 Archive</strong> — all {FERRARI_WINS.length} of Ferrari&apos;s Grand Prix victories, each with a photograph of the car that scored it.</li>
            <li style={{ marginBottom: 5 }}><strong>Radio</strong> — {RADIO_STATIONS.length} stations, {tracks} recordings, about {minutes} minutes of period music. Nothing is labelled on the dial; tune across the band and find them.</li>
            <li><strong>Guide</strong> — an index of everything on the set.</li>
          </ul>
        </Section>

        <Section title="Sources and licensing">
          Every photograph is Creative Commons or public domain, sourced from Wikimedia Commons and
          credited on each item&apos;s DETAILS panel. The music is genuinely public domain: US sound
          recordings published before 1925 entered the public domain under the Music Modernization
          Act, and the U.S. Marine Band sides are federal-government works. That legal boundary is
          why the dial stops in the 1920s rather than running to 1984.
        </Section>

        <Section title="How it's built">
          The set is a small operating system. Everything on it is either a folder or an app, held in
          a single registry, so new modules — another archive, a game, a utility — are added as nodes
          rather than as new screens wired into the shell. Every sound the hardware makes, from the
          button clicks to the CRT powering up to the static between stations, is synthesised in the
          browser; none of it is a file.
        </Section>

        <Section title="About the project">
          A portfolio piece, not a marketplace — an exercise in product thinking, historical research,
          data modelling, and interaction design.
        </Section>

        <p style={{ font: '400 13px/1.55 var(--font-sans)', color: '#5a554d' }}>
          Marques and logos are the property of their respective owners and are shown for
          identification only.
        </p>
      </div>
    </div>
  );
}
