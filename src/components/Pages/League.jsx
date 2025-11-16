// pages/League.jsx
import React, { useState, useEffect } from 'react';

const League = () => {
  const API_BASE = "http://localhost:3001";
  const [users, setUsers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [activeTab, setActiveTab] = useState('table');
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playoffBrackets, setPlayoffBrackets] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(10);

  useEffect(() => {
    fetchLeagueData();
  }, []);

  const fetchLeagueData = async () => {
    try {
      const [usersRes, fixturesRes, leaguesRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/fixtures`),
        fetch(`${API_BASE}/leagues`)
      ]);

      if (!usersRes.ok || !fixturesRes.ok || !leaguesRes.ok) {
        throw new Error('Failed to fetch league data');
      }

      const [usersData, fixturesData, leaguesData] = await Promise.all([
        usersRes.json(),
        fixturesRes.json(),
        leaguesRes.json()
      ]);

      setUsers(usersData);
      setFixtures(fixturesData);
      setLeagues(leaguesData);
      
      // Set first league as default selected
      if (leaguesData.length > 0) {
        setSelectedLeague(leaguesData[0]);
      }
      
      // Generate playoff brackets for all leagues
      generatePlayoffBrackets(leaguesData, usersData);
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

  const generatePlayoffBrackets = (leaguesData, usersData) => {
    const brackets = {};
    
    leaguesData.forEach(league => {
      // Get teams for this league and sort by points
      const leagueTeams = usersData.filter(user => 
        league.teams && league.teams.includes(user.teamName)
      ).sort((a, b) => b.points - a.points);

      // Create playoff bracket with top 4 teams
      const playoffTeams = leagueTeams.slice(0, 4);
      
      if (playoffTeams.length >= 2) {
        const bracket = {
          semifinals: [
            {
              id: 1,
              homeTeam: playoffTeams[0],
              awayTeam: playoffTeams[3] || playoffTeams[1],
              homeScore: Math.floor(Math.random() * 4),
              awayScore: Math.floor(Math.random() * 3),
              status: 'completed',
              round: 'Semifinal 1'
            }
          ],
          final: {
            id: 3,
            homeTeam: null,
            awayTeam: null,
            homeScore: null,
            awayScore: null,
            status: 'scheduled',
            round: 'Grand Final'
          },
          champion: null
        };

        // Add second semifinal if enough teams
        if (playoffTeams.length >= 4) {
          bracket.semifinals.push({
            id: 2,
            homeTeam: playoffTeams[1],
            awayTeam: playoffTeams[2],
            homeScore: Math.floor(Math.random() * 4),
            awayScore: Math.floor(Math.random() * 3),
            status: 'completed',
            round: 'Semifinal 2'
          });
        }

        // Determine finalists
        const finalist1 = bracket.semifinals[0].homeScore > bracket.semifinals[0].awayScore ? 
          playoffTeams[0] : (playoffTeams[3] || playoffTeams[1]);
        const finalist2 = bracket.semifinals[1] ? 
          (bracket.semifinals[1].homeScore > bracket.semifinals[1].awayScore ? playoffTeams[1] : playoffTeams[2])
          : playoffTeams[1];

        bracket.final.homeTeam = finalist1;
        bracket.final.awayTeam = finalist2;
        bracket.final.homeScore = Math.floor(Math.random() * 4);
        bracket.final.awayScore = Math.floor(Math.random() * 3);
        bracket.final.status = 'completed';
        
        // Determine champion
        bracket.champion = bracket.final.homeScore > bracket.final.awayScore ? finalist1 : finalist2;

        brackets[league.id] = bracket;
      }
    });

    setPlayoffBrackets(brackets);
  };

  const getFormColor = (result) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get teams for selected league
  const getLeagueTeams = () => {
    if (!selectedLeague || !selectedLeague.teams) return [];
    
    return users
      .filter(user => selectedLeague.teams.includes(user.teamName))
      .sort((a, b) => b.points - a.points);
  };

  // Get fixtures for selected league
  const getLeagueFixtures = () => {
    if (!selectedLeague) return [];
    
    return fixtures.filter(fixture => 
      fixture.leagueId === selectedLeague.id || 
      (selectedLeague.teams && 
       selectedLeague.teams.includes(fixture.homeTeam) && 
       selectedLeague.teams.includes(fixture.awayTeam))
    );
  };

  // Pagination logic
  const leagueTeams = getLeagueTeams();
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = leagueTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(leagueTeams.length / teamsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when league changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLeague]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850cec]"></div>
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
          </div>
        </div>
      </div>
    );
  }

  const currentFixtures = getLeagueFixtures();
  const currentPlayoffBracket = selectedLeague ? playoffBrackets[selectedLeague.id] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {selectedLeague ? selectedLeague.name : 'Leagues'}
          </h1>
          <p className="text-xl text-gray-300">
            {selectedLeague ? selectedLeague.description : 'Select a league to view details'}
          </p>
          <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-400">
            <span>{selectedLeague?.teams?.length || 0} Teams</span>
            <span className="w-2 h-2 bg-[#850cec] rounded-full"></span>
            <span className="text-[#850cec]">● ACTIVE</span>
          </div>
        </div>

        {/* League Selector */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {leagues.map(league => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              className={`px-6 py-3 rounded-xl font-medium transition duration-300 ${
                selectedLeague?.id === league.id
                  ? 'bg-[#850cec] text-white shadow-lg shadow-[#850cec]/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>

        {selectedLeague && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-8">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-6 py-3 font-medium text-lg transition duration-300 ${
                  activeTab === 'table'
                    ? 'text-[#850cec] border-b-2 border-[#850cec]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏆 League Table
              </button>
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`px-6 py-3 font-medium text-lg transition duration-300 ${
                  activeTab === 'fixtures'
                    ? 'text-[#850cec] border-b-2 border-[#850cec]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📅 Fixtures & Results
              </button>
              <button
                onClick={() => setActiveTab('playoffs')}
                className={`px-6 py-3 font-medium text-lg transition duration-300 ${
                  activeTab === 'playoffs'
                    ? 'text-[#850cec] border-b-2 border-[#850cec]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏅 Playoffs
              </button>
            </div>

            {/* League Table */}
            {activeTab === 'table' && (
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Pos</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Player & Team</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">P</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">W</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">D</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">L</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">GF</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">GA</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">GD</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">PTS</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {currentTeams.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-gray-750 transition duration-200 ${
                            index < 4 ? 'bg-[#850cec]/10' : index >= leagueTeams.length - 2 ? 'bg-red-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-lg font-bold ${
                                index === 0 ? 'text-yellow-400' : 
                                index === 1 ? 'text-gray-300' : 
                                index === 2 ? 'text-orange-400' : 
                                'text-gray-400'
                              }`}>
                                {index + 1}
                              </span>
                              {index < 3 && (
                                <span className="ml-2 text-xs text-[#850cec]">🏆</span>
                              )}
                              {index < 4 && (
                                <span className="ml-1 text-xs text-green-400">✓</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(user.teamName)}`}>
                                {getInitials(user.teamName)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{user.teamName}</div>
                                <div className="text-sm text-gray-400">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {user.played}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-green-400 font-semibold">
                            {user.won}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-yellow-400 font-semibold">
                            {user.drawn}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-red-400 font-semibold">
                            {user.lost}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {user.goalsFor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {user.goalsAgainst}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {user.goalDifference > 0 ? '+' : ''}{user.goalDifference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="bg-gradient-to-r from-[#850cec] to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              {user.points}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-1">
                              {user.form && user.form.map((result, i) => (
                                <span
                                  key={i}
                                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${getFormColor(result)}`}
                                >
                                  {result}
                                </span>
                              ))}
                              {(!user.form || user.form.length === 0) && (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-sm">
                        Showing <span className="text-[#850cec] font-semibold">
                          {leagueTeams.length === 0 ? 0 : indexOfFirstTeam + 1}-{Math.min(indexOfLastTeam, leagueTeams.length)}
                        </span> of{' '}
                        <span className="text-purple-400 font-semibold">{leagueTeams.length}</span> teams
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded text-sm font-semibold transition duration-300 ${
                            currentPage === 1
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-700 text-white hover:bg-[#850cec]'
                          }`}
                        >
                          ←
                        </button>

                        {getPageNumbers().map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition duration-300 ${
                              currentPage === number
                                ? 'bg-[#850cec] text-white'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                          >
                            {number}
                          </button>
                        ))}

                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded text-sm font-semibold transition duration-300 ${
                            currentPage === totalPages
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-700 text-white hover:bg-[#850cec]'
                          }`}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Legend */}
                <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
                  <div className="flex flex-wrap gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#850cec]/10 border border-[#850cec]"></div>
                      <span>Playoff Qualification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-900/20 border border-red-500"></div>
                      <span>Relegation Zone</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fixtures & Results */}
            {activeTab === 'fixtures' && (
              <div className="space-y-6">
                {/* Current Round */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Upcoming Matches</h3>
                  <div className="grid gap-4">
                    {currentFixtures
                      .filter(f => f.status === 'scheduled')
                      .map(fixture => (
                        <div key={fixture.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#850cec] transition duration-300">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-3">
                                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getTeamColor(fixture.homeTeam)}`}>
                                    {getInitials(fixture.homeTeam)}
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-white">{fixture.homeTeam}</div>
                                    <div className="text-sm text-gray-400">Home</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-center mx-4">
                                <div className="text-2xl font-bold text-gray-300">VS</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {new Date(fixture.date).toLocaleDateString()} {fixture.time}
                                </div>
                                <div className="text-xs text-gray-500">{fixture.venue}</div>
                              </div>
                              
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-3">
                                  <div>
                                    <div className="text-lg font-bold text-white">{fixture.awayTeam}</div>
                                    <div className="text-sm text-gray-400">Away</div>
                                  </div>
                                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getTeamColor(fixture.awayTeam)}`}>
                                    {getInitials(fixture.awayTeam)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(fixture.status)}`}>
                              {fixture.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Results */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
                  <div className="grid gap-4">
                    {currentFixtures
                      .filter(f => f.status === 'completed')
                      .slice(0, 5)
                      .map(fixture => (
                        <div key={fixture.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-6 flex-1">
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-3">
                                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getTeamColor(fixture.homeTeam)}`}>
                                    {getInitials(fixture.homeTeam)}
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-white">{fixture.homeTeam}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-center mx-4">
                                <div className="text-2xl font-bold text-white">
                                  {fixture.homeScore} - {fixture.awayScore}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Round {fixture.round} • {new Date(fixture.date).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-3">
                                  <div>
                                    <div className="text-lg font-bold text-white">{fixture.awayTeam}</div>
                                  </div>
                                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getTeamColor(fixture.awayTeam)}`}>
                                    {getInitials(fixture.awayTeam)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(fixture.status)}`}>
                              COMPLETED
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Playoffs Section */}
            {activeTab === 'playoffs' && currentPlayoffBracket && (
              <div className="space-y-8">
                {/* Champion Card */}
                <div className="bg-gradient-to-r from-[#850cec] to-purple-600 rounded-xl p-8 text-center border border-[#850cec] shadow-2xl">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl mr-4">🏆</span>
                    <h2 className="text-3xl font-bold text-white">League Champion</h2>
                  </div>
                  {currentPlayoffBracket.champion && (
                    <div className="flex items-center justify-center">
                      <div className={`h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getTeamColor(currentPlayoffBracket.champion.teamName)}`}>
                        {getInitials(currentPlayoffBracket.champion.teamName)}
                      </div>
                      <div className="ml-6 text-left">
                        <h3 className="text-2xl font-bold text-white">{currentPlayoffBracket.champion.teamName}</h3>
                        <p className="text-purple-200 text-lg">@{currentPlayoffBracket.champion.username}</p>
                        <p className="text-yellow-300 font-semibold mt-2">Season Champion</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Playoff Bracket Map */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Playoff Bracket Map</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Semifinals */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-[#850cec] text-center">Semifinals</h4>
                      {currentPlayoffBracket.semifinals.map((match) => (
                        <div key={match.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                          <div className="text-center mb-3">
                            <span className="bg-[#850cec] text-white px-2 py-1 rounded text-xs font-bold">
                              {match.round}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getTeamColor(match.homeTeam.teamName)}`}>
                                  {getInitials(match.homeTeam.teamName)}
                                </div>
                                <span className="text-white text-sm">{match.homeTeam.teamName}</span>
                              </div>
                              <span className="text-white font-bold">{match.homeScore}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getTeamColor(match.awayTeam.teamName)}`}>
                                  {getInitials(match.awayTeam.teamName)}
                                </div>
                                <span className="text-white text-sm">{match.awayTeam.teamName}</span>
                              </div>
                              <span className="text-white font-bold">{match.awayScore}</span>
                            </div>
                          </div>
                          <div className="text-center mt-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              match.homeScore > match.awayScore ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {match.homeScore > match.awayScore ? 'Advances' : 'Advances'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Final */}
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold mb-4">
                          Grand Final
                        </div>
                        <div className="bg-gray-700 rounded-lg p-6 border-2 border-yellow-400">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(currentPlayoffBracket.final.homeTeam.teamName)}`}>
                                  {getInitials(currentPlayoffBracket.final.homeTeam.teamName)}
                                </div>
                                <span className="text-white">{currentPlayoffBracket.final.homeTeam.teamName}</span>
                              </div>
                              <span className="text-white font-bold text-xl">{currentPlayoffBracket.final.homeScore}</span>
                            </div>
                            <div className="text-center text-gray-300">VS</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(currentPlayoffBracket.final.awayTeam.teamName)}`}>
                                  {getInitials(currentPlayoffBracket.final.awayTeam.teamName)}
                                </div>
                                <span className="text-white">{currentPlayoffBracket.final.awayTeam.teamName}</span>
                              </div>
                              <span className="text-white font-bold text-xl">{currentPlayoffBracket.final.awayScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Champion */}
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                          Champion
                        </div>
                        <div className="bg-gray-700 rounded-lg p-6 border-2 border-green-400">
                          <div className="flex flex-col items-center">
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 ${getTeamColor(currentPlayoffBracket.champion.teamName)}`}>
                              {getInitials(currentPlayoffBracket.champion.teamName)}
                            </div>
                            <h4 className="text-white font-bold text-lg">{currentPlayoffBracket.champion.teamName}</h4>
                            <p className="text-gray-300 text-sm">@{currentPlayoffBracket.champion.username}</p>
                            <span className="bg-gradient-to-r from-[#850cec] to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold mt-2">
                              CHAMPION
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playoff Teams */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-4">Playoff Teams</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {leagueTeams.slice(0, 4).map((team, index) => (
                      <div key={team.id} className="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition duration-300">
                        <div className="flex items-center justify-center mb-2">
                          <span className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-400' : 
                            index === 1 ? 'text-gray-300' : 
                            index === 2 ? 'text-orange-400' : 
                            'text-gray-400'
                          }`}>
                            #{index + 1} Seed
                          </span>
                        </div>
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 ${getTeamColor(team.teamName)}`}>
                          {getInitials(team.teamName)}
                        </div>
                        <h4 className="font-bold text-white">{team.teamName}</h4>
                        <p className="text-sm text-gray-400">@{team.username}</p>
                        <p className="text-[#850cec] font-semibold mt-1">{team.points} PTS</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedLeague && (
          <div className="text-center py-16 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-600">
            <div className="text-8xl mb-6">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">Select a League</h3>
            <p className="text-gray-400 text-lg">
              Choose a league from above to view its table, fixtures, and playoff information
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default League;