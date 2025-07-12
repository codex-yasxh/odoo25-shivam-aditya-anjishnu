// components/UserCard.jsx
const UserCard = ({ name, skillsOffered, skillsWanted, rating }) => {
  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <div className="mr-4">
        <div className="w-12 h-12 bg-gray-300">
            <img className="rounded-full" src="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg?semt=ais_hybrid&w=740" alt="" />
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{name}</h3>
        <div className="my-2">
          <span className="text-sm font-medium">Skills Offered:</span>
          <div className="flex flex-wrap mt-1">
            {skillsOffered.map((skill, index) => (
              <span key={index} className="mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="my-2">
          <span className="text-sm font-medium">Skills Wanted:</span>
          <div className="flex flex-wrap mt-1">
            {skillsWanted.map((skill, index) => (
              <span key={index} className="mr-2 mb-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <button className="mb-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Request
        </button>
        <div className="text-sm">
          <span>rating {rating}/5</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;