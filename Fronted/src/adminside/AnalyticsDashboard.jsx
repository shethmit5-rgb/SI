import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsDashboard() {
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    users: 0,
    tournaments: 0,
    teams: 0,
    matches: 0,
    sponsors: 0,
    registrations: 0,
    totalPrizePool: 0,
    upcomingTournaments: 0,
    ongoingTournaments: 0,
    completedTournaments: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [sportDistribution, setSportDistribution] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState({
    upcoming: 0,
    ongoing: 0,
    completed: 0,
  });
  
  const socketRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
    setupSocketConnection();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocketConnection = () => {
    // Connect to Socket.IO
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("🔌 Connected to analytics real-time updates");
      // Register as admin for analytics updates
      socketRef.current.emit("register-analytics", { userId: localStorage.getItem("userId") });
    });

    // Listen for analytics updates
    socketRef.current.on("analytics_update", (updatedData) => {
      console.log("📊 Real-time analytics update received");
      updateDashboardData(updatedData);
      setLastUpdated(new Date());
    });

    socketRef.current.on("tournament_created", (data) => {
      console.log("🏆 New tournament created:", data);
      fetchAnalytics(); // Refresh all data
    });

    socketRef.current.on("tournament_updated", (data) => {
      console.log("✏️ Tournament updated:", data);
      fetchAnalytics();
    });

    socketRef.current.on("tournament_deleted", (data) => {
      console.log("🗑️ Tournament deleted:", data);
      fetchAnalytics();
    });

    socketRef.current.on("team_registered", (data) => {
      console.log("👥 Team registered:", data);
      fetchAnalytics();
    });

    socketRef.current.on("disconnect", () => {
      console.log("🔌 Disconnected from real-time updates");
    });
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/analytics/stats", auth);
      
      if (response.data) {
        updateDashboardData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardData = (data) => {
    if (data.stats) {
      setStats(data.stats);
    }
    if (data.monthlyData) {
      setMonthlyData(data.monthlyData);
    }
    if (data.sportDistribution) {
      setSportDistribution(data.sportDistribution);
    }
    if (data.statusDistribution) {
      setStatusDistribution(data.statusDistribution);
    }
  };

  const barChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: "Tournaments Created",
        data: monthlyData.map(d => d.count),
        backgroundColor: "#4f46e5",
        borderRadius: 8,
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
      },
    ],
  };

  const pieChartData = {
    labels: sportDistribution.map(s => s.name),
    datasets: [
      {
        data: sportDistribution.map(s => s.count),
        backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"],
        borderWidth: 0,
        animation: {
          animateRotate: true,
          animateScale: true,
        },
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Upcoming", "Ongoing", "Completed"],
    datasets: [
      {
        data: [statusDistribution.upcoming, statusDistribution.ongoing, statusDistribution.completed],
        backgroundColor: ["#f59e0b", "#10b981", "#6b7280"],
        borderWidth: 0,
        cutout: "60%",
        animation: {
          animateRotate: true,
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
    },
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <main className="content">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="spinner"></div>
            <h2>Loading analytics...</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1>📊 Analytics Dashboard</h1>
          <div style={{ fontSize: "12px", color: "#666", backgroundColor: "#f3f4f6", padding: "5px 10px", borderRadius: "8px" }}>
            🔄 Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}>
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ fontSize: "32px" }}>👥</div>
            <div className="stat-number" style={{ fontSize: "28px", fontWeight: "bold", color: "#4f46e5" }}>{stats.users}</div>
            <div style={{ color: "#666" }}>Total Users</div>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px" }}>🏆</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981" }}>{stats.tournaments}</div>
            <div style={{ color: "#666" }}>Tournaments</div>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px" }}>👥</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b" }}>{stats.teams}</div>
            <div style={{ color: "#666" }}>Teams</div>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px" }}>⚽</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ef4444" }}>{stats.matches}</div>
            <div style={{ color: "#666" }}>Matches</div>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px" }}>🤝</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#8b5cf6" }}>{stats.sponsors}</div>
            <div style={{ color: "#666" }}>Sponsors</div>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px" }}>📝</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#06b6d4" }}>{stats.registrations}</div>
            <div style={{ color: "#666" }}>Registrations</div>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px" }}>💰</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ec4899" }}>₹{stats.totalPrizePool?.toLocaleString() || 0}</div>
            <div style={{ color: "#666" }}>Total Prize Pool</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}>
          {/* Bar Chart */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px" }}>📅 Tournaments by Month</h3>
            <div style={{ height: "300px" }}>
              {monthlyData.length > 0 ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <div style={{ textAlign: "center", paddingTop: "100px", color: "#999" }}>No data available</div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px" }}>🏅 Tournaments by Sport</h3>
            <div style={{ height: "300px" }}>
              {sportDistribution.length > 0 ? (
                <Pie data={pieChartData} options={chartOptions} />
              ) : (
                <div style={{ textAlign: "center", paddingTop: "100px", color: "#999" }}>No data available</div>
              )}
            </div>
          </div>

          {/* Doughnut Chart */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px" }}>📊 Tournament Status</h3>
            <div style={{ height: "300px" }}>
              <Doughnut data={doughnutChartData} options={chartOptions} />
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "20px" }}>🔄 Quick Stats</h3>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                <span>Active Tournaments:</span>
                <strong style={{ color: "#10b981" }}>{stats.ongoingTournaments || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                <span>Upcoming Tournaments:</span>
                <strong style={{ color: "#f59e0b" }}>{stats.upcomingTournaments || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                <span>Completed Tournaments:</span>
                <strong style={{ color: "#6b7280" }}>{stats.completedTournaments || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                <span>Average Teams per Tournament:</span>
                <strong>{(stats.teams / stats.tournaments || 0).toFixed(1)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                <span>Average Prize Pool:</span>
                <strong>₹{((stats.totalPrizePool || 0) / (stats.tournaments || 1)).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}