// pages/Players.jsx
import React, { useState, useEffect } from 'react';

const Players = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rank'); // 'rank', 'points', 'name'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getFormColor = (result) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-400 to-gray-600';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  // Sort and filter players
  const sortedAndFilteredUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points;
        case 'name':
          return a.teamName.localeCompare(b.teamName);
        case 'rank':
        default:
          return a.rank - b.rank;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error: </strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Players
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Meet the competitors of the eFootball Championship. Track their progress and stats.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{users.length}</div>
            <div className="text-gray-400 text-sm font-semibold">Total Players</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">
              {users.reduce((acc, user) => acc + user.played, 0)}
            </div>
            <div className="text-gray-400 text-sm font-semibold">Matches Played</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">
              {users.reduce((acc, user) => acc + user.goalsFor, 0)}
            </div>
            <div className="text-gray-400 text-sm font-semibold">Total Goals</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(users.reduce((acc, user) => acc + user.winRate, 0) / users.length)}%
            </div>
            <div className="text-gray-400 text-sm font-semibold">Avg Win Rate</div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-700 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-white placeholder-gray-400 transition duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white transition duration-300"
              >
                <option value="rank" className="bg-gray-700">Sort by Rank</option>
                <option value="points" className="bg-gray-700">Sort by Points</option>
                <option value="name" className="bg-gray-700">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAndFilteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700 hover:border-green-500 transition duration-300 transform hover:scale-105 group"
            >
              {/* Rank Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(user.rank)} text-white font-bold text-sm shadow-lg`}>
                  {getRankBadge(user.rank)}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{user.points}</div>
                  <div className="text-xs text-gray-400">PTS</div>
                </div>
              </div>

              {/* Player Avatar and Name */}
              <div className="text-center mb-4">
                <img
                  src={user.avatar || 'https://via.placeholder.com/100?text=TM'}
                  alt={user.teamName}
                  className="w-20 h-20 rounded-2xl mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg group-hover:shadow-green-500/25 transition duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=TM';
                  }}
                />
                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-green-400 transition duration-300">
                  {user.teamName}
                </h3>
                <p className="text-gray-400 text-sm">@{user.username}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                  <div className="text-green-400 font-bold text-sm">{user.won}</div>
                  <div className="text-gray-400 text-xs">WON</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                  <div className="text-yellow-400 font-bold text-sm">{user.drawn}</div>
                  <div className="text-gray-400 text-xs">DRAW</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                  <div className="text-red-400 font-bold text-sm">{user.lost}</div>
                  <div className="text-gray-400 text-xs">LOST</div>
                </div>
              </div>

              {/* Goals and Win Rate */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 text-center border border-blue-500/30">
                  <div className="text-white font-bold text-sm">{user.goalsFor}:{user.goalsAgainst}</div>
                  <div className="text-gray-400 text-xs">GOALS</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 text-center border border-green-500/30">
                  <div className="text-white font-bold text-sm">{user.winRate}%</div>
                  <div className="text-gray-400 text-xs">WIN RATE</div>
                </div>
              </div>

              {/* Recent Form */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-semibold">Form:</span>
                <div className="flex space-x-1">
                  {user.form.map((result, i) => (
                    <span
                      key={i}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold text-white ${getFormColor(result)}`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>

              {/* Join Date */}
              <div className="text-center mt-4 pt-3 border-t border-gray-700">
                <div className="text-gray-400 text-xs">
                  Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedAndFilteredUsers.length === 0 && (
          <div className="text-center py-16 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Players Found</h3>
            <p className="text-gray-400 text-lg">
              {searchTerm ? `No players match "${searchTerm}"` : 'No players available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Showing <span className="text-green-400 font-semibold">{sortedAndFilteredUsers.length}</span> of{' '}
            <span className="text-blue-400 font-semibold">{users.length}</span> players
          </p>
        </div>
      </div>
    </div>
  );
};

export default Players;