import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RegisterTeam.css";

export default function RegisterTeam() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [logo, setLogo] = useState(null);
  const [players, setPlayers] = useState([""]);

  /* LOAD TOURNAMENTS */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tournaments")
      .then((res) => setTournaments(res.data))
      .catch((err) => console.error(err));
  }, []);

  /* PLAYER HANDLERS */
  const addPlayer = () => setPlayers([...players, ""]);

  const removePlayer = (index) => {
    const list = [...players];
    list.splice(index, 1);
    setPlayers(list);
  };

  const handlePlayerChange = (index, value) => {
    const list = [...players];
    list[index] = value;
    setPlayers(list);
  };

  /* SUBMIT TEAM */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tournamentId || !teamName) {
      alert("Please fill required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 1️⃣ Create Team
      const teamData = new FormData();
      teamData.append("teamName", teamName);
      teamData.append("coachName", coachName);
      if (logo) teamData.append("logo", logo);

      players.forEach((p) => {
        if (p.trim() !== "") teamData.append("players[]", p);
      });

      const teamRes = await axios.post(
        "http://localhost:5000/api/teams",
        teamData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2️⃣ Register Team to Tournament
      await axios.post(
        "http://localhost:5000/api/registrations",
        {
          tournamentId,
          teamId: teamRes.data._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Team registered successfully!");
      setTeamName("");
      setCoachName("");
      setLogo(null);
      setPlayers([""]);
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="rt-page">
      <div className="rt-card">
        <h2>Register Team</h2>
        <p>Register your team for the tournament</p>

        <form className="rt-form" onSubmit={handleSubmit}>
          {/* TOURNAMENT */}
          <div className="rt-group">
            <label>Select Tournament</label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              required
            >
              <option value="">Select Tournament</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.eventName}
                </option>
              ))}
            </select>
          </div>

          {/* TEAM NAME */}
          <div className="rt-group">
            <label>Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter Team Name"
              required
            />
          </div>

          {/* COACH */}
          <div className="rt-group">
            <label>Coach Name</label>
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Coach Name"
            />
          </div>

          {/* LOGO */}
          <div className="rt-group">
            <label>Team Logo</label>
            <input type="file" onChange={(e) => setLogo(e.target.files[0])} />
          </div>

          {/* PLAYERS */}
          <div className="rt-group">
            <label>Players</label>

            {players.map((player, index) => (
              <div key={index} className="player-row">
                <input
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChange={(e) =>
                    handlePlayerChange(index, e.target.value)
                  }
                />

                {players.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addPlayer}
              className="add-player"
            >
              + Add Player
            </button>
          </div>

          <button type="submit" className="rt-btn">
            Register Team
          </button>
        </form>
      </div>
    </div>
  );
}
