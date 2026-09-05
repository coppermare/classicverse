'use client';

import { CHANGELOG } from '@/data/changelog';
import type { AppProps } from '../types';

/** A visitor-facing history of the set, distilled from repository milestones. */
export default function ChangelogApp({}: AppProps) {
  return (
    <section className="cv-changelog" aria-labelledby="cv-changelog-title">
      <h1 className="cv-changelog-title" id="cv-changelog-title">Changelog</h1>
      <ol className="cv-changelog-list">
        {CHANGELOG.map((entry) => (
          <li className="cv-changelog-entry" key={`${entry.date}-${entry.title}`}>
            <span className="cv-changelog-marker" aria-hidden="true" />
            <article>
              <time dateTime={entry.date}>{entry.displayDate}</time>
              <h2>{entry.title}</h2>
              <p>{entry.summary}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
