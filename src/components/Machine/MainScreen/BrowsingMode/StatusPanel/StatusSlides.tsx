import { FC, useState } from 'react';
import { shortenAddress } from '@usedapp/core';
// eslint-disable-next-line import/no-relative-packages
import { motion, AnimatePresence } from '../../../../../../node_modules/framer-motion/dist/framer-motion';
import { MachineState } from '../../../../../types/types';
import useMachineStore from '../../../../../store';
import NavButton from './NavButton';
import { mintStatusName } from '../../../../../utils/helpers';

interface SlideProps {
  state?: MachineState | undefined;
}

const AccountSlide: FC<SlideProps> = () => {
  const { account } = useMachineStore();
  return (
    <div className="w-full flex justify-between px-4 items-center">
      <div className="px-3 py-[2px] text-[#ffdf74] transparent bg-black bg-opacity-75">
        welcome
      </div>
      <div>
        Connected Account: <span className="ml-2">{ account ? shortenAddress(account) : 'Not Connected'}</span>
      </div>
    </div>
  );
};

const TozziSlide: FC<SlideProps> = ({ state }) => {
  return (
    <div className="w-full flex justify-between px-4 items-center">
      <div className="px-3 py-[2px] text-[#ffdf74] transparent bg-black bg-opacity-75">
        tozzi ducks
      </div>
      <div>
        { state?.config ? `status: ${mintStatusName(state.config.tozziMintStatus)}` : '--' }
      </div>
      <div>
        { state?.config ? `price: ${state.config.tozziMintPrice || ''} eth` : '--' }
      </div>
    </div>
  );
};

const CustomSlide: FC<SlideProps> = ({ state }) => {
  return (
    <div className="w-full flex justify-between px-4 items-center">
      <div className="px-3 py-[2px] text-[#ffdf74] transparent bg-black opacity-75">
        custom ducks
      </div>
      <div>
        { state?.config ? `status: ${mintStatusName(state.config.customMintStatus)}` : '--' }
      </div>
      <div>
        { state?.config ? `price: ${state.config.customMintPrice || ''} eth` : '--' }
      </div>
    </div>
  );
};

const ManualSlide: FC<SlideProps> = ({ state }) => {
  const ownerDisplay = state?.ownerEns || shortenAddress(state?.owner || '');
  const { setIsOwnersManualOpen, isOwnersManualOpen } = useMachineStore();
  return (
    <div className="w-full flex justify-between px-4 items-center">
      <div>
        owner:
        <a target="_blank" className="hover:font-bold" href={`https://opensea.io/${state?.owner}`} rel="noreferrer">
          {ownerDisplay}
        </a>
      </div>
      <button
        type="button"
        className="hover:font-bold"
        onClick={() => {
          document.body.style.overflow = 'hidden';
          setIsOwnersManualOpen(!isOwnersManualOpen);
        }}
      >
        View Manaual
      </button>
    </div>
  );
};

const StatusSlides: FC<{state: MachineState | undefined}> = ({ state }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showSlide, setShowSlide] = useState(true);

  const slideContent = [
    <AccountSlide state={state} />,
    <TozziSlide state={state} />,
    <CustomSlide state={state} />,
    // <ManualSlide state={state} />,
  ];

  const handleNext = () => {
    if (slideIndex !== slideContent.length - 1) {
      setShowSlide(false);
      setSlideIndex((slideIndex + 1));
      setTimeout(() => setShowSlide(true), 200);
    }
  };

  const handlePrev = () => {
    if (slideIndex > 0) {
      setShowSlide(false);
      setSlideIndex((slideIndex - 1));
      setTimeout(() => setShowSlide(true), 200);
    }
  };

  return (
    <div className="absolute flex justify-between w-full items-center pr-[10%] select-none text-xs">
      <NavButton
        disabled={slideIndex === 0}
        onClick={handlePrev}
      />
      <AnimatePresence>
        { showSlide && (
          <motion.div
            className="w-full"
            key={slideIndex}
            initial={{ y: -100, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.20 }}
          >
            {slideContent[slideIndex]}
          </motion.div>
        )}
      </AnimatePresence>
      <NavButton
        flipped
        disabled={slideIndex === slideContent.length - 1}
        onClick={handleNext}
      />
    </div>
  );
};

export default StatusSlides;
