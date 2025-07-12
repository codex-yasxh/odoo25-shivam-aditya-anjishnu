import React, { useState } from 'react';
import { User } from 'lucide-react';

export default function SkillSwapPlatform({ onRequestClick }) {
  const skillsOffered = ['JavaScript', 'React', 'Node.js'];
  const skillsWanted = ['Python', 'Machine Learning', 'Data Science'];

  const handleRequestClick = () => {
    if (onRequestClick) {
      onRequestClick({
        userSkillsOffered: skillsOffered,
        userSkillsWanted: skillsWanted,
        userName: 'Marc Demo'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Screen 4 Title */}
        <h1 className="text-white text-lg font-normal mb-8 text-left">Screen 4</h1>
        
        {/* Main Container */}
        <div className="border border-white rounded-2xl p-8 bg-black">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-white text-xl font-normal">Skill Swap Platform</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <span className="text-white text-base underline underline-offset-2">Swap request</span>
              </div>
              <span className="text-white text-base">Home</span>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-12">
            {/* Left Side Content */}
            <div className="col-span-8">
              {/* Request Tab */}
              <div className="mb-8">
                <button 
                  onClick={handleRequestClick}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded text-base font-normal transition-colors cursor-pointer"
                >
                  Request
                </button>
              </div>

              {/* Profile Name */}
              <div className="mb-16">
                <h3 className="text-white text-4xl font-normal mb-4">Marc Demo</h3>
              </div>

              {/* Skills Offered */}
              <div className="mb-16">
                <h4 className="text-white text-xl font-normal mb-8">Skills Offered</h4>
                <div className="space-y-3">
                  {skillsOffered.map((skill, index) => (
                    <div key={index} className="bg-gray-800 px-4 py-3 rounded">
                      <span className="text-white">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Wanted */}
              <div className="mb-16">
                <h4 className="text-white text-xl font-normal mb-8">Skills wanted</h4>
                <div className="space-y-3">
                  {skillsWanted.map((skill, index) => (
                    <div key={index} className="bg-gray-800 px-4 py-3 rounded">
                      <span className="text-white">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating and Feedback */}
              <div className="mb-8">
                <h4 className="text-white text-xl font-normal mb-8">Rating and Feedback</h4>
                <div className="bg-gray-800 p-6 rounded">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-3 text-white">4.8 out of 5</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    "Marc is an excellent teacher and very patient. His JavaScript skills are top-notch!"
                  </p>
                  <p className="text-gray-400 text-xs">- Sarah K., 2 weeks ago</p>
                </div>
              </div>
            </div>

            {/* Right Side - Profile Photo */}
            <div className="col-span-4 flex justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-full flex items-center justify-center bg-black">
                <span className="text-white text-lg font-normal">Profile Photo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}