// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState({});
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Declare fetchHomeData BEFORE using it
  // ------------------------------
  const fetchHomeData = async () => {
    try {
      const [usersRes, fixturesRes, leagueRes, newsRes] = await Promise.all([
        fetch('http://localhost:3001/users'),
        fetch('http://localhost:3001/fixtures'),
        fetch('http://localhost:3001/leagueInfo'),
        fetch('http://localhost:3001/news')
      ]);

      const usersData = await usersRes.json();
      const fixturesData = await fixturesRes.json();
      const leagueData = await leagueRes.json();
      const newsData = await newsRes.json();

      // Sort users by points and take top 5
      const topUsers = usersData.sort((a, b) => b.points - a.points).slice(0, 5);

      // Get upcoming matches (next 3)
      const upcomingMatches = fixturesData
        .filter(f => f.status === 'scheduled')
        .slice(0, 3);

      setUsers(topUsers);
      setFixtures(upcomingMatches);
      setLeagueInfo(leagueData);
      setNews(newsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      setLoading(false);
    }
  };

  // ------------------------------
  // Use effect correctly with async function
  // ------------------------------
  useEffect(() => {
    const loadData = async () => {
      await fetchHomeData();
    };

    loadData();
  }, []);

  const getFormColor = (result) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeUntilMatch = (matchDate, matchTime) => {
    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    const now = new Date();
    const diffMs = matchDateTime - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Today';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                eFootball
              </span>
              <br />
              <span className="text-3xl md:text-5xl text-gray-300">Championship 2024</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate competitive eFootball experience. Join the battle, prove your skills, and become a legend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/league"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition duration-300 transform hover:scale-105 shadow-2xl"
              >
                🏆 View League Table
              </Link>
              <Link
                to="/players"
                className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white font-bold py-4 px-8 rounded-2xl text-lg transition duration-300 transform hover:scale-105"
              >
                👥 See All Players
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700 hover:border-green-400 transition duration-300">
            <div className="text-3xl font-bold text-green-400 mb-2">{leagueInfo.totalPlayers || 8}</div>
            <div className="text-gray-400 font-semibold">Active Players</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700 hover:border-blue-400 transition duration-300">
            <div className="text-3xl font-bold text-blue-400 mb-2">{leagueInfo.totalMatches || 152}</div>
            <div className="text-gray-400 font-semibold">Total Matches</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700 hover:border-purple-400 transition duration-300">
            <div className="text-3xl font-bold text-purple-400 mb-2">{leagueInfo.currentRound || 25}</div>
            <div className="text-gray-400 font-semibold">Current Round</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700 hover:border-yellow-400 transition duration-300">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{leagueInfo.prizePool || '$50,000'}</div>
            <div className="text-gray-400 font-semibold">Prize Pool</div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Matches */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                Upcoming Matches
              </h2>
              <Link
                to="/league"
                className="text-green-400 hover:text-green-300 font-semibold text-sm transition duration-300"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-6">
              {fixtures.map((match) => (
                <div
                  key={match.id}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 hover:border-green-500 transition duration-300 group"
                >
                  {match.featured && (
                    <div className="flex justify-center mb-4">
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                        ⭐ FEATURED MATCH
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center flex-1">
                      <div className="font-bold text-white text-lg mb-2">{match.homeTeam}</div>
                      <div className="text-green-400 text-sm font-semibold">Home</div>
                    </div>
                    
                    <div className="text-center mx-4">
                      <div className="text-2xl font-black text-gray-400 mb-2">VS</div>
                      <div className="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full">
                        {getTimeUntilMatch(match.date, match.time)}
                      </div>
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="font-bold text-white text-lg mb-2">{match.awayTeam}</div>
                      <div className="text-blue-400 text-sm font-semibold">Away</div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-400 bg-gray-700/50 py-2 rounded-lg">
                    <div className="font-semibold">Round {match.round}</div>
                    <div>
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {match.time}
                    </div>
                    <div className="text-green-400">🏟️ {match.venue}</div>
                  </div>
                </div>
              ))}
              
              {fixtures.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-dashed border-gray-600">
                  <div className="text-6xl mb-4">⚽</div>
                  <h4 className="text-xl font-bold text-gray-400 mb-2">No Upcoming Matches</h4>
                  <p className="text-gray-500">Check back later for new fixtures.</p>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard & News */}
          <div className="space-y-8">
            {/* Top Players Leaderboard */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <span className="text-yellow-400 mr-3">🏆</span>
                  Top Players
                </h2>
                <Link
                  to="/league"
                  className="text-green-400 hover:text-green-300 font-semibold text-sm transition duration-300"
                >
                  Full Table →
                </Link>
              </div>

              <div className="space-y-4">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 border-2 border-gray-700 hover:border-yellow-400 transition duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' :
                            'bg-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <img
                          src={user.avatar || 'https://via.placeholder.com/40?text=TM'}
                          alt={user.teamName}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40?text=TM';
                          }}
                        />
                        <div>
                          <div className="font-bold text-white text-lg">{user.teamName}</div>
                          <div className="text-gray-400 text-sm">@{user.username}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{user.points}</div>
                        <div className="text-xs text-gray-400">PTS</div>
                      </div>
                    </div>
                    
                    {/* Mini Stats */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
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
                      <div className="text-sm text-gray-400">
                        {user.won}W {user.drawn}D {user.lost}L
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-3xl font-bold text-white flex items-center mb-8">
                <span className="text-blue-400 mr-3">📢</span>
                Latest News
              </h2>

              <div className="space-y-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 border-2 border-gray-700 hover:border-blue-400 transition duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-xl object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=NEWS';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                            {item.category}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1 group-hover:text-blue-300 transition duration-300">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl p-12 text-center border border-green-400/30">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Compete?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the eFootball championship and test your skills against the best players worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/league"
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl text-lg transition duration-300 transform hover:scale-105 shadow-2xl"
            >
              🎮 View Competition
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-2xl text-lg transition duration-300 transform hover:scale-105">
              ⚡ Join Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
