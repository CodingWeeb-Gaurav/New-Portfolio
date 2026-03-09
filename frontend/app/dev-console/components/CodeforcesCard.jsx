import React from 'react';
import { FaStar, FaChartLine } from 'react-icons/fa';
import CodeforcesGraph from '../CodeforcesGraph';

const CodeforcesCard = ({ data, loading, logo, gradientColors, borderColor }) => {
  const LoadingSkeleton = () => <div className="loading-skeleton h-16 rounded-xl bg-navy-600/30"></div>;

  // Helper function to get rating color and title
  const getRatingInfo = (rating) => {
    if (!rating) return { color: '#808080', title: 'Unrated' };
    if (rating >= 3000) return { color: '#aa0000', title: 'Legendary Grandmaster' };
    if (rating >= 2600) return { color: '#ff0000', title: 'International Grandmaster' };
    if (rating >= 2400) return { color: '#ff8c00', title: 'Grandmaster' };
    if (rating >= 2300) return { color: '#ffcc00', title: 'International Master' };
    if (rating >= 2100) return { color: '#ff0000', title: 'Master' };
    if (rating >= 1900) return { color: '#a0a', title: 'Candidate Master' };
    if (rating >= 1600) return { color: '#00f', title: 'Expert' };
    if (rating >= 1400) return { color: '#03a89e', title: 'Specialist' };
    if (rating >= 1200) return { color: '#008000', title: 'Pupil' };
    return { color: '#808080', title: 'Newbie' };
  };

  const maxRatingInfo = getRatingInfo(data?.maxRating);
  const currentRatingInfo = getRatingInfo(data?.rating);

  return (
    <div
      className="platform-banner rounded-2xl p-6 hover:scale-105 transition-all duration-500 group border-2"
      style={{
        background: 'linear-gradient(135deg, rgba(55,0,60,0.4), rgba(30,0,50,0.3))',
        backdropFilter: 'blur(10px)',
        borderColor: borderColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold" style={{ 
          background: 'linear-gradient(to right, #FFCC00, #0081FF, #FF0000)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '100% auto',
          animation: 'gradient 3s linear infinite'
        }}>
          Codeforces
        </h2>
        {!loading && data?.maxRating && (
          <div 
            className="text-md px-3 py-1 rounded-full font-semibold"
            style={{ 
              backgroundColor: maxRatingInfo.color,
              color: maxRatingInfo.color === '#ffcc00' ? '#000' : '#fff' // Black text for yellow background
            }}
          >
            {maxRatingInfo.title.toUpperCase()}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Avatar + Username */}
          <div className="flex items-center space-x-4">
            <a href={data.profile} target="_blank" rel="noreferrer" className="group">
              <img
                src={data.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-white object-cover group-hover:border-yellow-400 transition-all duration-300 cursor-pointer"
                style={{ borderColor: currentRatingInfo.color }}
              />
            </a>
            <div>
              <a href={data.profile} target="_blank" rel="noreferrer" className="flex items-center group">
                <h3 
                  className="text-2xl font-bold group-hover:text-yellow-400 transition-all duration-300 cursor-pointer"
                  style={{ color: currentRatingInfo.color }}
                >
                  {data.username} <span className="text-xl ml-2 opacity-70 group-hover:opacity-100">🔗</span>
                </h3>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-navy-600/40 rounded-xl">
              <div className="flex items-center">
                <FaStar className="mr-2" style={{ color: currentRatingInfo.color }} />
                <span className="text-gray-300">Contest Rating</span>
              </div>
              <span className="font-bold" style={{ color: currentRatingInfo.color }}>
                {data.rating}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-navy-600/40 rounded-xl">
              <div className="flex items-center">
                <FaChartLine className="mr-2" style={{ color: maxRatingInfo.color }} />
                <span className="text-gray-300">Max Rating</span>
              </div>
              <span className="font-bold" style={{ color: maxRatingInfo.color }}>
                {data.maxRating}
              </span>
            </div>
          </div>

          {/* Graph */}
          <div className="mt-4 p-4 bg-navy-600/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-3">Rating Progress</div>
            <CodeforcesGraph data={data.ratingHistory} />
          </div>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-400">Failed to load Codeforces stats</p>
        </div>
      )}
    </div>
  );
};

export default CodeforcesCard;