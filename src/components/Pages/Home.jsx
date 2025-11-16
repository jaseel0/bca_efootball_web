// pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const API_BASE = "http://localhost:3001";

  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    activeLeagues: 0,
    liveMatches: 0,
  });

  const [recentMatches, setRecentMatches] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // FIXED React 19-safe effect
  // -------------------------
  useEffect(() => {
    let ignore = false;

    async function fetchHomeData() {
      try {
        const [usersRes, fixturesRes, leaguesRes] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/fixtures`),
          fetch(`${API_BASE}/leagues`),
        ]);

        const [usersData, fixturesData, leaguesData] = await Promise.all([
          usersRes.json(),
          fixturesRes.json(),
          leaguesRes.json(),
        ]);

        if (ignore) return;

        // Stats
        const completed = fixturesData.filter((f) => f.status === "completed");
        const live = fixturesData.filter((f) => f.status === "live");

        setStats({
          totalPlayers: usersData.length,
          totalMatches: completed.length,
          activeLeagues: leaguesData.length,
          liveMatches: live.length,
        });

        // Recent Matches
        setRecentMatches(completed.slice(-3).reverse());

        // Top Players
        setTopPlayers(
          [...usersData].sort((a, b) => b.points - a.points).slice(0, 3)
        );

        setLeagues(leaguesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching home data:", error);
        if (!ignore) setLoading(false);
      }
    }

    fetchHomeData();

    return () => {
      ignore = true;
    };
  }, [API_BASE]);

  // Helpers
  const getInitials = (teamName) => {
    if (!teamName) return "TM";
    return teamName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getTeamColor = (teamName) => {
    const colors = [
      "bg-[#850cec]",
      "bg-purple-600",
      "bg-blue-600",
      "bg-green-600",
      "bg-red-600",
      "bg-yellow-600",
      "bg-pink-600",
      "bg-indigo-600",
    ];
    const index = (teamName?.length || 0) % colors.length;
    return colors[index];
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 pt-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#850cec] to-purple-500 bg-clip-text text-transparent">
                eFootball
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the ultimate competitive gaming platform. Join leagues,
              compete with players worldwide, and climb the ranks to become the
              champion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/league"
                className="bg-[#850cec] hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition duration-300 transform hover:scale-105 shadow-lg shadow-[#850cec]/30"
              >
                🏆 View Leagues
              </Link>
              <Link
                to="/players"
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-2xl border-2 border-[#850cec] transition duration-300 transform hover:scale-105"
              >
                👥 Browse Players
              </Link>
            </div>
          </div>
        </div>

        {/* Background animations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#850cec] rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10 animate-bounce"></div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Players", value: stats.totalPlayers },
              { label: "Matches Played", value: stats.totalMatches },
              { label: "Active Leagues", value: stats.activeLeagues },
              { label: "Live Matches", value: stats.liveMatches },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700 hover:border-[#850cec] transform hover:scale-105 transition"
              >
                <div className="text-3xl font-bold text-[#850cec] mb-2">
                  {s.value}
                </div>
                <div className="text-gray-400 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TOP PLAYERS */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🏆 Top Players</h2>
              <Link
                to="/players"
                className="text-[#850cec] hover:text-purple-400"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {topPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-[#850cec] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-yellow-400">
                        {getRankBadge(index + 1)}
                      </span>

                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${getTeamColor(
                          player.teamName
                        )}`}
                      >
                        {getInitials(player.teamName)}
                      </div>

                      <div>
                        <h3 className="font-bold text-white">
                          {player.teamName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          @{player.username}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-[#850cec]">
                        {player.points} PTS
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.won}-{player.drawn}-{player.lost}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT MATCHES */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">⚡ Recent Matches</h2>
              <Link
                to="/league"
                className="text-[#850cec] hover:text-purple-400"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {recentMatches.length > 0 ? (
                recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-[#850cec] transition"
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getTeamColor(
                            match.homeTeam
                          )}`}
                        >
                          {getInitials(match.homeTeam)}
                        </div>
                        <span className="text-white font-medium">
                          {match.homeTeam}
                        </span>
                      </div>

                      <div className="text-center text-white font-bold">
                        {match.homeScore} - {match.awayScore}
                        <div className="text-xs text-gray-400">
                          Round {match.round}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-white font-medium">
                          {match.awayTeam}
                        </span>
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getTeamColor(
                            match.awayTeam
                          )}`}
                        >
                          {getInitials(match.awayTeam)}
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-xs text-gray-400">
                      {new Date(match.date).toLocaleDateString()} •{" "}
                      {match.venue}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No recent matches available
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LEAGUES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Featured Leagues
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join exciting tournaments and compete against top players.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.slice(0, 3).map((league) => (
              <div
                key={league.id}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-[#850cec] transform hover:scale-105 transition"
              >
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {league.name}
                  </h3>
                  <span className="bg-[#850cec] text-white px-3 py-1 rounded-full text-xs font-bold">
                    {league.status || "ACTIVE"}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                  {league.description ||
                    "Competitive tournament with top players"}
                </p>

                <div className="flex justify-between text-gray-500 text-sm">
                  <span>{league.teams?.length || 0} Teams</span>
                  <span>Max: {league.maxTeams}</span>
                </div>

                <Link
                  to="/league"
                  className="block mt-4 bg-gray-700 hover:bg-[#850cec] text-white text-center py-2 rounded-xl transition"
                >
                  View League
                </Link>
              </div>
            ))}
          </div>

          {leagues.length > 3 && (
            <div className="text-center mt-8">
              <Link
                to="/league"
                className="px-6 py-3 bg-gray-800 border-2 border-[#850cec] text-white rounded-xl hover:bg-gray-700 transition"
              >
                View All Leagues →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-gradient-to-r from-[#850cec] to-purple-600 p-12 rounded-3xl border border-[#850cec] shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Compete?
            </h2>
            <p className="text-xl text-purple-200 mb-8">
              Join thousands of players and start your journey to the top!
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/league"
                className="bg-white text-[#850cec] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition"
              >
                🎮 Start Playing
              </Link>
              <Link
                to="/players"
                className="border-2 border-white text-white hover:bg-white hover:text-[#850cec] font-bold py-4 px-8 rounded-2xl transition"
              >
                👀 Browse Players
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#850cec] to-purple-500 bg-clip-text text-transparent mb-4">
            eFootball
          </h3>
          <p className="text-gray-400 mb-6">
            The ultimate platform for competitive gaming.
          </p>

          <div className="flex justify-center space-x-6">
            <Link to="/" className="text-gray-400 hover:text-[#850cec]">
              Home
            </Link>
            <Link to="/league" className="text-gray-400 hover:text-[#850cec]">
              Leagues
            </Link>
            <Link to="/players" className="text-gray-400 hover:text-[#850cec]">
              Players
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            © 2024 eFootball. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
