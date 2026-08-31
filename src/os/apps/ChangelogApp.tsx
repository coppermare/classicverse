'use client';

import { CHANGELOG } from '@/data/changelog';
import type { AppProps } from '../types';

/** A visitor-facing history of the set, distilled from repository milestones. */
export default function ChangelogApp({}: AppProps) {
  return (
    <section className="cv-changelog" aria-labelledby="cv-changelog-title">
      <header className="cv-changelog-header">
        <div>
          <p className="cv-changelog-kicker">From the archive</p>
          <h1 id="cv-changelog-title">Changelog</h1>
        </div>
        <p className="cv-changelog-intro">
          The moments when Classicverse became something new — written for visitors, not as a list of commits.
        </p>
      </header>

      <ol className="cv-changelog-list">
        {CHANGELOG.map((entry, index) => (
          <li className="cv-changelog-entry" key={`${entry.date}-${entry.title}`}>
            <div className="cv-changelog-date">
              <span aria-hidden="true">{String(CHANGELOG.length - index).padStart(2, '0')}</span>
              <time dateTime={entry.date}>{entry.displayDate}</time>
            </div>
            <article>
              <p className="cv-changelog-category">{entry.category}</p>
              <h2>{entry.title}</h2>
              <p>{entry.summary}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
