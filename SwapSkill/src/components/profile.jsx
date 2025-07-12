import React, { useState } from 'react';
import { Camera, X, Plus } from 'lucide-react';

export default function UserProfilePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    location: '',
    availability: 'weekends',
    profile: 'Public',
    skillsOffered: ['Graphic Design', 'Video Editing', 'Marketing'],
    skillsWanted: ['Python', 'Data Analysis', 'Photography']
  });

  const [showAddSkill, setShowAddSkill] = useState({ offered: false, wanted: false });
  const [newSkill, setNewSkill] = useState({ offered: '', wanted: '' });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = (type) => {
    if (newSkill[type].trim()) {
      setProfileData(prev => ({
        ...prev,
        [`skills${type === 'offered' ? 'Offered' : 'Wanted'}`]: [
          ...prev[`skills${type === 'offered' ? 'Offered' : 'Wanted'}`],
          newSkill[type].trim()
        ]
      }));
      setNewSkill(prev => ({ ...prev, [type]: '' }));
      setShowAddSkill(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeSkill = (type, index) => {
    setProfileData(prev => ({
      ...prev,
      [`skills${type === 'offered' ? 'Offered' : 'Wanted'}`]: prev[`skills${type === 'offered' ? 'Offered' : 'Wanted'}`].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    console.log('Profile saved:', profileData);
    // Here you would typically send data to your backend
  };

  const handleDiscard = () => {
    setProfileData({
      name: '',
      location: '',
      availability: 'weekends',
      profile: 'Public',
      skillsOffered: ['Graphic Design', 'Video Editing', 'Marketing'],
      skillsWanted: ['Python', 'Data Analysis', 'Photography']
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Screen 3</h1>
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded"></div>
          </div>
        </div>

        <h2 className="text-xl mb-8">User profile</h2>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-3xl p-8 border-2 border-gray-600">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-1">
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm"
              >
                Save
              </button>
              <button 
                onClick={handleDiscard}
                className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm"
              >
                Discard
              </button>
              <button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm border-b-2 border-gray-500">
                Swap request
              </button>
              <button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm">
                Home
              </button>
            </div>
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-orange-500 rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-lg mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-500 focus:border-blue-400 outline-none py-2 text-white placeholder-gray-400 transition-colors duration-200"
                  placeholder="Enter your name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-lg mb-2">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-500 focus:border-blue-400 outline-none py-2 text-white placeholder-gray-400 transition-colors duration-200"
                  placeholder="Enter your location"
                />
              </div>

              {/* Skills Offered */}
              <div>
                <label className="block text-lg mb-4">Skills Offered</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skillsOffered.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 group"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill('offered', index)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {showAddSkill.offered ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkill.offered}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, offered: e.target.value }))}
                        className="bg-gray-700 px-3 py-1 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Add skill"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('offered')}
                        autoFocus
                      />
                      <button
                        onClick={() => addSkill('offered')}
                        className="text-green-400 hover:text-green-300 transition-colors duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddSkill(prev => ({ ...prev, offered: true }))}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                    >
                      <Plus size={14} />
                      Add Skill
                    </button>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-lg mb-2">Availability</label>
                <select
                  value={profileData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  className="w-full bg-gray-700 border-b-2 border-gray-500 focus:border-blue-400 outline-none py-2 text-white rounded-lg px-3 transition-colors duration-200"
                >
                  <option value="weekends">weekends</option>
                  <option value="weekdays">weekdays</option>
                  <option value="evenings">evenings</option>
                  <option value="anytime">anytime</option>
                </select>
              </div>

              {/* Profile Visibility */}
              <div>
                <label className="block text-lg mb-2">Profile</label>
                <select
                  value={profileData.profile}
                  onChange={(e) => handleInputChange('profile', e.target.value)}
                  className="w-full bg-gray-700 border-b-2 border-gray-500 focus:border-blue-400 outline-none py-2 text-white rounded-lg px-3 transition-colors duration-200"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Friends Only">Friends Only</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-500 hover:border-gray-400 transition-colors duration-200 group cursor-pointer">
                    <div className="text-center">
                      <Camera size={24} className="mx-auto mb-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                        Profile Photo
                      </div>
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center text-white transition-colors duration-200 shadow-lg">
                    <Plus size={16} />
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-red-400">
                    Add/Edit Remove
                  </div>
                </div>
              </div>

              {/* Skills Wanted */}
              <div className="mt-16">
                <label className="block text-lg mb-4">Skills wanted</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skillsWanted.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 group"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill('wanted', index)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {showAddSkill.wanted ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkill.wanted}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, wanted: e.target.value }))}
                        className="bg-gray-700 px-3 py-1 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Add skill"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('wanted')}
                        autoFocus
                      />
                      <button
                        onClick={() => addSkill('wanted')}
                        className="text-green-400 hover:text-green-300 transition-colors duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddSkill(prev => ({ ...prev, wanted: true }))}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                    >
                      <Plus size={14} />
                      Add Skill
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}