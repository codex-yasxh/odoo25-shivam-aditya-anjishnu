import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SkillRequestForm({ onBackClick, targetUserData }) {
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [showOfferedDropdown, setShowOfferedDropdown] = useState(false);
  const [showWantedDropdown, setShowWantedDropdown] = useState(false);

  // Your skills (what you can offer) - expanded list
  const offeredSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'HTML', 'Vue.js', 'Angular', 'PHP', 'TypeScript', 'MongoDB', 'SQL'];
  
  // Target user's wanted skills (what they're looking for)
  const wantedSkills = targetUserData?.userSkillsWanted || ['Python', 'Machine Learning', 'Data Science'];
  const targetUserName = targetUserData?.userName || 'User';

  const handleSubmit = () => {
    if (selectedOfferedSkill && selectedWantedSkill && message.trim()) {
      alert(`Request submitted!\nYou're offering: ${selectedOfferedSkill}\n${targetUserName} wants: ${selectedWantedSkill}\nMessage: ${message}`);
      // Reset form
      setSelectedOfferedSkill('');
      setSelectedWantedSkill('');
      setMessage('');
      // Optionally go back to profile after successful submission
      // if (onBackClick) onBackClick();
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Screen 5 Title */}
        <h1 className="text-white text-lg font-normal mb-8 text-left">Screen 5</h1>
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="mb-6 text-white hover:text-teal-400 transition-colors"
        >
          ← Back to Profile
        </button>
        
        {/* Main Container */}
        <div className="border border-white rounded-2xl p-8 bg-black max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-white text-xl font-normal">
              Request Skill Swap with {targetUserName}
            </h2>
          </div>

          <div className="space-y-8">
            {/* Choose offered skill */}
            <div>
              <label className="block text-white text-base font-normal mb-4">
                Choose one of your offered skills
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOfferedDropdown(!showOfferedDropdown)}
                  className="w-full border border-white rounded-lg bg-black text-white px-4 py-3 text-left flex items-center justify-between hover:bg-gray-900 transition-colors"
                >
                  <span className={selectedOfferedSkill ? 'text-white' : 'text-gray-500'}>
                    {selectedOfferedSkill || 'Select a skill...'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-white" />
                </button>
                
                {showOfferedDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white rounded-lg z-10 max-h-48 overflow-y-auto">
                    {offeredSkills.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedOfferedSkill(skill);
                          setShowOfferedDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Choose wanted skill */}
            <div>
              <label className="block text-white text-base font-normal mb-4">
                Choose one of {targetUserName}'s wanted skills
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowWantedDropdown(!showWantedDropdown)}
                  className="w-full border border-white rounded-lg bg-black text-white px-4 py-3 text-left flex items-center justify-between hover:bg-gray-900 transition-colors"
                >
                  <span className={selectedWantedSkill ? 'text-white' : 'text-gray-500'}>
                    {selectedWantedSkill || 'Select a skill...'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-white" />
                </button>
                
                {showWantedDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white rounded-lg z-10">
                    {wantedSkills.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedWantedSkill(skill);
                          setShowWantedDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-white text-base font-normal mb-4">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Write your message to ${targetUserName} here...`}
                className="w-full border border-white rounded-lg bg-black text-white px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg transition-colors font-normal"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}