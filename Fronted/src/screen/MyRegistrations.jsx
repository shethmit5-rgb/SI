import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "../static/MyRegistrations.css";

export default function MyRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations/my-registrations");
      setRegistrations(res.data);
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelRegistration = async (id, tournamentName, teamName) => {
    if (!window.confirm(`❌ Cancel registration for "${tournamentName}"?\n\nTeam: ${teamName}\n\nThis action cannot be undone.`)) return;
    
    setActionLoading(id);
    try {
      await api.delete(`/registrations/${id}/cancel`);
      alert("✅ Registration cancelled successfully");
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel registration");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "#10b981";
      case "pending": return "#f59e0b";
      case "rejected": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "approved": return "✅";
      case "pending": return "⏳";
      case "rejected": return "❌";
      default: return "❓";
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (activeFilter === "all") return true;
    return reg.approvalStatus === activeFilter;
  });

  if (!user) {
    return (
      <div className="login-prompt">
        <p>Please login to view your registrations</p>
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    );
  }

  if (loading) return <div className="loading-spinner">Loading registrations...</div>;

  return (
    <div className="my-registrations-page">
      <h1>📋 My Tournament Registrations</h1>
      <p className="subtitle">Track your team registration status</p>

      {/* Filters */}
      <div className="reg-filters">
        <button onClick={() => setActiveFilter("all")} className={activeFilter === "all" ? "active" : ""}>All</button>
        <button onClick={() => setActiveFilter("pending")} className={activeFilter === "pending" ? "active" : ""}>Pending</button>
        <button onClick={() => setActiveFilter("approved")} className={activeFilter === "approved" ? "active" : ""}>Approved</button>
        <button onClick={() => setActiveFilter("rejected")} className={activeFilter === "rejected" ? "active" : ""}>Rejected</button>
      </div>

      {filteredRegistrations.length > 0 ? (
        <div className="registrations-list">
          {filteredRegistrations.map(reg => (
            <div key={reg._id} className="registration-card">
              <div className="reg-header">
                <div className="reg-title">
                  <h3>{reg.tournamentId?.eventName}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(reg.approvalStatus) }}
                  >
                    {getStatusIcon(reg.approvalStatus)} {reg.approvalStatus}
                  </span>
                </div>
              </div>

              <div className="reg-details">
                <div className="detail-item">
                  <span className="detail-label">🏷️ Team:</span>
                  <span className="detail-value">{reg.teamId?.teamName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📅 Registered on:</span>
                  <span className="detail-value">{new Date(reg.registrationDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💰 Payment:</span>
                  <span className={`payment-status ${reg.paymentStatus}`}>
                    {reg.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
                  </span>
                </div>
              </div>

              <div className="reg-footer">
                <Link to={`/tournament/${reg.tournamentId?._id}`} className="view-tournament">
                  View Tournament →
                </Link>
                <Link to={`/team/${reg.teamId?._id}`} className="view-team">
                  View Team →
                </Link>
                {/* Cancel Registration Button */}
                <button 
                  onClick={() => cancelRegistration(reg._id, reg.tournamentId?.eventName, reg.teamId?.teamName)}
                  className="cancel-reg-btn"
                  disabled={actionLoading === reg._id}
                >
                  {actionLoading === reg._id ? "Cancelling..." : "❌ Cancel Registration"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>📭 No {activeFilter !== "all" ? activeFilter : ""} registrations found</p>
          <Link to="/tournaments" className="browse-btn">Browse Tournaments</Link>
        </div>
      )}
    </div>
  );
}