import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">
          &times; {/* Close button */}
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;