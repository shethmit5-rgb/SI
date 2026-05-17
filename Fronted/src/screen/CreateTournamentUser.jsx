import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import "../static/CreateTournament.css";

export default function CreateTournamentUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    eventName: "",
    sportId: "",
    venueId: "",
    location: "",
    startDate: "",
    endDate: "",
    maxParticipants: "",
    description: "",
    rules: "",
  });
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchSportsAndVenues();
  }, []);

  const fetchSportsAndVenues = async () => {
    try {
      const [sportsRes, venuesRes] = await Promise.all([
        api.get("/sports"),
        api.get("/venues"),
      ]);
      setSports(sportsRes.data);
      setVenues(venuesRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      if (logo) data.append("logo", logo);

      await api.post("/tournaments", data);
      alert("✅ Tournament created successfully!");
      navigate("/my-tournaments");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ct-page">
      <div className="ct-card">
        <h2>Create Tournament</h2>
        <p>Organize your own sports event</p>

        <form onSubmit={handleSubmit} className="ct-form">
          <div className="ct-group">
            <label>Tournament Name *</label>
            <input
              name="eventName"
              placeholder="e.g., Summer Championship 2024"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ct-row">
            <div className="ct-group">
              <label>Sport *</label>
              <select name="sportId" value={formData.sportId} onChange={handleChange} required>
                <option value="">Select Sport</option>
                {sports.map(sport => (
                  <option key={sport._id} value={sport._id}>{sport.name}</option>
                ))}
              </select>
            </div>

            <div className="ct-group">
              <label>Venue *</label>
              <select name="venueId" value={formData.venueId} onChange={handleChange} required>
                <option value="">Select Venue</option>
                {venues.map(venue => (
                  <option key={venue._id} value={venue._id}>{venue.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ct-group">
            <label>Location</label>
            <input
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="ct-row">
            <div className="ct-group">
              <label>Start Date *</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="ct-group">
              <label>End Date *</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="ct-group">
            <label>Max Participants (Teams)</label>
            <input
              type="number"
              name="maxParticipants"
              placeholder="e.g., 16"
              value={formData.maxParticipants}
              onChange={handleChange}
            />
          </div>

          <div className="ct-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Describe your tournament..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="ct-group">
            <label>Rules</label>
            <textarea
              name="rules"
              rows="3"
              placeholder="Tournament rules..."
              value={formData.rules}
              onChange={handleChange}
            />
          </div>

          <div className="ct-group">
            <label>Tournament Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
          </div>

          <button type="submit" disabled={loading} className="ct-btn">
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
}