import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, staticFile} from 'remotion';

const firstCaptureTrimFrames = 11.6 * 30;
const firstCaptureFrames = 41.5 * 30;
const secondCaptureTrimFrames = 25.2 * 30;
const secondCaptureFrames = 18.5 * 30;

export const RadioDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#17120d'}}>
      <Video
        name="Real app — power on, open Radio, tune with knob"
        src={staticFile('classicverse-radio-proper-a.webm')}
        trimBefore={firstCaptureTrimFrames}
        durationInFrames={firstCaptureFrames}
        muted
        style={{width: 1440, height: 900}}
      />
      <Audio
        name="Synchronized native app audio — part 1"
        src={staticFile('classicverse-radio-proper-a.mp3')}
        durationInFrames={firstCaptureFrames}
      />
      <Video
        name="Real app — continued knob tuning"
        src={staticFile('classicverse-radio-proper-b.webm')}
        trimBefore={secondCaptureTrimFrames}
        from={firstCaptureFrames}
        durationInFrames={secondCaptureFrames}
        muted
        style={{width: 1440, height: 900}}
      />
      <Audio
        name="Synchronized native app audio — part 2"
        src={staticFile('classicverse-radio-proper-b.mp3')}
        from={firstCaptureFrames}
        durationInFrames={secondCaptureFrames}
      />
    </AbsoluteFill>
  );
};
