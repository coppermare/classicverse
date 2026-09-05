'use client';

import RollerDial, { type RollerDialOption } from '@/components/RollerDial';
import TvKnob from '@/components/TvKnob';
import VolumeDial from '@/components/VolumeDial';

interface TelevisionControlsProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  rollerOptions: RollerDialOption[];
  rollerSelected: string | null;
  rollerLabel: string;
  onRollerSelect: (id: string | null) => void;
  onRollerActivate: () => void;
  fastTuning: boolean;
  brightness: number;
  contrast: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  fillsViewport: boolean;
  onToggleFill: () => void;
  screenOn: boolean;
  onTogglePower: () => void;
}

function circleButtonShadow(pressed: boolean) {
  return pressed
    ? 'inset 0 3px 6px rgba(0,0,0,0.9), inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 0 rgba(0,0,0,0.75), 0 2px 3px rgba(0,0,0,0.40), 0 1px 1px rgba(0,0,0,0.30)'
    : 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 2px rgba(255,255,255,0.06), 0 3px 0 rgba(0,0,0,0.75), 0 4px 6px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.35)';
}

/** The physical controls mounted beside the television screen. */
export default function TelevisionControls({
  volume,
  onVolumeChange,
  rollerOptions,
  rollerSelected,
  rollerLabel,
  onRollerSelect,
  onRollerActivate,
  fastTuning,
  brightness,
  contrast,
  onBrightnessChange,
  onContrastChange,
  fillsViewport,
  onToggleFill,
  screenOn,
  onTogglePower,
}: TelevisionControlsProps) {
  return (
    <div className="cv-tv-right-col">
      <div style={{ marginBottom: -20 }}>
        <VolumeDial value={volume} onChange={onVolumeChange} embedded ariaLabel="Volume" />
      </div>

      <RollerDial
        options={rollerOptions}
        selectedId={rollerSelected}
        onSelect={onRollerSelect}
        onActivate={onRollerActivate}
        embedded
        showAll={false}
        ariaLabel={rollerLabel}
        pace={fastTuning ? 'list' : 'fine'}
      />

      <div style={{ display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center' }}>
        <TvKnob label="BRIGHT" value={brightness} onChange={onBrightnessChange} />
        <TvKnob label="CONTRAST" value={contrast} onChange={onContrastChange} />
      </div>

      <div className="cv-tv-speaker-grille" style={{ margin: '0 4px', flex: 1, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="cv-tv-brand-plate">
          <div className="cv-tv-brand-mark-strip">
            <span style={{ background: '#9a2a2a' }} />
            <span style={{ background: '#d4a017' }} />
            <span style={{ background: '#1f6f3e' }} />
            <span style={{ background: '#2a4a8a' }} />
          </div>
          <span className="cv-tv-brand-name">Classicverse</span>
        </div>
      </div>

      <div className="cv-tv-power-row">
        <button
          type="button"
          className="cv-tv-fill-button"
          onClick={onToggleFill}
          aria-label={fillsViewport ? 'Restore television frame' : 'Fill television viewport'}
          aria-pressed={fillsViewport}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {fillsViewport ? (
              <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>

        <button
          type="button"
          onClick={onTogglePower}
          aria-label={screenOn ? 'Turn off' : 'Turn on'}
          aria-pressed={screenOn}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: screenOn ? '#1c1512' : '#3a2f26',
            boxShadow: circleButtonShadow(screenOn),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'box-shadow 200ms, background 200ms',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ display: 'block', overflow: 'visible' }}>
            <g transform="translate(0 0.5)" style={{ filter: screenOn ? 'drop-shadow(0 0 2.5px #ffffffcc)' : 'none', transition: 'filter 200ms' }}>
              <path d="M 5.5 4.2 A 6 6 0 1 0 12.5 4.2" stroke={screenOn ? '#fff' : '#b8ada2'} strokeWidth="1.8" strokeLinecap="round" fill="none" style={{ transition: 'stroke 200ms' }} />
              <line x1="9" y1="2" x2="9" y2="7" stroke={screenOn ? '#fff' : '#b8ada2'} strokeWidth="1.8" strokeLinecap="round" style={{ transition: 'stroke 200ms' }} />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}
