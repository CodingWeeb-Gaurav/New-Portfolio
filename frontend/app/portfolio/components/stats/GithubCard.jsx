import React from 'react';
import { FaGithub, FaCodeBranch, FaBook } from 'react-icons/fa';

const GithubCard = ({ data }) => {
  if (!data) return null;

  return (
    <div
      className="platform-banner rounded-2xl p-8 md:p-10 hover:scale-[1.02] transition-all duration-500 group border border-gray-700/50"
      style={{
        background: 'linear-gradient(135deg, rgba(30,30,30,0.6), rgba(15,15,15,0.8))',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
          <FaGithub className="text-4xl" /> GitHub
        </h2>
        <div className="text-sm px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
          Last 30 Days: {data.total_commits_last_30_days} Commits
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col: User Profile */}
        <div className="flex items-center gap-5 min-w-[250px]">
          <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer">
            <img
              src={data.avatar_url}
              alt="GitHub Avatar"
              className="w-24 h-24 rounded-full border-4 border-gray-700 object-cover group-hover:border-blue-500 transition-all duration-300"
            />
          </a>
          <div>
            <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer" className="group-hover:text-blue-400 transition-colors">
              <h3 className="text-2xl font-bold text-white">{data.username}</h3>
            </a>
            <div className="flex items-center gap-2 text-gray-400 mt-2">
              <FaBook /> {data.public_repos?.length || 0} Public Repos
            </div>
          </div>
        </div>

        {/* Right Col: Top Languages */}
        <div className="flex-1 bg-black/30 rounded-xl p-4 border border-white/5">
          <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-semibold">Top Languages</h4>
          <div className="flex flex-wrap gap-2">
            {data.top_languages && Object.entries(data.top_languages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([lang]) => (
                <span key={lang} className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-md border border-gray-700">
                  {lang}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GithubCard;
