import React from 'react';
import { useTranslation } from 'next-i18next';

const Menu = ({ onSettingsClick }) => {
  const { t } = useTranslation('common');

  return (
    <div>
      <button onClick={onSettingsClick}>{t('menu.settings')}</button>
    </div>
  );
};

export default Menu;