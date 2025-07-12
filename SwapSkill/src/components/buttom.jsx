import React, { useState } from 'react';

// Import all the page/view components.
// Note: Assumes all files are in the same directory.
import MainPage from './Mainpage.jsx';
import UserProfilePage from './profile.jsx';        // Screen 3: User's own editable profile
import SkillSwapPlatform from './userprofile.jsx';  // Screen 4: Viewing another user's profile
import SkillRequestForm from './skill.jsx';         // Screen 5: The skill swap request form

/**
 * This App component acts as a simple router to manage which page is currently displayed.
 * It holds the state for the current view and passes navigation functions to child components.
 */
export default function App() {
  // State to determine which view or "page" is currently active.
  // Possible values: 'main', 'userProfile', 'skillSwap', 'editProfile'
  const [currentView, setCurrentView] = useState('main');
  
  // State to store the data of the user being interacted with (e.g., viewing their profile or requesting a swap).
  const [activeUserData, setActiveUserData] = useState(null);

  // --- Navigation Handlers ---

  /**
   * Navigates to the main user listing page (Mainpage.jsx).
   * This would be called from "Home" buttons.
   */
  const goToHomePage = () => {
    setCurrentView('main');
    setActiveUserData(null); // Clear any active user data
  };

  /**
   * Navigates to another user's public profile page (userprofile.jsx).
   * This would be called when a user is selected from the MainPage.
   * @param {object} userData - The data of the user to display.
   */
  const viewUserProfile = (userData) => {
    // In a real app, you might use a user ID to fetch full data.
    // Here we just pass the object from the card.
    setActiveUserData(userData); 
    setCurrentView('userProfile');
  };

  /**
   * Navigates to the skill swap request form (skill.jsx).
   * This is called from the "Request" button on another user's profile.
   * @param {object} userData - The data of the user you want to swap with.
   */
  const requestSkillSwap = (userData) => {
    setActiveUserData(userData);
    setCurrentView('skillSwap');
  };

  /**
   * Navigates back to the previous relevant screen.
   */
  const goBack = () => {
    // If on the swap form, go back to the user's profile.
    if (currentView === 'skillSwap') {
      setCurrentView('userProfile');
    } else {
      // Otherwise, go back to the main page.
      goToHomePage();
    }
  };

  // --- View Rendering ---

  const renderCurrentView = () => {
    switch (currentView) {
      case 'main':
        // The MainPage component needs a way to trigger navigation.
        // We can't edit the original file, so we'll assume a prop `onUserSelect`
        // would be added to the UserCard component, which MainPage would then handle.
        // For this example, we'll pass `viewUserProfile` to it.
        return <MainPage onUserSelect={viewUserProfile} />;
      
      case 'userProfile':
        // This is Screen 4. It shows another user's profile.
        // It needs a function to handle the "Request" button click.
        return <SkillSwapPlatform onRequestClick={requestSkillSwap} />;
        
      case 'skillSwap':
        // This is Screen 5, the form to request a skill swap.
        // It needs a function for the "Back to Profile" button and the target user's data.
        return <SkillRequestForm onBackClick={goBack} targetUserData={activeUserData} />;
      
      case 'editProfile':
        // This is Screen 3, for editing the logged-in user's own profile.
        // It should have a way to go "Home".
        return <UserProfilePage onHomeClick={goToHomePage} />;
        
      default:
        // Default to the main page if the view state is invalid.
        return <MainPage onUserSelect={viewUserProfile} />;
    }
  };

  return (
    <div>
      {renderCurrentView()}
    </div>
  );
}