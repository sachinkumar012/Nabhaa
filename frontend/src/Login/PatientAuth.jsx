import {  useState } from 'react';

const PatientAuth = () => {
  const [authMode, setAuthMode] = useState("login"); // login or signup
  const [method, setMethod] = useState("phone"); // phone or email
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle Phone OTP Request
  const sendOtp = () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }
    console.log("Send OTP to:", phone);
    // TODO: integrate Firebase/OTP service here
    alert("OTP sent!");
  };

  // Handle Phone OTP Verification
  const verifyOtp = () => {
    console.log("Verify OTP:", otp);
    // TODO: verify OTP logic
    alert("Phone verified successfully!");
  };

  // Handle Email Signup/Login
  const handleEmailAuth = (e) => {
    e.preventDefault();
    console.log(`${authMode} with Email:`, { email, password });
    // TODO: backend authentication
    alert(`${authMode} successful with email`);
  };

  return (
    <div className="auth-container">
      <h2>Patient {authMode === "login" ? "Login" : "Signup"}</h2>

      {/* Toggle Login/Signup */}
      <div>
        <button onClick={() => setAuthMode("login")}>Login</button>
        <button onClick={() => setAuthMode("signup")}>Signup</button>
      </div>

      {/* Toggle Phone/Email */}
      <div>
        <button onClick={() => setMethod("phone")}>Phone</button>
        <button onClick={() => setMethod("email")}>Email</button>
      </div>

      {/* Phone Auth */}
      {method === "phone" && (
        <div>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </div>
      )}

      {/* Email Auth */}
      {method === "email" && (
        <form onSubmit={handleEmailAuth}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {authMode === "login" ? "Login" : "Signup"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PatientAuth;
