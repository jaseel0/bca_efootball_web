// pages/League.jsx
import React, { useState, useEffect } from 'react';

const League = () => {
  const [users, setUsers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState({});
  const [activeTab, setActiveTab] = useState('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeagueData();
  }, []);

  const fetchLeagueData = async () => {
    try {
      const [usersRes, fixturesRes, leagueRes] = await Promise.all([
        fetch('http://localhost:3001/users'),
        fetch('http://localhost:3001/fixtures'),
        fetch('http://localhost:3001/leagueInfo')
      ]);

      if (!usersRes.ok || !fixturesRes.ok || !leagueRes.ok) {
        throw new Error('Failed to fetch league data');
      }

      const [usersData, fixturesData, leagueData] = await Promise.all([
        usersRes.json(),
        fixturesRes.json(),
        leagueRes.json()
      ]);

      // Sort users by points (descending)
      const sortedUsers = usersData.sort((a, b) => b.points - a.points);
      setUsers(sortedUsers);
      setFixtures(fixturesData);
      setLeagueInfo(leagueData);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{leagueInfo.name}</h1>
          <p className="text-xl text-gray-300">{leagueInfo.season}</p>
          <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-400">
            <span>Round {leagueInfo.currentRound} of {leagueInfo.totalRounds}</span>
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-green-400">● LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-6 py-3 font-medium text-lg transition duration-300 ${
              activeTab === 'table'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏆 League Table
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-6 py-3 font-medium text-lg transition duration-300 ${
              activeTab === 'fixtures'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📅 Fixtures & Results
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
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-gray-750 transition duration-200 ${
                        index < 4 ? 'bg-green-900/20' : index >= users.length - 2 ? 'bg-red-900/20' : ''
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
                            <span className="ml-2 text-xs text-gray-400">🏆</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full bg-gray-600"
                            src={user.avatar}
                            alt={user.teamName}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/40?text=TM';
                            }}
                          />
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
                        <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {user.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-1">
                          {user.form.map((result, i) => (
                            <span
                              key={i}
                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${getFormColor(result)}`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fixtures & Results */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            {/* Current Round */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Round {leagueInfo.currentRound} - Upcoming Matches</h3>
              <div className="grid gap-4">
                {fixtures
                  .filter(f => f.status === 'scheduled')
                  .map(fixture => (
                    <div key={fixture.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-400 transition duration-300">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-center flex-1">
                            <div className="text-lg font-bold text-white">{fixture.homeTeam}</div>
                            <div className="text-sm text-gray-400">Home</div>
                          </div>
                          
                          <div className="text-center mx-4">
                            <div className="text-2xl font-bold text-gray-300">VS</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(fixture.date).toLocaleDateString()} {fixture.time}
                            </div>
                            <div className="text-xs text-gray-500">{fixture.venue}</div>
                          </div>
                          
                          <div className="text-center flex-1">
                            <div className="text-lg font-bold text-white">{fixture.awayTeam}</div>
                            <div className="text-sm text-gray-400">Away</div>
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
                {fixtures
                  .filter(f => f.status === 'completed')
                  .slice(0, 5)
                  .map(fixture => (
                    <div key={fixture.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="text-center flex-1">
                            <div className="text-lg font-bold text-white">{fixture.homeTeam}</div>
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
                            <div className="text-lg font-bold text-white">{fixture.awayTeam}</div>
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
      </div>
    </div>
  );
};

export default League;