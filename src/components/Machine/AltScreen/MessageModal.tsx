import { useState, FC, useEffect } from 'react';

interface MessageModalProps {
  message: string;  
  open: boolean;
  onClose: () => void;
}

const MessageModal: FC<MessageModalProps> = ({ message, open, onClose}) => {

  return open ? ( 
    <div 
      className={`          
        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2          
        black-screen        
        pixel-font text-white p-10 border-2 border-white
        w-5/6 h-5/6 text-xl
        flex flex-col justify-between items-start
        z-50
      `}
    >
      <div>
        {message.toUpperCase()}
      </div>
      <div className="flex w-full justify-end">
        <div 
          onClick={onClose}
          className="bg-white text-black px-4 cursor-pointer"
        >
          Close
        </div>
      </div>
    </div>
  ) : null;
}

export default MessageModal;