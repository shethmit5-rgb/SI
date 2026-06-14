import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axiosConfig";
import "../static/TournamentsList.css";

export default function TournamentsList() {
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    sport: "all",
    status: "all"
  });

  useEffect(() => {
    fetchTournaments();
    fetchSports();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get("/tournaments/public");
      setTournaments(res.data);
    } catch (err) {
      console.error("Failed to fetch tournaments", err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const res = await api.get("/sports");
      setSports(res.data);
    } catch (err) {
      console.error("Failed to fetch sports", err);
    }
  };

  // Filter tournaments based on search term, sport, and status
  const filteredTournaments = tournaments.filter(tournament => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      tournament.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sport filter
    const matchesSport = filters.sport === "all" || tournament.sportId?._id === filters.sport;
    
    // Status filter
    const matchesStatus = filters.status === "all" || tournament.status === filters.status;
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "upcoming": return "#f59e0b";
      case "ongoing": return "#10b981";
      case "completed": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "upcoming": return "📅";
      case "ongoing": return "🔥";
      case "completed": return "✅";
      default: return "🏆";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ sport: "all", status: "all" });
  };

  if (loading) {
    return <div className="loading-spinner">Loading tournaments...</div>;
  }

  return (
    <div className="tournaments-list-page">
      <div className="page-header">
        <h1>🏆 Tournaments</h1>
        <p>Find and join exciting tournaments near you</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search tournaments by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Sport:</label>
          <select
            value={filters.sport}
            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
            className={filters.sport !== "all" ? "active-filter" : ""}
          >
            <option value="all">All Sports</option>
            {sports.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={filters.status !== "all" ? "active-filter" : ""}
          >
            <option value="all">All Status</option>
            <option value="upcoming">📅 Upcoming</option>
            <option value="ongoing">🔥 Ongoing</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        {(filters.sport !== "all" || filters.status !== "all" || searchTerm) && (
          <button onClick={clearFilters} className="clear-filters">
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="results-info">
        <p className="results-count">
          Found <strong>{filteredTournaments.length}</strong> tournament
          {filteredTournaments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="tournaments-grid">
          {filteredTournaments.map(tournament => (
            <div key={tournament._id} className="tournament-card">
              <div className="card-image">
                {tournament.logo ? (
                  <img src={tournament.logo} alt={tournament.eventName} />
                ) : (
                  <div className="no-image">🏆</div>
                )}
                <span className={`status-badge badge-${tournament.status}`}>
                  {getStatusIcon(tournament.status)} {tournament.status}
                </span>
              </div>

              <div className="card-content">
                <h3>{tournament.eventName}</h3>
                
                <div className="tournament-location">
                  📍 {tournament.location || "Location TBD"}
                </div>

                <div className="tournament-meta">
                  <div className="meta-item sport-item">
                    <span className="meta-icon">⚽</span>
                    <span>{tournament.sportId?.name || "Multi-sport"}</span>
                  </div>
                  <div className="meta-item date-item">
                    <span className="meta-icon">📅</span>
                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item teams-item">
                    <span className="meta-icon">👥</span>
                    <span>{tournament.teams?.length || 0} teams</span>
                  </div>
                  <div className="meta-item prize-item">
                    <span className="meta-icon">💰</span>
                    <span>₹{tournament.prizePool?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {tournament.description && (
                  <p className="description">{tournament.description.slice(0, 100)}...</p>
                )}

                <Link to={`/tournament/${tournament._id}`} className="view-btn">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No tournaments found</h3>
          <p>Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
