import React from 'react';

const LeetcodeCard = ({ data }) => {
  if (!data) return null;

  const totalPossible = 3000; // rough estimate of total leetcode questions for progress ring
  const percentage = data.totalSolved ? (data.totalSolved / totalPossible) * 100 : 0;

  return (
    <div
      className="platform-banner rounded-2xl p-8 md:p-10 hover:scale-[1.02] transition-all duration-500 group border border-yellow-900/30"
      style={{
        background: 'linear-gradient(135deg, rgba(60,40,10,0.6), rgba(20,15,5,0.8))',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#FFA116' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="w-8 h-8 filter invert" style={{ filter: 'brightness(0) sepia(1) hue-rotate(15deg) saturate(5) opacity(0.9)' }} />
          LeetCode
        </h2>
        <a href={`https://leetcode.com/${data.username}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
          <h3 className="text-xl font-bold">@{data.username}</h3>
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Circle Progress */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle 
              cx="50" cy="50" r="45" fill="none" stroke="#FFA116" strokeWidth="6" 
              strokeDasharray={`${Math.min(percentage * 2.8, 280)} 280`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white leading-none">{data.totalSolved || 0}</span>
            <span className="text-xs text-gray-400 mt-1">Solved</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">Easy</span>
            <span className="text-white font-bold">{data.easySolved || 0}</span>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <span className="text-yellow-400 font-semibold">Medium</span>
            <span className="text-white font-bold">{data.mediumSolved || 0}</span>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <span className="text-red-400 font-semibold">Hard</span>
            <span className="text-white font-bold">{data.hardSolved || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetcodeCard;
