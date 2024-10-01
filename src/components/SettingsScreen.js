import React, { useState } from 'react';
import SettingsPage from './SettingsPage';
import Modal from './Modal';

const SettingsScreen = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button onClick={openModal} className="btn">Open Settings</button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <SettingsPage />
      </Modal>
    </>
  );
};

export default SettingsScreen;