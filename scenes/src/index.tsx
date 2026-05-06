import {registerRoot, Composition} from 'remotion';
import {Iceberg} from './Iceberg';

const Root = () => (
  <>
    <Composition
      id="Iceberg"
      component={Iceberg}
      durationInFrames={240}
      fps={30}
      width={1280}
      height={800}
    />
  </>
);

registerRoot(Root);
