// pages/League.jsx
import React, { useState, useEffect } from 'react';

const League = () => {
  const API_BASE = "https://football-web-bd.onrender.com";
  const [users, setUsers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [standings, setStandings] = useState([]);
  const [activeTab, setActiveTab] = useState('table');
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(10);

  useEffect(() => {
    fetchLeagueData();
  }, []);

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      const [usersRes, fixturesRes, leaguesRes, standingsRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/fixtures`),
        fetch(`${API_BASE}/leagues`),
        fetch(`${API_BASE}/standings`).catch(() => ({ ok: false })) // standings is optional
      ]);

      if (!usersRes.ok || !fixturesRes.ok || !leaguesRes.ok) {
        throw new Error('Failed to fetch league data');
      }

      const [usersData, fixturesData, leaguesData] = await Promise.all([
        usersRes.json(),
        fixturesRes.json(),
        leaguesRes.json()
      ]);

      let standingsData = [];
      if (standingsRes.ok) {
        standingsData = await standingsRes.json();
      }

      setUsers(usersData);
      setFixtures(fixturesData);
      setLeagues(leaguesData);
      setStandings(standingsData);
      
      // Set first league as default selected
      if (leaguesData.length > 0) {
        setSelectedLeague(leaguesData[0]);
      }
      
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

  // Get standings for selected league
  const getLeagueStandings = () => {
    if (!selectedLeague) return [];
    
    // If we have standings from API, use them
    if (standings.length > 0 && standings[0].leagueId) {
      const leagueStandings = standings.filter(standing => 
        standing.leagueId === selectedLeague.id
      );
      
      // Sort by points, goal difference, goals for
      return leagueStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
    } else {
      // Fallback: use users data to create standings
      const leagueTeams = users.filter(user => 
        selectedLeague.teams && selectedLeague.teams.includes(user.teamName)
      );
      
      return leagueTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
    }
  };

  // Get fixtures for selected league
  const getLeagueFixtures = () => {
    if (!selectedLeague) return [];
    
    return fixtures.filter(fixture => 
      fixture.leagueId === selectedLeague.id
    );
  };

  // Get playoff fixtures for selected league
  const getPlayoffFixtures = () => {
    if (!selectedLeague) return [];
    
    return fixtures.filter(fixture => 
      fixture.leagueId === selectedLeague.id && 
      fixture.playoffType && 
      fixture.playoffType !== ''
    );
  };

  const getFormColor = (result) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'scheduled': return '⏰';
      case 'live': return '🔴';
      default: return '⚫';
    }
  };

  // Get playoff type badge color
  const getPlayoffBadgeColor = (playoffType) => {
    switch (playoffType) {
      case 'final': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'semifinal': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'quarterfinal': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get playoff type display name
  const getPlayoffDisplayName = (playoffType) => {
    switch (playoffType) {
      case 'quarterfinal': return 'Quarter Final';
      case 'semifinal': return 'Semi Final';
      case 'final': return 'Final';
      default: return playoffType;
    }
  };

  // Generate playoff bracket from actual playoff fixtures
  const generatePlayoffBracket = () => {
    const playoffFixtures = getPlayoffFixtures();
    if (playoffFixtures.length === 0) return null;

    const bracket = {
      quarterfinals: [],
      semifinals: [],
      final: null,
      champion: null
    };

    // Organize fixtures by type
    playoffFixtures.forEach(fixture => {
      switch (fixture.playoffType) {
        case 'quarterfinal':
          bracket.quarterfinals.push(fixture);
          break;
        case 'semifinal':
          bracket.semifinals.push(fixture);
          break;
        case 'final':
          bracket.final = fixture;
          // Determine champion from final result
          if (fixture.status === 'completed' && fixture.homeScore !== null && fixture.awayScore !== null) {
            bracket.champion = fixture.homeScore > fixture.awayScore ? fixture.homeTeam : fixture.awayTeam;
          }
          break;
      }
    });

    return bracket;
  };

  // Pagination logic
  const leagueStandings = getLeagueStandings();
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = leagueStandings.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(leagueStandings.length / teamsPerPage);

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
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl">
            <strong>Error: </strong> {error}
          </div>
        </div>
      </div>
    );
  }

  const currentFixtures = getLeagueFixtures();
  const playoffBracket = generatePlayoffBracket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {selectedLeague ? selectedLeague.name : 'Leagues'}
          </h1>
          <p className="text-xl text-gray-400">
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
              className={`px-6 py-3 rounded-2xl font-semibold transition duration-300 transform hover:scale-105 ${
                selectedLeague?.id === league.id
                  ? 'bg-gradient-to-r from-[#850cec] to-purple-600 text-white shadow-lg shadow-[#850cec]/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>

        {selectedLeague && (
          <>
            {/* Tabs */}
            <div className="flex mb-8 bg-gray-800 rounded-2xl p-1 w-fit mx-auto border border-gray-700">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-8 py-4 rounded-xl font-semibold transition duration-300 ${
                  activeTab === 'table'
                    ? 'bg-[#850cec] text-white shadow-lg shadow-[#850cec]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                🏆 League Table
              </button>
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`px-8 py-4 rounded-xl font-semibold transition duration-300 ${
                  activeTab === 'fixtures'
                    ? 'bg-[#850cec] text-white shadow-lg shadow-[#850cec]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                📅 Fixtures & Results
              </button>
              <button
                onClick={() => setActiveTab('playoffs')}
                className={`px-8 py-4 rounded-xl font-semibold transition duration-300 ${
                  activeTab === 'playoffs'
                    ? 'bg-[#850cec] text-white shadow-lg shadow-[#850cec]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                🏅 Playoffs
              </button>
            </div>

            {/* League Table */}
            {activeTab === 'table' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Pos</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Player & Team</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">P</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">W</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">D</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">L</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">GF</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">GA</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">GD</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">PTS</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {currentTeams.map((team, index) => (
                        <tr 
                          key={team.id || team.teamName} 
                          className={`hover:bg-gray-750 transition duration-200 group ${
                            index < 4 ? 'bg-[#850cec]/10' : index >= leagueStandings.length - 2 ? 'bg-red-500/10' : ''
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
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getTeamColor(team.teamName)}`}>
                                {getInitials(team.teamName)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-white group-hover:text-[#850cec] transition duration-200">{team.teamName}</div>
                                <div className="text-sm text-gray-400">@{team.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {team.played || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-green-400 font-semibold">
                            {team.won || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-yellow-400 font-semibold">
                            {team.drawn || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-red-400 font-semibold">
                            {team.lost || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {team.goalsFor || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            {team.goalsAgainst || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-white font-semibold">
                            <span className={team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}>
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="bg-gradient-to-r from-[#850cec] to-purple-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#850cec]/30">
                              {team.points || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-1">
                              {team.form && team.form.slice(0, 5).map((result, i) => (
                                <span
                                  key={i}
                                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center text-white font-bold ${getFormColor(result)}`}
                                >
                                  {result}
                                </span>
                              ))}
                              {(!team.form || team.form.length === 0) && (
                                <span className="text-gray-500 text-sm">-</span>
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
                  <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700 rounded-b-2xl">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-sm">
                        Showing <span className="text-[#850cec] font-semibold">
                          {leagueStandings.length === 0 ? 0 : indexOfFirstTeam + 1}-{Math.min(indexOfLastTeam, leagueStandings.length)}
                        </span> of{' '}
                        <span className="text-purple-400 font-semibold">{leagueStandings.length}</span> teams
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                            currentPage === 1
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-700 text-white hover:bg-[#850cec]'
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
                              : 'bg-gray-700 text-white hover:bg-[#850cec]'
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Legend */}
                <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700 rounded-b-2xl">
                  <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#850cec]/20 border border-[#850cec] rounded"></div>
                      <span>Playoff Qualification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded"></div>
                      <span>Relegation Zone</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fixtures & Results */}
            {activeTab === 'fixtures' && (
              <div className="space-y-6">
                {/* Upcoming Matches */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Upcoming Matches</h3>
                  <div className="grid gap-6">
                    {currentFixtures
                      .filter(f => f.status === 'scheduled')
                      .slice(0, 5)
                      .map(fixture => (
                        <div key={fixture.id} className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-[#850cec] transition duration-300 group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(fixture.status)}`}>
                                {getStatusIcon(fixture.status)} {fixture.status.toUpperCase()}
                              </span>
                              <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                                Round {fixture.round}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-4 mb-2">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getTeamColor(fixture.homeTeam)}`}>
                                  {getInitials(fixture.homeTeam)}
                                </div>
                                <div>
                                  <div className="text-xl font-bold text-white group-hover:text-[#850cec] transition duration-200">{fixture.homeTeam}</div>
                                  <div className="text-sm text-gray-400">Home</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center mx-6">
                              <div className="text-2xl font-black text-gray-400 mb-2">VS</div>
                              <div className="text-sm text-gray-500">
                                {new Date(fixture.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">{fixture.time}</div>
                              <div className="text-xs text-gray-500 mt-1">🏟️ {fixture.venue}</div>
                            </div>
                            
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-4 mb-2">
                                <div>
                                  <div className="text-xl font-bold text-white group-hover:text-[#850cec] transition duration-200">{fixture.awayTeam}</div>
                                  <div className="text-sm text-gray-400">Away</div>
                                </div>
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getTeamColor(fixture.awayTeam)}`}>
                                  {getInitials(fixture.awayTeam)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Results */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Recent Results</h3>
                  <div className="grid gap-6">
                    {currentFixtures
                      .filter(f => f.status === 'completed')
                      .slice(0, 5)
                      .map(fixture => (
                        <div key={fixture.id} className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-green-500/50 transition duration-300 group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(fixture.status)}`}>
                                {getStatusIcon(fixture.status)} {fixture.status.toUpperCase()}
                              </span>
                              <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                                Round {fixture.round}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-4 mb-2">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getTeamColor(fixture.homeTeam)}`}>
                                  {getInitials(fixture.homeTeam)}
                                </div>
                                <div>
                                  <div className="text-xl font-bold text-white">{fixture.homeTeam}</div>
                                  <div className="text-sm text-gray-400">Home</div>
                                </div>
                              </div>
                              {fixture.status === 'completed' && (
                                <div className="text-3xl font-black text-green-400 bg-gray-700/50 py-3 rounded-xl">
                                  {fixture.homeScore}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-center mx-6">
                              <div className="text-2xl font-black text-gray-400 mb-2">VS</div>
                              <div className="text-sm text-gray-500">
                                {new Date(fixture.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">{fixture.time}</div>
                              <div className="text-xs text-gray-500 mt-1">🏟️ {fixture.venue}</div>
                            </div>
                            
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-4 mb-2">
                                <div>
                                  <div className="text-xl font-bold text-white">{fixture.awayTeam}</div>
                                  <div className="text-sm text-gray-400">Away</div>
                                </div>
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getTeamColor(fixture.awayTeam)}`}>
                                  {getInitials(fixture.awayTeam)}
                                </div>
                              </div>
                              {fixture.status === 'completed' && (
                                <div className="text-3xl font-black text-green-400 bg-gray-700/50 py-3 rounded-xl">
                                  {fixture.awayScore}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Playoffs Section */}
            {activeTab === 'playoffs' && (
              <div className="space-y-8">
                {playoffBracket ? (
                  <>
                    {/* Champion Card */}
                    {playoffBracket.champion && (
                      <div className="bg-gradient-to-r from-[#850cec] to-purple-600 rounded-2xl p-8 text-center border border-[#850cec] shadow-2xl">
                        <div className="flex items-center justify-center mb-4">
                          <span className="text-4xl mr-4">🏆</span>
                          <h2 className="text-3xl font-bold text-white">League Champion</h2>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className={`h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getTeamColor(playoffBracket.champion)}`}>
                            {getInitials(playoffBracket.champion)}
                          </div>
                          <div className="ml-6 text-left">
                            <h3 className="text-2xl font-bold text-white">{playoffBracket.champion}</h3>
                            <p className="text-purple-200 text-lg">Season Champion</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Playoff Bracket */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-2xl font-bold text-white mb-6 text-center">Playoff Bracket</h3>
                      
                      {/* Quarter Finals */}
                      {playoffBracket.quarterfinals.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-[#850cec] text-center mb-4">Quarter Finals</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {playoffBracket.quarterfinals.map((match,) => (
                              <div key={match.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-[#850cec] transition duration-300">
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPlayoffBadgeColor(match.playoffType)}`}>
                                    🏆 {getPlayoffDisplayName(match.playoffType)}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(match.status)}`}>
                                    {getStatusIcon(match.status)} {match.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(match.homeTeam)}`}>
                                        {getInitials(match.homeTeam)}
                                      </div>
                                      <span className="text-white font-semibold">{match.homeTeam}</span>
                                    </div>
                                    <span className="text-white font-bold text-xl">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(match.awayTeam)}`}>
                                        {getInitials(match.awayTeam)}
                                      </div>
                                      <span className="text-white font-semibold">{match.awayTeam}</span>
                                    </div>
                                    <span className="text-white font-bold text-xl">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                  </div>
                                </div>
                                <div className="text-center mt-3 pt-3 border-t border-gray-600">
                                  <div className="text-xs text-gray-400">
                                    {new Date(match.date).toLocaleDateString()} • {match.venue}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Semi Finals */}
                      {playoffBracket.semifinals.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-[#850cec] text-center mb-4">Semi Finals</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {playoffBracket.semifinals.map((match) => (
                              <div key={match.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-orange-500/50 transition duration-300">
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPlayoffBadgeColor(match.playoffType)}`}>
                                    🏆 {getPlayoffDisplayName(match.playoffType)}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(match.status)}`}>
                                    {getStatusIcon(match.status)} {match.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(match.homeTeam)}`}>
                                        {getInitials(match.homeTeam)}
                                      </div>
                                      <span className="text-white font-semibold">{match.homeTeam}</span>
                                    </div>
                                    <span className="text-white font-bold text-xl">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(match.awayTeam)}`}>
                                        {getInitials(match.awayTeam)}
                                      </div>
                                      <span className="text-white font-semibold">{match.awayTeam}</span>
                                    </div>
                                    <span className="text-white font-bold text-xl">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                  </div>
                                </div>
                                <div className="text-center mt-3 pt-3 border-t border-gray-600">
                                  <div className="text-xs text-gray-400">
                                    {new Date(match.date).toLocaleDateString()} • {match.venue}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Final */}
                      {playoffBracket.final && (
                        <div>
                          <h4 className="text-lg font-bold text-yellow-400 text-center mb-4">Grand Final</h4>
                          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-yellow-500/50">
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPlayoffBadgeColor(playoffBracket.final.playoffType)}`}>
                                🏆 {getPlayoffDisplayName(playoffBracket.final.playoffType)}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(playoffBracket.final.status)}`}>
                                {getStatusIcon(playoffBracket.final.status)} {playoffBracket.final.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-4 mb-3">
                                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getTeamColor(playoffBracket.final.homeTeam)}`}>
                                    {getInitials(playoffBracket.final.homeTeam)}
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-white">{playoffBracket.final.homeTeam}</div>
                                    <div className="text-sm text-gray-300">Home</div>
                                  </div>
                                </div>
                                {playoffBracket.final.status === 'completed' && (
                                  <div className="text-3xl font-black text-green-400 bg-gray-700/50 py-3 rounded-xl">
                                    {playoffBracket.final.homeScore}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center mx-6">
                                <div className="text-2xl font-black text-yellow-400 mb-2">VS</div>
                                <div className="text-sm text-gray-300">
                                  {new Date(playoffBracket.final.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-300">{playoffBracket.final.time}</div>
                                <div className="text-xs text-gray-400 mt-1">🏟️ {playoffBracket.final.venue}</div>
                              </div>
                              
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-4 mb-3">
                                  <div>
                                    <div className="text-xl font-bold text-white">{playoffBracket.final.awayTeam}</div>
                                    <div className="text-sm text-gray-300">Away</div>
                                  </div>
                                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getTeamColor(playoffBracket.final.awayTeam)}`}>
                                    {getInitials(playoffBracket.final.awayTeam)}
                                  </div>
                                </div>
                                {playoffBracket.final.status === 'completed' && (
                                  <div className="text-3xl font-black text-green-400 bg-gray-700/50 py-3 rounded-xl">
                                    {playoffBracket.final.awayScore}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-600">
                    <div className="text-8xl mb-6">🏆</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Playoff Data</h3>
                    <p className="text-gray-400 text-lg">
                      No playoff matches have been scheduled for this league yet.
                    </p>
                  </div>
                )}
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