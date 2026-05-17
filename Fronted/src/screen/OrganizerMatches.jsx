import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "../static/OrganizerMatches.css";

export default function OrganizerMatches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTournaments, setMyTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    matchDate: "",
    matchTime: "",
    venueId: ""
  });

  useEffect(() => {
    if (!user || user.role !== "organizer") {
      navigate("/");
      return;
    }
    fetchMyTournaments();
    fetchVenues();
  }, [user]);

  const fetchMyTournaments = async () => {
    try {
      const res = await api.get("/tournaments/my-tournaments");
      setMyTournaments(res.data);
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await api.get("/venues");
      setVenues(res.data);
    } catch (err) {
      console.error("Failed to fetch venues:", err);
    }
  };

  const fetchTournamentTeams = async (tournamentId) => {
    try {
      const res = await api.get(`/teams/tournament/${tournamentId}`);
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const fetchMatches = async (tournamentId) => {
    try {
      const res = await api.get(`/matches/tournament/${tournamentId}`);
      setMatches(res.data);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    }
  };

  const handleTournamentSelect = (tournament) => {
    setSelectedTournament(tournament);
    fetchTournamentTeams(tournament._id);
    fetchMatches(tournament._id);
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (formData.teamA === formData.teamB) {
      alert("Please select different teams");
      return;
    }

    const matchDate = new Date(`${formData.matchDate}T${formData.matchTime}`);
    
    try {
      await api.post("/matches", {
        tournamentId: selectedTournament._id,
        teams: [formData.teamA, formData.teamB],
        matchDate,
        venueId: formData.venueId
      });
      alert("✅ Match created successfully!");
      setShowCreateForm(false);
      fetchMatches(selectedTournament._id);
      setFormData({ teamA: "", teamB: "", matchDate: "", matchTime: "", venueId: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create match");
    }
  };

  const updateMatchResult = async (matchId, winnerTeamId, score) => {
    try {
      await api.put(`/matches/${matchId}/result`, {
        winnerTeamId,
        score,
        status: "completed"
      });
      alert("✅ Match result updated!");
      fetchMatches(selectedTournament._id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update result");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "scheduled": return <span className="badge scheduled">📅 Scheduled</span>;
      case "live": return <span className="badge live">🔴 LIVE</span>;
      case "completed": return <span className="badge completed">✅ Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!selectedTournament) {
    return (
      <div className="organizer-matches-page">
        <div className="page-header">
          <h1>⚽ Match Management</h1>
          <p>Create and manage matches for your tournaments</p>
        </div>
        <div className="tournament-selection">
          <h2>Select Tournament</h2>
          {myTournaments.length === 0 ? (
            <div className="no-tournaments">
              <p>You haven't created any tournaments yet.</p>
              <button onClick={() => navigate("/create-tournament")} className="create-tournament-btn">
                + Create Tournament
              </button>
            </div>
          ) : (
            <div className="tournaments-grid">
              {myTournaments.map(t => (
                <div key={t._id} className="tournament-card" onClick={() => handleTournamentSelect(t)}>
                  <h3>{t.eventName}</h3>
                  <p>Sport: {t.sportId?.name}</p>
                  <p>Status: {t.status}</p>
                  <p>Teams: {t.teams?.length || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="organizer-matches-page">
      <div className="tournament-header">
        <button className="back-btn" onClick={() => setSelectedTournament(null)}>← Back</button>
        <div>
          <h2>{selectedTournament.eventName}</h2>
          <p>{selectedTournament.sportId?.name} Tournament</p>
        </div>
        <button className="create-match-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "+ Create Match"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-match-form">
          <h3>Create New Match</h3>
          <form onSubmit={handleCreateMatch}>
            <div className="form-row">
              <div className="form-group">
                <label>Team A</label>
                <select value={formData.teamA} onChange={(e) => setFormData({...formData, teamA: e.target.value})} required>
                  <option value="">Select Team</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                </select>
              </div>
              <div className="vs">VS</div>
              <div className="form-group">
                <label>Team B</label>
                <select value={formData.teamB} onChange={(e) => setFormData({...formData, teamB: e.target.value})} required>
                  <option value="">Select Team</option>
                  {teams.filter(t => t._id !== formData.teamA).map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={formData.matchDate} onChange={(e) => setFormData({...formData, matchDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={formData.matchTime} onChange={(e) => setFormData({...formData, matchTime: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <select value={formData.venueId} onChange={(e) => setFormData({...formData, venueId: e.target.value})} required>
                  <option value="">Select Venue</option>
                  {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="submit-btn">Create Match</button>
          </form>
        </div>
      )}

      <div className="matches-list">
        <h3>All Matches</h3>
        {matches.length === 0 ? (
          <p className="no-matches">No matches created yet</p>
        ) : (
          matches.map(match => (
            <div key={match._id} className="match-item">
              <div className="match-info">
                <div className="teams">
                  <span className="team">{match.teams[0]?.teamName}</span>
                  <span className="vs">VS</span>
                  <span className="team">{match.teams[1]?.teamName}</span>
                </div>
                <div className="details">
                  <span>📅 {new Date(match.matchDate).toLocaleDateString()}</span>
                  <span>🕐 {new Date(match.matchDate).toLocaleTimeString()}</span>
                  <span>🏟️ {match.venueId?.name}</span>
                  {getStatusBadge(match.status)}
                </div>
              </div>
              {match.status === "scheduled" && (
                <MatchResultEditor match={match} onUpdate={updateMatchResult} />
              )}
              {match.status === "completed" && match.result && (
                <div className="match-result-display">
                  <span className="winner">🏆 Winner: {match.result.winnerTeamId === match.teams[0]?._id ? match.teams[0]?.teamName : match.teams[1]?.teamName}</span>
                  <span className="score">Score: {match.result.score}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MatchResultEditor({ match, onUpdate }) {
  const [winner, setWinner] = useState("");
  const [score, setScore] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const handleSubmit = () => {
    if (!winner) {
      alert("Please select a winner");
      return;
    }
    if (!score) {
      alert("Please enter the score");
      return;
    }
    onUpdate(match._id, winner, score);
    setShowEditor(false);
  };

  return (
    <div className="result-editor">
      {!showEditor ? (
        <button className="update-result-btn" onClick={() => setShowEditor(true)}>📝 Update Result</button>
      ) : (
        <div className="editor-form">
          <select value={winner} onChange={(e) => setWinner(e.target.value)}>
            <option value="">Select Winner</option>
            <option value={match.teams[0]?._id}>{match.teams[0]?.teamName}</option>
            <option value={match.teams[1]?._id}>{match.teams[1]?.teamName}</option>
          </select>
          <input type="text" placeholder="Score (e.g., 2-1)" value={score} onChange={(e) => setScore(e.target.value)} />
          <button className="save-result" onClick={handleSubmit}>Save</button>
          <button className="cancel-result" onClick={() => setShowEditor(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}