import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import "../static/MatchResults.css";

export default function MatchResults() {
  const [completedMatches, setCompletedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      // Try public endpoint first
      let res;
      try {
        res = await api.get("/matches");
      } catch (err) {
        // Fallback to public endpoint if needed
        res = await api.get("/matches/public");
      }
      const completed = res.data.filter(m => m.status === "completed");
      setCompletedMatches(completed);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError("Failed to load match results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getTournamentGroups = () => {
    const groups = {};
    completedMatches.forEach(match => {
      const tournamentId = match.tournamentId?._id || "unknown";
      if (!groups[tournamentId]) {
        groups[tournamentId] = {
          name: match.tournamentId?.eventName || "Unknown Tournament",
          matches: []
        };
      }
      groups[tournamentId].matches.push(match);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="match-results-page">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-results-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const tournamentGroups = getTournamentGroups();

  return (
    <div className="match-results-page">
      <div className="page-header">
        <h1>🏆 Match Results</h1>
        <p>View all completed match results</p>
      </div>

      {Object.keys(tournamentGroups).length === 0 ? (
        <div className="no-results">
          <p>No completed matches yet</p>
        </div>
      ) : (
        Object.values(tournamentGroups).map(group => (
          <div key={group.name} className="tournament-results">
            <h2>{group.name}</h2>
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Winner</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {group.matches.map(match => (
                    <tr key={match._id}>
                      <td>
                        {match.teams?.[0]?.teamName || "TBD"} vs {match.teams?.[1]?.teamName || "TBD"}
                      </td>
                      <td className="winner">
                        🏆 {match.result?.winnerTeamId === match.teams?.[0]?._id 
                          ? match.teams?.[0]?.teamName 
                          : match.teams?.[1]?.teamName}
                      </td>
                      <td className="score">{match.result?.score || "—"}</td>
                      <td>{match.matchDate ? new Date(match.matchDate).toLocaleDateString() : "TBD"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}