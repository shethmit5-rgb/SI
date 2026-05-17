import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

export default function AdminProfile() {
  const { user, login, logout } = useAuth();
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    description: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState(null);

  // Fetch profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile/me", auth);
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        location: res.data.location || "",
        description: res.data.description || "",
      });
      setPreview(res.data.profileImage || "");
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) data.append(key, form[key]);
      });
      if (image) data.append("profileImage", image);

      const res = await axios.put("http://localhost:5000/api/profile/update", data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      login(res.data.user, token);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Clear image after upload
      setImage(null);
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setSaving(false);
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/profile/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        auth
      );
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password change failed:", err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  // Deactivate account
  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) return;

    try {
      await axios.delete("http://localhost:5000/api/profile/delete", auth);
      logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Deactivation failed:", err);
      alert("Failed to deactivate account");
    }
  };

  // Button styles
  const buttonStyles = {
    save: {
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    },
    cancel: {
      backgroundColor: "#6b7280",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      marginLeft: "10px",
    },
    deactivate: {
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    },
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <main className="content">
          <h2 style={{ textAlign: "center" }}>Loading profile...</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <main className="content">
        <h1>👤 Admin Profile</h1>

        {/* Message */}
        {message && (
          <div style={{
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
            color: message.type === "success" ? "#16a34a" : "#dc2626",
            border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Profile Header */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          marginBottom: "20px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={preview || `https://ui-avatars.com/api/?name=${form.name || "Admin"}&background=4f46e5&color=fff&size=120`}
              alt="Profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #4f46e5",
              }}
            />
            <label style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              backgroundColor: "#4f46e5",
              color: "white",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "16px",
            }}>
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              📷
            </label>
          </div>
          <h2 style={{ marginTop: "15px", marginBottom: "5px" }}>{form.name}</h2>
          <p style={{ color: "#666" }}>{form.email}</p>
          <p style={{ color: "#4f46e5", fontWeight: "500" }}>Administrator</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid #e5e7eb",
        }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: activeTab === "profile" ? "#4f46e5" : "#6b7280",
              borderBottom: activeTab === "profile" ? "2px solid #4f46e5" : "none",
              marginBottom: "-2px",
            }}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("password")}
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: activeTab === "password" ? "#4f46e5" : "#6b7280",
              borderBottom: activeTab === "password" ? "2px solid #4f46e5" : "none",
              marginBottom: "-2px",
            }}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab("danger")}
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: activeTab === "danger" ? "#ef4444" : "#6b7280",
              borderBottom: activeTab === "danger" ? "2px solid #ef4444" : "none",
              marginBottom: "-2px",
            }}
          >
            Danger Zone
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f3f4f6" }}
                />
                <small style={{ color: "#666" }}>Email cannot be changed</small>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Bio / Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell something about yourself"
                  rows="4"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={buttonStyles.save}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#059669"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#10b981"}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={buttonStyles.save}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#059669"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#10b981"}
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #fee2e2",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>⚠️</div>
              <h3 style={{ color: "#dc2626", marginBottom: "10px" }}>Deactivate Account</h3>
              <p style={{ color: "#666", marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
                Once you deactivate your account, you will lose access to all admin features.
                This action cannot be undone.
              </p>
              <button
                onClick={handleDeactivate}
                style={buttonStyles.deactivate}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
              >
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}