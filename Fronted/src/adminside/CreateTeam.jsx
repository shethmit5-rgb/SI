import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CreateTeam() {
  const token = localStorage.getItem("token");
  const [tournaments, setTournaments] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [tournamentId, setTournamentId] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/tournaments")
      .then(res => setTournaments(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/teams",
      { teamName, tournamentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Team created");
    setTeamName("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Create Team</h2>

      <form onSubmit={handleSubmit}>
        <select value={tournamentId} onChange={e => setTournamentId(e.target.value)} required>
          <option value="">Select Tournament</option>
          {tournaments.map(t => (
            <option key={t._id} value={t._id}>{t.eventName}</option>
          ))}
        </select>

        <input
          placeholder="Team Name"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          required
        />

        <button>Create Team</button>
      </form>
    </div>
  );
}
