import { FC } from 'react';
import ModeSwitcher from '../../common/ModeSwitcher';
import useMachineStore from '../../../store';
import AdminMain from './AdminMode';
import DrawingTool from './CustomizationMode';
import LoadingScreen from './LoadingScreen.tsx/index';
import BrowsingMode from './BrowsingMode';
import { MachineMode } from '../../../utils/constants';
import Screen from '../common/Screen';

interface MainScreenProps {
  screenInverted: boolean;
  switchModes: (direction: string) => void;
}

const MainScreen: FC<MainScreenProps> = ({ screenInverted, switchModes }) => {
  const { currentMode } = useMachineStore();

  return (
    <Screen
      style={{ pointerEvents: 'auto' }}
      distanceFactor={2.4}
      position={[0.0, 0.0, 0.0]}
      rotation={
        screenInverted
          ? [Math.PI / 2, -Math.PI * 2, Math.PI / 2]
          : [Math.PI / 2, Math.PI, Math.PI / 2]
      }
      transform
      occlude
    >
      { currentMode === MachineMode.Off && <LoadingScreen switchModes={switchModes} /> }
      { currentMode === MachineMode.Shopping && <BrowsingMode /> }
      <DrawingTool switchModes={switchModes} />
      { currentMode === MachineMode.Admin && <AdminMain /> }
      <ModeSwitcher switchModes={switchModes} />
    </Screen>
  );
};

export default MainScreen;
