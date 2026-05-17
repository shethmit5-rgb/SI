import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Registrations.css";

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ================= LOAD REGISTRATIONS ================= */
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/registrations",
        authHeader
      );
      setRegistrations(res.data);
    } catch (err) {
      alert("Failed to load registrations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/registrations/${id}`,
        { approvalStatus: status },
        authHeader
      );
      fetchRegistrations();
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading registrations...</h2>;
  }

  return (
    <div className="reg-page">
      <div className="reg-card">
        <h2>Team Registrations</h2>

        <table className="reg-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Tournament</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No registrations found
                </td>
              </tr>
            ) : (
              registrations.map((r, index) => (
                <tr key={r._id}>
                  <td>{index + 1}</td>

                  <td>
                    <strong>{r.teamId?.teamName || "N/A"}</strong>
                  </td>

                  <td>{r.tournamentId?.eventName || "N/A"}</td>

                  <td>
                    <span className={`status ${r.approvalStatus}`}>
                      {r.approvalStatus}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`payment ${
                        r.paymentStatus === "paid" ? "paid" : "unpaid"
                      }`}
                    >
                      {r.paymentStatus || "unpaid"}
                    </span>
                  </td>

                  <td className="actions">
                    {r.approvalStatus === "pending" && (
                      <>
                        <button
                          className="approve"
                          onClick={() => updateStatus(r._id, "approved")}
                        >
                          Approve
                        </button>

                        <button
                          className="reject"
                          onClick={() => updateStatus(r._id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
