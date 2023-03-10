import { FC, ReactNode } from 'react';
// eslint-disable-next-line import/no-relative-packages
import { motion, AnimatePresence } from '../../../../node_modules/framer-motion/dist/framer-motion';
import { AltMessage } from '../../../types/types';
import TxNotification from './TxNotification';

interface MessageModalProps {
  message?: AltMessage;
  open: boolean;
  onClose: () => void;
}

const MessageModal: FC<MessageModalProps> = ({ message, open, onClose }) => {
  return (
    <AnimatePresence>
      { open && (
      <motion.div
        initial={{ scale: 0, x: '10%', y: '10%' }}
        animate={{ scale: 1, x: '10%', y: '10%' }}
        exit={{ scale: 0, x: '50%', y: '10%' }}
        transition={{ duration: 0.10 }}
        style={{ zIndex: 100 }}
        className={`
          select-none    
          absolute
          black-screen        
          pixel-font text-white p-5 border-2 border-white
          w-5/6 h-5/6 text-xl
          flex flex-col justify-between items-start                  
        `}
      >
        <TxNotification message={message?.message} txHash={message?.txHash} />
        <div className="flex w-full justify-end">
          <div
            onClick={onClose}
            className="bg-white text-screenBlack px-4 cursor-pointer"
          >
            Close
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageModal;
