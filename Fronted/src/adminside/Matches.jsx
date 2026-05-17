import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Matches.css";

export default function Matches() {
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [matches, setMatches] = useState([]);

  const [form, setForm] = useState({
    tournamentId: "",
    teamA: "",
    teamB: "",
    date: "",
    time: "",
    venueId: "",
  });

  /* LOAD INITIAL DATA */
  useEffect(() => {
    // ✅ FIXED: Use public endpoint for tournaments
    axios.get("http://localhost:5000/api/tournaments/public").then(res => setTournaments(res.data));
    axios.get("http://localhost:5000/api/venues").then(res => setVenues(res.data));
  }, []);

  /* LOAD TEAMS + MATCHES WHEN TOURNAMENT SELECTED */
  useEffect(() => {
    if (!form.tournamentId) return;

    axios
      .get(`http://localhost:5000/api/teams/tournament/${form.tournamentId}`, auth)
      .then(res => setTeams(res.data));

    loadMatches(form.tournamentId);
  }, [form.tournamentId]);

  const loadMatches = async (tournamentId) => {
    const res = await axios.get(
      `http://localhost:5000/api/matches/tournament/${tournamentId}`,
      auth
    );
    setMatches(res.data);
  };

  /* SUBMIT MATCH */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.teamA === form.teamB) {
      alert("Team A and Team B must be different");
      return;
    }

    const matchDate = new Date(`${form.date}T${form.time}`);

    try {
      await axios.post(
        "http://localhost:5000/api/matches",
        {
          tournamentId: form.tournamentId,
          teams: [form.teamA, form.teamB],
          matchDate,
          venueId: form.venueId,
        },
        auth
      );

      loadMatches(form.tournamentId);
      setForm({ ...form, teamA: "", teamB: "", date: "", time: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Match creation failed");
    }
  };

  return (
    <div className="match-page">
      <div className="match-card">
        <h2>Manage Matches</h2>

        <form className="match-form" onSubmit={handleSubmit}>
          <select
            value={form.tournamentId}
            onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
            required
          >
            <option value="">Select Tournament</option>
            {tournaments.map(t => (
              <option key={t._id} value={t._id}>{t.eventName}</option>
            ))}
          </select>

          <div className="match-row">
            <select
              value={form.teamA}
              onChange={(e) => setForm({ ...form, teamA: e.target.value })}
              required
            >
              <option value="">Team A</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.teamName}</option>
              ))}
            </select>

            <select
              value={form.teamB}
              onChange={(e) => setForm({ ...form, teamB: e.target.value })}
              required
            >
              <option value="">Team B</option>
              {teams
                .filter(t => t._id !== form.teamA)
                .map(t => (
                  <option key={t._id} value={t._id}>{t.teamName}</option>
                ))}
            </select>
          </div>

          <div className="match-row">
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <input type="time" value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
            <select
              value={form.venueId}
              onChange={(e) => setForm({ ...form, venueId: e.target.value })}
              required
            >
              <option value="">Select Venue</option>
              {venues.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <button className="match-btn">Add Match</button>
        </form>

        <div className="match-list">
          <h3>Match List</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Match</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.teams[0]?.teamName} vs {m.teams[1]?.teamName}</td>
                  <td>{new Date(m.matchDate).toLocaleString()}</td>
                  <td>{m.venueId?.name}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}