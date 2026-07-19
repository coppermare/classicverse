import type { RadioStation } from '@/os/types';

/**
 * The live band: real broadcast stations, on the frequencies they really
 * transmit on.
 *
 * The list is a snapshot of the Radio Browser community index, built by
 * `scripts/build-live-band.js` and served from our own origin as
 * /live-band.json. The index has no frequency field and no way to query for the
 * stations that carry one in their name, so assembling this means pulling all
 * ~36,000 playable stations — 40MB, which is fine on a build machine and absurd
 * to send to a visitor. Filtered it is ~900KB, compressed in transit, cached by
 * the browser, and fetched only when the set is switched on.
 *
 * The streams themselves are live. Only the directory is frozen, so re-run the
 * script when the band starts feeling thin — stations do go off the air.
 */

/** One row of the snapshot, kept terse because there are thousands of them. */
interface BandRow {
  /** Short id, unique enough to key a station on. */
  i: string;
  /** Frequency, to one decimal — the real FM grid. */
  f: string;
  /** Station name, with the frequency and call-sign tail stripped. */
  n: string;
  /** Stream URL — https, non-HLS, playable by a bare <audio>. */
  u: string;
  /** Country. */
  c: string;
  /** Genre, or null when its tags carried nothing useful. */
  g: string | null;
}

const SNAPSHOT = '/live-band.json';

function toStation(row: BandRow): RadioStation {
  return {
    id: row.i,
    name: row.n,
    frequency: row.f,
    /* The dial now sits on the true frequency, so the ident's second line has
       no number to repeat — it says where the station is instead. */
    era: row.c,
    accent: '#b3282d',
    tracks: [{
      // A live stream has no track list, so the title line carries what the
      // station is rather than what is playing — nothing else knows.
      title: row.g ?? 'Live broadcast',
      artist: row.c,
      year: 0,
      duration: 0,
      src: row.u,
      license: 'Live stream',
      page: 'https://www.radio-browser.info/',
    }],
  };
}

/**
 * Every station on the band, ordered by frequency and, within a frequency, by
 * how many people listen to it — so the needle finds the most-listened station
 * on a given frequency first, and the rest are a button away.
 */
export async function fetchLiveBand(signal?: AbortSignal): Promise<RadioStation[]> {
  const res = await fetch(SNAPSHOT, { signal });
  if (!res.ok) throw new Error(`Band snapshot returned ${res.status}`);
  const rows = (await res.json()) as BandRow[];
  return rows.map(toStation);
}
