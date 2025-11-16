// pages/Players.jsx
import React, { useState, useEffect } from 'react';

const Players = () => {
  const API_BASE = "http://localhost:3001";
  const [users, setUsers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rank');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(8);
  const [leagueFilter, setLeagueFilter] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, fixturesResponse, leaguesResponse] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/fixtures`),
        fetch(`${API_BASE}/leagues`)
      ]);

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      if (!fixturesResponse.ok) throw new Error('Failed to fetch fixtures');
      if (!leaguesResponse.ok) throw new Error('Failed to fetch leagues');

      const usersData = await usersResponse.json();
      const fixturesData = await fixturesResponse.json();
      const leaguesData = await leaguesResponse.json();

      setUsers(usersData);
      setFixtures(fixturesData);
      setLeagues(leaguesData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Function to get initials from team name
  const getInitials = (teamName) => {
    if (!teamName) return 'TM';
    return teamName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Function to generate random color based on team name
  const getTeamColor = (teamName) => {
    const colors = [
      'bg-[#850cec]', 'bg-purple-600', 'bg-blue-600', 'bg-green-600',
      'bg-red-600', 'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600'
    ];
    const index = (teamName?.length || 0) % colors.length;
    return colors[index];
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
    if (!rank) return '#0';
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    if (!rank) return 'bg-gradient-to-r from-[#850cec] to-purple-600';
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default: return 'bg-gradient-to-r from-[#850cec] to-purple-600';
    }
  };

  // Get leagues that a user belongs to based on team name
  const getUserLeagues = (userTeamName) => {
    return leagues.filter(league => 
      league.teams && league.teams.includes(userTeamName)
    );
  };

  // Get unique leagues for filter dropdown
  const getUniqueLeagues = () => {
    return [
      { id: 'all', name: 'All Leagues' },
      ...leagues.map(league => ({
        id: league.id,
        name: league.name
      }))
    ];
  };

  // Get league color
  const getLeagueColor = (leagueId) => {
    const colorMap = {
      '1': 'from-yellow-500 to-yellow-600',
      '0103': 'from-blue-500 to-blue-600',
      '93ad': 'from-green-500 to-green-600',
      'default': 'from-[#850cec] to-purple-600'
    };
    
    return colorMap[leagueId] || colorMap.default;
  };

  // Get league icon
  const getLeagueIcon = (leagueId) => {
    const iconMap = {
      '1': '👑',
      '0103': '⚽',
      '93ad': '🏆',
      'default': '🏅'
    };
    
    return iconMap[leagueId] || iconMap.default;
  };

  // Filter and sort players
  const getFilteredAndSortedPlayers = () => {
    let filteredUsers = users.filter(user => {
      // Search filter
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // League filter
      const matchesLeague = leagueFilter === 'all' || 
        getUserLeagues(user.teamName).some(league => league.id === leagueFilter);
      
      return matchesSearch && matchesLeague;
    });

    // Sort players
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return (b.points || 0) - (a.points || 0);
        case 'name':
          return (a.teamName || '').localeCompare(b.teamName || '');
        case 'goals':
          return (b.goalsFor || 0) - (a.goalsFor || 0);
        case 'wins':
          return (b.won || 0) - (a.won || 0);
        case 'rank':
        default:
          return (a.rank || 999) - (b.rank || 999);
      }
    });

    return sortedUsers;
  };

  // Get paginated players
  const filteredPlayers = getFilteredAndSortedPlayers();
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, leagueFilter]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Calculate overall statistics
  const totalMatches = fixtures.length;
  const averageWinRate = users.length > 0 
    ? Math.round(users.reduce((acc, user) => acc + ((user.won || 0) / (user.played || 1) * 100 || 0), 0) / users.length)
    : 0;

  const uniqueLeagues = getUniqueLeagues();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850cec]"></div>
            <span className="ml-4 text-white text-lg">Loading players data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error: </strong> {error}
            <button
              onClick={fetchAllData}
              className="ml-4 px-4 py-2 bg-[#850cec] text-white rounded hover:bg-purple-700 transition duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#850cec] to-purple-500 bg-clip-text text-transparent">
              Football Players
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore players across all leagues. Track their stats, performance, and progress.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-[#850cec]">{users.length}</div>
            <div className="text-gray-400 text-sm font-semibold">Total Players</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-[#850cec]">{totalMatches}</div>
            <div className="text-gray-400 text-sm font-semibold">Total Matches</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-[#850cec]">{leagues.length}</div>
            <div className="text-gray-400 text-sm font-semibold">Leagues</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-2xl font-bold text-[#850cec]">{averageWinRate}%</div>
            <div className="text-gray-400 text-sm font-semibold">Avg Win Rate</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-700 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-[#850cec] focus:ring-2 focus:ring-[#850cec]/20 text-white placeholder-gray-400 transition duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              {/* League Filter */}
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-[#850cec] focus:ring-2 focus:ring-[#850cec]/20 text-white transition duration-300 min-w-[150px]"
              >
                {uniqueLeagues.map(league => (
                  <option key={league.id} value={league.id} className="bg-gray-700">
                    {league.name}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-[#850cec] focus:ring-2 focus:ring-[#850cec]/20 text-white transition duration-300 min-w-[150px]"
              >
                <option value="rank" className="bg-gray-700">Sort by Rank</option>
                <option value="points" className="bg-gray-700">Sort by Points</option>
                <option value="name" className="bg-gray-700">Sort by Name</option>
                <option value="goals" className="bg-gray-700">Sort by Goals</option>
                <option value="wins" className="bg-gray-700">Sort by Wins</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {leagueFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#850cec] text-white">
                League: {leagues.find(l => l.id === leagueFilter)?.name || 'Unknown'}
                <button
                  onClick={() => setLeagueFilter('all')}
                  className="ml-2 hover:text-gray-300 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-gray-300 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Showing <span className="text-[#850cec] font-semibold">
              {filteredPlayers.length === 0 ? 0 : indexOfFirstPlayer + 1}-{Math.min(indexOfLastPlayer, filteredPlayers.length)}
            </span> of{' '}
            <span className="text-purple-400 font-semibold">{filteredPlayers.length}</span> players
            {leagueFilter !== 'all' && (
              <span className="text-gray-500">
                {' '}in <span className="text-[#850cec] font-semibold">
                  {leagues.find(l => l.id === leagueFilter)?.name || 'Unknown'}
                </span>
              </span>
            )}
          </p>
          
          {totalPages > 1 && (
            <div className="text-gray-400 text-sm">
              Page <span className="text-[#850cec] font-semibold">{currentPage}</span> of{' '}
              <span className="text-purple-400 font-semibold">{totalPages}</span>
            </div>
          )}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentPlayers.map((user) => {
            const userLeagues = getUserLeagues(user.teamName);
            
            return (
              <div
                key={user.id}
                className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-[#850cec] transition duration-300 transform hover:scale-105 group"
              >
                {/* League Badges */}
                {userLeagues.length > 0 && (
                  <div className="flex justify-center mb-3 flex-wrap gap-1">
                    {userLeagues.map(league => (
                      <span 
                        key={league.id}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getLeagueColor(league.id)}`}
                      >
                        <span className="mr-1">{getLeagueIcon(league.id)}</span>
                        {league.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rank Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-4 py-2 rounded-full ${getRankColor(user.rank)} text-white font-bold text-sm shadow-lg`}>
                    {getRankBadge(user.rank)}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#850cec]">{user.points || 0}</div>
                    <div className="text-xs text-gray-400">PTS</div>
                  </div>
                </div>

                {/* Player Avatar and Name */}
                <div className="text-center mb-4">
                  <div className={`h-20 w-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:shadow-[#850cec]/25 transition duration-300 ${getTeamColor(user.teamName)}`}>
                    {getInitials(user.teamName)}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-[#850cec] transition duration-300">
                    {user.teamName || 'Unknown Team'}
                  </h3>
                  <p className="text-gray-400 text-sm">@{user.username || 'unknown'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-700 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold text-sm">{user.won || 0}</div>
                    <div className="text-gray-400 text-xs">WON</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold text-sm">{user.drawn || 0}</div>
                    <div className="text-gray-400 text-xs">DRAW</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2 text-center">
                    <div className="text-red-400 font-bold text-sm">{user.lost || 0}</div>
                    <div className="text-gray-400 text-xs">LOST</div>
                  </div>
                </div>

                {/* Goals and Win Rate */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-r from-[#850cec]/20 to-purple-500/20 rounded-lg p-3 text-center border border-[#850cec]/30">
                    <div className="text-white font-bold text-sm">{user.goalsFor || 0}:{user.goalsAgainst || 0}</div>
                    <div className="text-gray-400 text-xs">GOALS</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-[#850cec]/20 rounded-lg p-3 text-center border border-green-500/30">
                    <div className="text-white font-bold text-sm">
                      {user.played > 0 ? Math.round(((user.won || 0) / user.played) * 100) : 0}%
                    </div>
                    <div className="text-gray-400 text-xs">WIN RATE</div>
                  </div>
                </div>

                {/* Recent Form */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-semibold">Form:</span>
                  <div className="flex space-x-1">
                    {user.form && user.form.map((result, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold text-white ${getFormColor(result)}`}
                      >
                        {result}
                      </span>
                    ))}
                    {(!user.form || user.form.length === 0) && (
                      <span className="text-gray-500 text-xs">No matches</span>
                    )}
                  </div>
                </div>

                {/* Join Date */}
                <div className="text-center mt-4 pt-3 border-t border-gray-700">
                  <div className="text-gray-400 text-xs">
                    {user.joinDate ? `Joined ${new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Active Player'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-16 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-600">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Players Found</h3>
            <p className="text-gray-400 text-lg">
              {searchTerm || leagueFilter !== 'all' 
                ? `No players match your current filters` 
                : 'No players available'
              }
            </p>
            {(searchTerm || leagueFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLeagueFilter('all');
                }}
                className="mt-4 px-6 py-2 bg-[#850cec] hover:bg-purple-700 text-white rounded-lg transition duration-300"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-[#850cec] hover:text-white'
              }`}
            >
              ← Prev
            </button>

            {getPageNumbers().map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                  currentPage === number
                    ? 'bg-[#850cec] text-white shadow-lg shadow-[#850cec]/30'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-[#850cec] hover:text-white'
              }`}
            >
              Next →
            </button>
          </div>
        )}

        {/* Quick Page Navigation */}
        {totalPages > 5 && (
          <div className="flex justify-center items-center space-x-4 mt-4">
            <span className="text-gray-400 text-sm">Go to page:</span>
            <select
              value={currentPage}
              onChange={(e) => paginate(Number(e.target.value))}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#850cec]"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page} className="bg-gray-700">
                  {page}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;