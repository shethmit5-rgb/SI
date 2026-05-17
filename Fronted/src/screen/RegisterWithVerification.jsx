import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  validateEmail, 
  validatePassword, 
  validateName,
  getPasswordStrength 
} from "../utils/validators";
import "./Register.css";

export default function RegisterWithVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "player"
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Clear email availability when email changes
    if (name === "email") {
      setEmailAvailable(true);
      if (errors.email && errors.email !== "Email already registered") {
        setErrors(prev => ({ ...prev, email: null }));
      }
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    let error = null;
    switch(field) {
      case "name":
        error = validateName(formData.name);
        break;
      case "email":
        error = validateEmail(formData.email);
        if (!error && formData.email) {
          checkEmailAvailability(formData.email);
        }
        break;
      case "password":
        error = validatePassword(formData.password);
        break;
    }
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // ✅ EMAIL AVAILABILITY CHECK FUNCTION
  const checkEmailAvailability = async (email) => {
    if (!email || !validateEmail(email)) return;
    
    setIsEmailChecking(true);
    try {
      const res = await axios.post("http://localhost:5000/api/check-email", { email });
      if (!res.data.available) {
        setErrors(prev => ({ ...prev, email: "Email already registered. Please use a different email." }));
        setEmailAvailable(false);
      } else {
        setEmailAvailable(true);
        setErrors(prev => ({ ...prev, email: null }));
      }
    } catch (err) {
      console.error("Email check failed:", err);
      // Don't block registration if email check fails
      setEmailAvailable(true);
    } finally {
      setIsEmailChecking(false);
    }
  };

  const checkPasswordStrength = (password) => {
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
  };

  const validateStep1 = () => {
    const newErrors = {};
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    // Check if email is available
    if (!emailAvailable && !emailError) {
      newErrors.email = "Email already registered. Please use a different email.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const res = await axios.post("http://localhost:5000/api/register", formData);
      setMessage(res.data.message);
      setRegisteredEmail(formData.email);
      setStep(2);
    } catch (err) {
      if (err.response?.data?.message.includes("already exists")) {
        setErrors({ email: "Email already registered. Please use a different email or login." });
      } else {
        setErrors({ submit: err.response?.data?.message || "Registration failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verify: "Please enter a valid 6-digit code" });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await axios.post("http://localhost:5000/api/verify-email", {
        email: registeredEmail,
        code: verificationCode
      });
      alert("✅ Email verified successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setErrors({ verify: err.response?.data?.message || "Verification failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/resend-verification", {
        email: registeredEmail
      });
      setMessage("New verification code sent to your email!");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setErrors({ verify: err.response?.data?.message || "Failed to resend code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {step === 1 ? (
          <>
            <h2>Create Account</h2>
            <p>Join tournaments & manage events easily</p>
            
            {errors.submit && <div className="error-message">{errors.submit}</div>}
            
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  className={errors.name && touched.name ? "error" : ""}
                />
                {errors.name && touched.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  className={errors.email && (touched.email || !emailAvailable) ? "error" : ""}
                />
                {isEmailChecking && <span className="info-text">Checking availability...</span>}
                {errors.email && (touched.email || !emailAvailable) && (
                  <span className="error-text">{errors.email}</span>
                )}
                {!errors.email && emailAvailable && formData.email && touched.email && (
                  <span className="success-text">✓ Email available</span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 6 chars, 1 uppercase, 1 number, 1 special)"
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    checkPasswordStrength(e.target.value);
                  }}
                  onBlur={() => handleBlur("password")}
                  className={errors.password && touched.password ? "error" : ""}
                />
                {errors.password && touched.password && <span className="error-text">{errors.password}</span>}
                
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`, 
                          backgroundColor: passwordStrength.color 
                        }}
                      />
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label} Password
                    </span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="player">Player</option>
                  <option value="coach">Coach</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="register-btn" 
                disabled={loading || isEmailChecking || !emailAvailable}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Verify Your Email</h2>
            <p>Enter the 6-digit code sent to <strong>{registeredEmail}</strong></p>
            
            {message && <div className="success-message">{message}</div>}
            {errors.verify && <div className="error-message">{errors.verify}</div>}
            
            <form onSubmit={handleVerify}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength="6"
                  required
                />
              </div>
              
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>
            
            <button onClick={handleResendCode} className="resend-btn" disabled={loading}>
              Resend Code
            </button>
          </>
        )}
        
        <p className="login-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}