// components/MainPage.js
import UserCard from './UserCards.jsx'

const MainPage = () => {
  // Sample data - you would fetch this from an API in a real app
  const users = [
    {
      name: "Steve",
      skillsOffered: ["Javascript", "Python","Design"],
      skillsWanted: ["Version", "Graphic diagram"],
      rating: 3.4
    },
    {
      name: "Sam",
      skillsOffered: ["Wordpress", "Excel","Docs"],
      skillsWanted: ["Stats", "Web Dev"],
      rating: 2.5
    },
    {
      name: "David",
      skillsOffered: ["Own Script", "Python"],
      skillsWanted: ["Machine Learning", "Data scrapping"],
      rating: 2.5
    },
    // Add more users as needed
  ];

  return (
    <div className="w-full h-full mx-auto p-4 bg-black ">
        <div className='flex flex-row gap-4 justify-between  max-w-full px-2 py-2 mb-10'>
             <h1 className="text-2xl font-bold mb-6 text-white hover:text-transparent duration-500 hover:bg-clip-text hover:bg-gradient-to-r hover:bg-blend-difference hover:from-purple-500 from-10% hover:to-pink-500 to-90% cursor-pointer">Skill Swap Platform</h1>
             <a href="https://www.coursera.org/?authMode=login">
             <div class="hidden cursor-pointer text-xl text-white md:flex hover:text-blue-400 duration-300 ">Login</div>
             </a>
        </div>
     
      
      <div className="mb-6 flex flex-row gap-4 justify-center">
        <select className="block w-32 rounded-md text-black border-gray-300 shadow-sm bg-purple-200 sm:text-sm px-2">
            <div className='text-black font-light px-4'>
                <option>Availability</option>
                <option>Free</option>
                <option>Busy</option>
                <option>Waiting</option>
            </div>
      
      Availaibility
    </select>
        <input 
          type="text" 
          placeholder="Search" 
          className="w-72 p-2 border text-white border-gray-300 rounded"
        />
      </div>
      
      <div className="border text-white border-gray-200 rounded-lg overflow-hidden">
        {users.map((user, index) => (
          <UserCard key={index} {...user} />
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <button 
              key={num}
              className="w-8 h-8 text-white flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;