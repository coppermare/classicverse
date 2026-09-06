import {Composition} from 'remotion';
import {RadioDemo} from './radio-demo/RadioDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="RadioDemo" component={RadioDemo} durationInFrames={1800} fps={30} width={1440} height={900} />
  );
};
