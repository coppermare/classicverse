import type { F1Team, F1Win, F1WinRecord } from '@/types/f1';

type ArtworkTeam = Pick<F1Team, 'name' | 'mark' | 'accent'>;
type ArtworkWin = Pick<F1WinRecord, 'number' | 'year' | 'grand_prix' | 'driver'>;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function archiveRoute(seed: number) {
  const x = (shift: number) => 162 + ((seed >>> shift) & 63) * 9;
  const y = (shift: number) => 235 + ((seed >>> shift) & 31) * 8;
  return `M 112 ${y(0)} C ${x(4)} ${y(5)}, ${x(10)} ${y(11)}, ${x(16)} ${y(17)} S ${x(3)} ${y(22)}, 770 ${y(7)} C 832 ${y(13)}, 822 ${y(19)}, 735 430 S ${x(9)} 492, 192 438 C 102 387, 88 301, 112 ${y(0)}`;
}

/**
 * A deterministic, local archive cover for generated results that do not have
 * a licensed race photograph. It is deliberately an editorial graphic rather
 * than a fake car photo: every record still has an image, and the artwork says
 * exactly which constructor, race, driver, season and win it represents.
 */
export function getF1WinArtwork(team: ArtworkTeam, win: ArtworkWin) {
  const teamName = escapeXml(team.name.toUpperCase());
  const mark = escapeXml(team.mark.toUpperCase());
  const race = escapeXml(`${win.grand_prix.toUpperCase()} GRAND PRIX`);
  const driver = escapeXml(win.driver.toUpperCase());
  const winNumber = String(win.number).padStart(3, '0');
  const seed = hash(`${team.name}:${win.year}:${win.grand_prix}:${win.driver}:${win.number}`);
  const route = archiveRoute(seed);
  const markerX = 170 + (seed % 590);
  const markerY = 230 + ((seed >>> 9) % 240);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#19191d"/>
        <stop offset="1" stop-color="#050507"/>
      </linearGradient>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M36 0H0V36" fill="none" stroke="#ffffff" stroke-opacity=".045"/>
      </pattern>
    </defs>
    <rect width="960" height="720" fill="url(#shade)"/>
    <rect width="960" height="720" fill="url(#grid)"/>
    <path d="M0 0h26v720H0zM26 0h9v720h-9z" fill="${team.accent}"/>
    <path d="M590 -80h210L480 800H270z" fill="${team.accent}" opacity=".16"/>
    <path d="M760 -80h58L498 800h-58z" fill="#ffffff" opacity=".045"/>

    <text x="82" y="100" fill="${team.accent}" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="800" letter-spacing="7">${mark}</text>
    <text x="82" y="153" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="45" font-weight="800" letter-spacing="1">${teamName}</text>

    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${route}" stroke="#ffffff" stroke-width="22" opacity=".13"/>
      <path d="${route}" stroke="#ffffff" stroke-width="8" opacity=".9"/>
      <path d="${route}" stroke="${team.accent}" stroke-width="3" stroke-dasharray="16 18"/>
      <circle cx="${markerX}" cy="${markerY}" r="20" fill="${team.accent}" stroke="#ffffff" stroke-width="5"/>
      <path d="M112 520H800" stroke="#ffffff" stroke-width="2" opacity=".22"/>
      <path d="M112 520H${markerX}" stroke="${team.accent}" stroke-width="6"/>
    </g>

    <text x="82" y="574" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="700" letter-spacing="3">${win.year} · ${race}</text>
    <text x="82" y="620" fill="#b9b9c0" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="600" letter-spacing="2">${driver}</text>
    <text x="895" y="626" text-anchor="end" fill="${team.accent}" font-family="Arial,Helvetica,sans-serif" font-size="112" font-weight="900" opacity=".92">${winNumber}</text>
    <text x="894" y="664" text-anchor="end" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" letter-spacing="5" opacity=".72">VICTORY</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getF1WinRecordArtwork(win: Pick<F1Win, 'teamName' | 'teamMark' | 'teamAccent' | 'number' | 'year' | 'grand_prix' | 'driver'>) {
  return getF1WinArtwork(
    { name: win.teamName, mark: win.teamMark, accent: win.teamAccent },
    win,
  );
}
