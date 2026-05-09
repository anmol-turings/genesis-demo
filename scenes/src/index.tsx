import {registerRoot, Composition} from 'remotion';
import {Iceberg} from './Iceberg';
import {Embers} from './Embers';
import {SlabShedding} from './SlabShedding';
import {SignatureSmoke} from './SignatureSmoke';
import {WhoStays} from './WhoStays';
import {RestMultiplier} from './RestMultiplier';
import {ReachStay} from './ReachStay';
import {FeltNamedFree} from './FeltNamedFree';
import {FocusBurns} from './FocusBurns';
import {StopPreparing} from './StopPreparing';
import {WalksLighter} from './WalksLighter';

const SIG = {durationInFrames: 240, fps: 30, width: 1080, height: 1080};

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
    <Composition
      id="SlabShedding"
      component={SlabShedding}
      durationInFrames={420}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{archetypeId: 'stoic'}}
    />
    <Composition id="SignatureSmoke" component={SignatureSmoke} {...SIG} />
    <Composition id="WhoStays" component={WhoStays} {...SIG} />
    <Composition id="RestMultiplier" component={RestMultiplier} {...SIG} />
    <Composition id="ReachStay" component={ReachStay} {...SIG} />
    <Composition id="FeltNamedFree" component={FeltNamedFree} {...SIG} />
    <Composition id="FocusBurns" component={FocusBurns} {...SIG} />
    <Composition id="StopPreparing" component={StopPreparing} {...SIG} />
    <Composition id="WalksLighter" component={WalksLighter} {...SIG} />
  </>
);

registerRoot(Root);
