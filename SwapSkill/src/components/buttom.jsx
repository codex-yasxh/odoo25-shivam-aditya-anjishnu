import React, { useState } from 'react';
import SkillSwapPlatform from './userprofile';
import SkillRequestForm from './skill';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('profile');
  const [targetUserData, setTargetUserData] = useState(null);

  const handleRequestClick = (userData) => {
    setTargetUserData(userData);
    setCurrentScreen('request');
  };

  const handleBackClick = () => {
    setCurrentScreen('profile');
    setTargetUserData(null);
  };

  return (
    <>
      {currentScreen === 'profile' && (
        <SkillSwapPlatform onRequestClick={handleRequestClick} />
      )}
      {currentScreen === 'request' && (
        <SkillRequestForm 
          onBackClick={handleBackClick}
          targetUserData={targetUserData}
        />
      )}
    </>
  );
}