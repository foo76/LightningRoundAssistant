
import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void; // Optional: if you want a close button in the modal
  flashingText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children, flashingText }) => {
  const [isTextVisible, setIsTextVisible] = useState(true);

  useEffect(() => {
    let intervalId: number | null = null; // Changed NodeJS.Timeout to number
    if (isOpen && flashingText) {
      intervalId = setInterval(() => {
        setIsTextVisible(prev => !prev);
      }, 700); // Flash interval
    } else {
      setIsTextVisible(true);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, flashingText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center relative">
        <h2 className="text-3xl font-bold text-sky-400 mb-6">{title}</h2>
        {children}
        {flashingText && (
          <p 
            className={`text-5xl font-extrabold text-red-500 mt-8 transition-opacity duration-500 ease-in-out ${isTextVisible ? 'opacity-100' : 'opacity-30'}`}
          >
            {flashingText}
          </p>
        )}
      </div>
    </div>
  );
};

export default Modal;
