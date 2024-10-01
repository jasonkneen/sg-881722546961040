import React from 'react';

const Menu = ({ onSettingsClick }) => {
  return (
    <div>
      <button onClick={onSettingsClick}>Settings</button>
    </div>
  );
};

export default Menu;