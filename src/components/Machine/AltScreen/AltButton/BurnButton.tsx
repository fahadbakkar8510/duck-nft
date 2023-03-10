import { FC } from 'react';
import { indexOf } from 'lodash';
import useSound from 'use-sound';
import { PixelArrow } from '../../../../icons';
import Button from '../Button';
import useMachineStore from '../../../../store';
// @ts-ignore
import lcdPress from '../../../../assets/audio/lcd.ogg';
// @ts-ignore
import tv from '../../../../assets/audio/tv.mp3';

interface DuckNavButtonProps {
  onClick: () => void;
  disabled: boolean;
  flipped?: boolean;
}

const DuckNavButton: FC<DuckNavButtonProps> = ({ onClick, disabled = false, flipped = false }) => {
  return (
    <div
      className={`
        w-6 h-6 transition cursor-pointer relative
        ${disabled ? 'opacity-20' : 'opacity-75 hover:opacity-100'}
        ${flipped ? 'transform rotate-180' : ''}
      `}
      onClick={onClick}
    >
      <PixelArrow className="w-full h-full transform rotate-180" />
    </div>
  );
};

interface BurnButtonProps {
  disabled?: boolean;
}

const BurnButton: FC<BurnButtonProps> = ({ disabled = false }) => {
  const {
    setOpenBurnForm,
    openBurnForm,
    setCurrentAdminDuckId,
    currentAdminDuckId,
    burnableDucks,
  } = useMachineStore();

  const [play] = useSound(lcdPress);
  const [playTv] = useSound(tv);

  const duck = burnableDucks?.filter((d) => d.burnable).find((d) => d.id === currentAdminDuckId);
  const duckIndex = indexOf(burnableDucks, duck);

  const handleClickNext = () => {
    const duckIndex = indexOf(burnableDucks, duck);
    const nextDuckIndex = duckIndex + 1;
    if (nextDuckIndex < burnableDucks.length) {
      playTv();
      setCurrentAdminDuckId(burnableDucks[nextDuckIndex].id);
    }
  };

  const handleClickPrev = () => {
    const duckIndex = indexOf(burnableDucks, duck);
    const prevDuckIndex = duckIndex - 1;
    if (prevDuckIndex >= 0) {
      playTv();
      setCurrentAdminDuckId(burnableDucks[prevDuckIndex].id);
    }
  };

  const handleClickBurn = () => {
    if (duckIndex >= 0) {
      play();
      setOpenBurnForm(true);
    }
  };

  return !openBurnForm ? (
    <div className="flex justify-between items-center h-full w-full px-3">
      <DuckNavButton disabled={duckIndex <= 0} onClick={handleClickPrev} />
      <Button onClick={handleClickBurn} disabled={disabled}>
        <div
          className={`
            lcd-font text-black relative
            ${duckIndex >= 0 && !disabled ? 'opacity-75 hover:font-bold' : ''}
          `}
        >
          burn
        </div>
      </Button>
      <DuckNavButton
        flipped
        disabled={duckIndex === burnableDucks.length - 1}
        onClick={handleClickNext}
      />
    </div>
  ) : (
    <div className="lcd-font h-full w-full space-x-5 flex justify-center items-center text-xl opacity-50">
      <p>USE FORM</p>
      <div className="animate-pokeRight">--&gt;</div>
    </div>
  );
};

export default BurnButton;
