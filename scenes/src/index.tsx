import {registerRoot, Composition} from 'remotion';
import {Iceberg} from './Iceberg';
import {Embers} from './Embers';

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
    <Composition
      id="Embers"
      component={Embers}
      durationInFrames={210}
      fps={30}
      width={840}
      height={680}
    />
    <Composition
      id="IcebergBare"
      component={Iceberg}
      durationInFrames={240}
      fps={30}
      width={1280}
      height={800}
      defaultProps={{showLabels: false}}
    />
  </>
);

registerRoot(Root);
