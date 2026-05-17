import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "../static/JoinTeam.css";

export default function JoinTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
      
      // Check if user is already a member or has applied
      if (user) {
        const isMember = res.data.players?.some(p => p.userId?._id === user._id && p.status === "approved");
        const hasApplied = res.data.players?.some(p => p.userId?._id === user._id && p.status === "pending");
        
        setAlreadyMember(isMember);
        setAlreadyApplied(hasApplied);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
      setError("Team not found or invalid invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/teams/join/${id}` } });
      return;
    }

    setApplying(true);
    setMessage("");
    setError("");

    try {
      await api.post(`/teams/${id}/apply`);
      setMessage("✅ Application sent successfully! The team captain will review your request.");
      setAlreadyApplied(true);
    } catch (err) {
      console.error("Application failed:", err);
      setError(err.response?.data?.message || "Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "upcoming": return <span className="badge upcoming">📅 Upcoming</span>;
      case "ongoing": return <span className="badge ongoing">🔥 Ongoing</span>;
      case "completed": return <span className="badge completed">✅ Completed</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="join-team-loading">
        <div className="spinner"></div>
        <p>Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="join-team-error">
        <div className="error-icon">🔗</div>
        <h2>Invalid Invite Link</h2>
        <p>{error || "This team invite link is invalid or expired."}</p>
        <Link to="/teams" className="browse-teams-btn">Browse Teams</Link>
      </div>
    );
  }

  const currentPlayers = team.players?.filter(p => p.status === "approved").length || 0;
  const maxPlayers = team.sportId?.playersPerTeam || 11;
  const spotsLeft = maxPlayers - currentPlayers;

  return (
    <div className="join-team-page">
      <div className="join-team-container">
        {/* Header */}
        <div className="team-header">
          <div className="team-icon">👥</div>
          <h1>Join {team.teamName}</h1>
          <p>You've been invited to join this team!</p>
        </div>

        {/* Team Details */}
        <div className="team-details-card">
          <div className="detail-row">
            <span className="detail-label">🏆 Tournament:</span>
            <span className="detail-value">{team.tournamentId?.eventName || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">⚽ Sport:</span>
            <span className="detail-value">{team.sportId?.name || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">👑 Captain:</span>
            <span className="detail-value">{team.captainId?.name || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">👥 Team Size:</span>
            <span className="detail-value">
              {currentPlayers} / {maxPlayers} players
              {spotsLeft > 0 && <span className="spots-left"> ({spotsLeft} spots left)</span>}
              {spotsLeft === 0 && <span className="spots-full"> (Team Full)</span>}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">📅 Tournament Status:</span>
            <span className="detail-value">
              {getStatusBadge(team.tournamentId?.status)}
            </span>
          </div>
        </div>

        {/* Team Players Preview */}
        {currentPlayers > 0 && (
          <div className="team-players-preview">
            <h3>Current Team Members ({currentPlayers})</h3>
            <div className="players-list">
              {team.players?.filter(p => p.status === "approved").slice(0, 5).map(player => (
                <div key={player._id} className="player-avatar-mini">
                  {player.userId?.name?.charAt(0)?.toUpperCase()}
                </div>
              ))}
              {currentPlayers > 5 && (
                <div className="player-avatar-mini more">+{currentPlayers - 5}</div>
              )}
              {currentPlayers === 0 && (
                <p className="no-players">No players yet. Be the first to join!</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-section">
          {alreadyMember ? (
            <div className="already-member">
              <div className="success-icon">✅</div>
              <h3>You are already a member of this team!</h3>
              <Link to={`/team/${team._id}`} className="view-team-btn">
                View Your Team →
              </Link>
            </div>
          ) : alreadyApplied ? (
            <div className="already-applied">
              <div className="pending-icon">⏳</div>
              <h3>Application Pending</h3>
              <p>Your request to join this team has been sent to the captain.</p>
              <p className="waiting-text">Please wait for captain's approval.</p>
              <Link to="/my-teams" className="check-status-btn">
                Check Status →
              </Link>
            </div>
          ) : spotsLeft === 0 ? (
            <div className="team-full">
              <div className="full-icon">🚫</div>
              <h3>Team is Full</h3>
              <p>This team has reached its maximum player capacity.</p>
              <Link to="/teams" className="browse-teams-btn">
                Browse Other Teams
              </Link>
            </div>
          ) : (
            <div className="apply-section">
              <button 
                onClick={handleApply} 
                disabled={applying}
                className="apply-btn"
              >
                {applying ? "Applying..." : "🎯 Join This Team"}
              </button>
              {!user && (
                <p className="login-hint">
                  You need to <Link to="/login">login</Link> to join this team
                </p>
              )}
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Back Link */}
        <div className="back-link">
          <Link to="/teams">← Browse All Teams</Link>
        </div>
      </div>
    </div>
  );
}