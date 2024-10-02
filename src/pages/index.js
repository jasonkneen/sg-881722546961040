import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { toast, Toaster } from "sonner";
import { MoreHorizontal, Send, MapPin, Play, Pause, Bell, BellRing, AlertTriangle, Wifi, Menu, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/router';
import GeminiMessenger from '@/components/GeminiMessenger';
import AboutModal from '@/components/AboutModal';
import HelpModal from '@/components/HelpModal';
import SettingsModal from '@/components/SettingsModal';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function Home() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth(); 
  const router = useRouter();
  const [status, setStatus] = useState('Idle');
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [isPreAlarmDialogOpen, setIsPreAlarmDialogOpen] = useState(false);
  const [isSOSAlarmActive, setIsSOSAlarmActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [isPreAlarmActive, setIsPreAlarmActive] = useState(false);
  const [preAlarmTimeRemaining, setPreAlarmTimeRemaining] = useState(null);
  const [isPreAlarmExtension, setIsPreAlarmExtension] = useState(false);
  const messengerRef = useRef(null);
  const [showLoader, setShowLoader] = useState(true);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (user && !user.phoneNumber) {
      toast.error(t('errors.noPhoneNumber'));
      router.push('/login');
    }
  }, [user, router, t]);

  const toggleLocationMonitoring = () => {
    setIsLocationMonitoring(!isLocationMonitoring);
  };

  const handleStartPreAlarm = () => {
    setIsPreAlarmDialogOpen(true);
  };

  const handleSOSAlarm = () => {
    setIsSOSAlarmActive(!isSOSAlarmActive);
  };

  const handlePreAlarmStart = () => {
    setIsPreAlarmActive(true);
    setPreAlarmTimeRemaining(300); // 5 minutes
  };

  const handleExtendPreAlarm = () => {
    setPreAlarmTimeRemaining(prev => prev + 300);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAuthenticate = () => {
    // Implement authentication logic here
  };

  const showToast = (message, type = 'default') => {
    toast[type](message);
  };

  const renderButtonContent = (icon, text) => (
    <>
      {icon}
      <span className="mt-2">{text}</span>
    </>
  );

  // ... (rest of the component logic remains the same)

  return showLoader ? (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700 text-white">
      <Loader className="w-16 h-16 animate-spin mb-4" />
      <p className="text-xl">{t('loading.checkingUserInfo')}</p>
    </div>
  ) : (
    <div className="flex flex-col min-h-screen bg-gray-700 text-white p-4">
      <Toaster richColors />
      <GeminiMessenger ref={messengerRef} />
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Wifi className="w-8 h-8 text-white mr-2" />
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            {isLocationMonitoring ? (
              <BellRing className="mr-1 text-green-500 animate-ring" />
            ) : (
              <MapPin className="mr-1 text-gray-500" />
            )}
            <span className={`font-bold ${isLocationMonitoring ? 'text-green-500' : 'text-gray-500'}`}>
              {isLocationMonitoring ? t('status.on') : t('status.off')}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-600">
              <DropdownMenuItem
                onClick={handleSettingsClick}
                className="hover:bg-gray-500"
              >
                {t('menu.settings')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:bg-gray-500"
              >
                {t('menu.help')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsAboutModalOpen(true)}
                className="hover:bg-gray-500"
              >
                {t('menu.about')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-gray-500"
              >
                {t('menu.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={toggleLocationMonitoring}
            variant={isLocationMonitoring ? "destructive" : "default"}
            className={`${isLocationMonitoring ? 'bg-green-500 hover:bg-green-600' : 'bg-[#757575] hover:bg-[#656565]'} h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg`}
          >
            {renderButtonContent(
              isLocationMonitoring ? <Pause className="w-16 h-16 mb-2" /> : <Play className="w-16 h-16 mb-2" />,
              <span className="text-[0.98em]">{isLocationMonitoring ? t('buttons.stopMonitoring') : t('buttons.startMonitoring')}</span>
            )}
          </Button>

          <Button 
            onClick={handleStartPreAlarm} 
            variant="default" 
            className={`${isPreAlarmActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#757575] hover:bg-[#656565]'} h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg`}
          >
            {renderButtonContent(
              <Bell className="w-16 h-16 mb-2" />,
              <span className="text-[0.98em]">{isPreAlarmActive ? t('buttons.stopPreAlarm') : t('buttons.startPreAlarm')}</span>
            )}
          </Button>

          <Button 
            onClick={handleSOSAlarm} 
            variant="destructive" 
            className="bg-red-500 hover:bg-red-600 h-32 flex flex-col items-center justify-center col-span-2 rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
          >
            {renderButtonContent(<AlertTriangle className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">{t('buttons.sosAlarm')}</span>)}
          </Button>

          {isPreAlarmActive && preAlarmTimeRemaining !== null && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center col-span-2">
              <h2 className="text-lg font-semibold mb-2">{t('preAlarm.monitoring')}</h2>
              <p className="text-3xl font-bold mb-4">
                {Math.floor(preAlarmTimeRemaining / 60)}:
                {(preAlarmTimeRemaining % 60).toString().padStart(2, '0')}
              </p>
              <Button 
                onClick={handleExtendPreAlarm} 
                variant="default" 
                className="bg-[#757575] hover:bg-[#656565] px-4 py-2 rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
              >
                {t('buttons.extendPreAlarm')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <PreAlarmDialog
        open={isPreAlarmDialogOpen}
        onOpenChange={setIsPreAlarmDialogOpen}
        onPreAlarmStart={handlePreAlarmStart}
        showToast={showToast}
        isExtension={isPreAlarmExtension}
      />

      <SOSAlarm
        isActive={isSOSAlarmActive}
        onDeactivate={() => setIsSOSAlarmActive(false)}
        user={user}
        location={location}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <Button 
        onClick={handleAuthenticate} 
        variant="default" 
        className="bg-blue-500 hover:bg-blue-600 h-12 flex items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
      >
        {t('buttons.authenticate')}
      </Button>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default Home;