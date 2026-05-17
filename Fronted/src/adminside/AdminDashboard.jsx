import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [stats, setStats] = useState({
    users: 0,
    tournaments: 0,
    teams: 0,
    prizePool: 0,
  });

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ================= LOAD DASHBOARD ================= */
  useEffect(() => {
    loadDashboardData();
  }, []);

const loadDashboardData = async () => {
  try {
    setLoading(true);

    const usersRes = await axios.get("http://localhost:5000/api/users", authHeader);
    console.log("USERS OK");

    const tournamentsRes = await axios.get("http://localhost:5000/api/tournaments/public");
    console.log("TOURNAMENTS OK");

    const teamsRes = await axios.get("http://localhost:5000/api/teams", authHeader);
    console.log("TEAMS OK");

    const sponsorsRes = await axios.get("http://localhost:5000/api/sponsors", authHeader);
    console.log("SPONSORS OK");

    const registrationsRes = await axios.get("http://localhost:5000/api/registrations", authHeader);
    console.log("REGISTRATIONS OK");

    const prizePool = sponsorsRes.data.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0
    );

    setUsers(usersRes.data);
    setTournaments(tournamentsRes.data);
    setRegistrations(registrationsRes.data);

    setStats({
      users: usersRes.data.length,
      tournaments: tournamentsRes.data.length,
      teams: teamsRes.data.length,
      prizePool,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err.response?.data || err.message);
    alert("❌ Failed to load admin dashboard");
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading dashboard...</h2>;
  }

  return (
    <div className="admin-layout">
      <main className="content">
        <h1>Admin Dashboard</h1>

        {/* ================= STATS ================= */}
        <div className="stats">
          <div className="card">
            Total Users <br />
            <b>{stats.users}</b>
          </div>

          <div className="card">
            Tournaments <br />
            <b>{stats.tournaments}</b>
          </div>

          <div className="card">
            Teams <br />
            <b>{stats.teams}</b>
          </div>

          <div className="card">
            Prize Pool <br />
            <b>₹{stats.prizePool}</b>
          </div>
        </div>

        {/* ================= TOURNAMENTS ================= */}
        <section className="panel">
          <h2>Tournaments</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Sport</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t._id}>
                  <td>{t.eventName}</td>
                  <td>{t.sportId?.name || "N/A"}</td>
                  <td>{t.location || "-"}</td>
                  <td>
                    <span className={`status ${t.status}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ================= REGISTRATIONS ================= */}
        <section className="panel">
          <h2>Registrations</h2>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Team</th>
                <th>Tournament</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r._id}>
                  <td>{r.userId?.name}</td>
                  <td>{r.teamId?.teamName}</td>
                  <td>{r.tournamentId?.eventName}</td>
                  <td>
                    <span className={`status ${r.approvalStatus}`}>
                      {r.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
