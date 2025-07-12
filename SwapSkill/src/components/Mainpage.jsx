import { useState } from 'react';
import UserCard from './UserCards.jsx';
import LoginPage from './login.jsx';
import App from './buttom.jsx';

const MainPage = () => {
  // Sample data - in a real app you would fetch this from an API
  const allUsers = [
    {
  name: "Steve",
      skillsOffered: ["Javascript", "Python", "Design"],
      skillsWanted: ["Version", "Graphic diagram"],
      rating: 3.4
    },
    {
      name: "Sam",
      skillsOffered: ["Wordpress", "Excel", "Docs"],
      skillsWanted: ["Stats", "Web Dev"],
      rating: 2.5
    },
    {
      name: "David",
      skillsOffered: ["Own Script", "Python"],
      skillsWanted: ["Machine Learning", "Data scrapping"],
      rating: 2.5
    },
    {
      name: "Emma",
      skillsOffered: ["React", "Node.js"],
      skillsWanted: ["UI/UX Design", "Figma"],
      rating: 4.2
    },
    {
      name: "Alex",
      skillsOffered: ["Java", "Spring Boot"],
      skillsWanted: ["Microservices", "AWS"],
      rating: 3.8
    },
    {
      name: "Priya",
      skillsOffered: ["Data Analysis", "SQL"],
      skillsWanted: ["Python", "Machine Learning"],
      rating: 4.0
    },
    {
      name: "Jordan",
      skillsOffered: ["Flutter", "Dart"],
      skillsWanted: ["Firebase", "UI Design"],
      rating: 3.5
    },
    {
      name: "Taylor",
      skillsOffered: ["Photoshop", "Illustrator"],
      skillsWanted: ["Web Design", "Branding"],
      rating: 4.1
    },
    {
      name: "Casey",
      skillsOffered: ["DevOps", "Docker"],
      skillsWanted: ["Kubernetes", "CI/CD"],
      rating: 4.3
    },
    {
      name: "Riley",
      skillsOffered: ["Content Writing", "SEO"],
      skillsWanted: ["Copywriting", "Marketing"],
      rating: 3.9
    },
    {
      name: "Morgan",
      skillsOffered: ["Cybersecurity", "Ethical Hacking"],
      skillsWanted: ["Network Security", "Pen Testing"],
      rating: 4.4
    },
    {
      name: "Skyler",
      skillsOffered: ["Angular", "TypeScript"],
      skillsWanted: ["RxJS", "State Management"],
      rating: 3.7
    },
    {
      name: "Jamie",
      skillsOffered: ["Swift", "iOS Development"],
      skillsWanted: ["UIKIt", "Core Data"],
      rating: 4.0
    },
    {
      name: "Avery",
      skillsOffered: ["Android", "Kotlin"],
      skillsWanted: ["Jetpack Compose", "Material Design"],
      rating: 3.8
    },
    {
      name: "Michael",
      skillsOffered: ["Generative Ai", "Prompt Engineering"],
      skillsWanted: ["Vibe Coding", "be10x"],
      rating: 3.8
    }
  ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  // State for login modal and authentication
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State for showing user profile/request flow
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserProfile(false);
    setSelectedUserData(null);
  };

  // Handle request button click
  const handleRequestClick = (userData) => {
    if (isLoggedIn) {
      setSelectedUserData(userData);
      setShowUserProfile(true);
    } else {
      setShowLogin(true);
    }
  };



  // If showing user profile, render the profile component
  if (showUserProfile && selectedUserData) {
    return (
      <div className="w-full h-full">
        <App userData={{
          userSkillsOffered: selectedUserData.skillsOffered,
          userSkillsWanted: selectedUserData.skillsWanted,
          userName: selectedUserData.name
        }} />
      </div>
    );
  }

  return (
    <div className="w-full h-full mx-auto p-4 bg-gradient-to-br from-black from-10% to-pink-800 to-90%">
      <div className='flex flex-row gap-4 justify-between max-w-full px-2 py-2 mb-10'>
        <h1 className="text-2xl font-bold mb-6 text-white duration-500 hover:bg-clip-text hover:bg-gradient-to-r hover:bg-blend-difference hover:from-purple-500 from-10% hover:to-pink-500 to-90% cursor-pointer">
          {isLoggedIn ? <div className='flex flex-row h-18 w-20 gap-8 '>
            <img className='rounded-full' src="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg?semt=ais_hybrid&w=740" alt="" />
            <button className='text-xl hover:underline cursor-pointer'>
                <h1>Swap Request</h1>
            </button>
          </div> : "Skill Swap Platform"}
        </h1>
        
        {/* Login/Logout Button */}
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="hidden cursor-pointer text-xl text-white md:flex hover:text-blue-400 duration-300"
          >
            Logout
          </button>
        ) : (
          <button 
            onClick={() => setShowLogin(true)}
            className="hidden cursor-pointer text-xl text-white md:flex hover:text-blue-400 duration-300"
          >
            Login
          </button>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-tr from-black to-pink-900 p-6 rounded-lg max-w-md w-full relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-pink-400"
            >
              ×
            </button>
            <LoginPage 
              onClose={() => setShowLogin(false)} 
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
      
      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-row gap-4 justify-center">
        <select className="block w-32 rounded-md text-black border-gray-300 shadow-sm bg-purple-200 sm:text-sm px-2">
          <option>Availability</option>
          <option>Free</option>
          <option>Busy</option>
          <option>Waiting</option>
        </select>
        <input 
          type="text" 
          placeholder="Search" 
          className="w-72 p-2 border text-white border-gray-300 rounded"
        />
      </div>
      
      {/* User Cards */}
      <div className="border text-white   rounded-lg  flex flex-col ">
        {currentUsers.map((user, index) => (
          <UserCard 
            key={index} 
            {...user} 
            onRequestClick={() => handleRequestClick(user)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(allUsers.length / usersPerPage) }, (_, i) => i + 1).map(number => (
            <button 
              key={number}
              onClick={() => paginate(number)}
              className={`w-8 h-8 text-white flex items-center justify-center border duration-500 border-gray-300 rounded hover:bg-gray-100 hover:text-pink-500 ${
                currentPage === number ? 'bg-pink-500' : ''
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;