// AuthModal - the login/register popup
// Shows up whenever dispatch(openModal()) is called from anywhere in the app
// Handles login, register, and guest (anonymous) login

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { closeModal } from "@/store/modalSlice";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthModal() {
  const dispatch = useDispatch();
  const router   = useRouter();

  // toggle between login and register form
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");    // show error message under the form
  const [loading, setLoading]   = useState(false); // disable buttons while waiting

  // handles both login and register depending on isLogin
  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      dispatch(closeModal());
      router.push("/for-you");
    } catch (err: any) {
      // map Firebase error codes to something readable
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("User not found or incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  // signs in without an account - useful for recruiters testing the app
  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      dispatch(closeModal());
      router.push("/for-you");
    } catch {
      setError("Guest login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* close button - top right corner */}
        <button style={styles.close} onClick={() => dispatch(closeModal())}>✕</button>

        <h2 style={styles.title}>
          {isLogin ? "Log in to Summarist" : "Sign up to Summarist"}
        </h2>

        {/* guest login only shows on the login screen */}
        {isLogin && (
          <button style={styles.guestBtn} onClick={handleGuest} disabled={loading}>
            Login as a Guest
          </button>
        )}

        <input
          style={styles.input}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        {/* switch between login and register */}
        <button
          style={styles.switchBtn}
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
        >
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
}

// using inline styles here since this modal sits outside the normal layout
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: "8px",
    padding: "40px 32px", width: "100%", maxWidth: "400px",
    display: "flex", flexDirection: "column", gap: "12px",
    position: "relative",
  },
  close:     { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "18px", cursor: "pointer" },
  title:     { fontSize: "20px", fontWeight: "700", textAlign: "center", color: "#032b41" },
  guestBtn:  { background: "#3d6b8e", color: "#fff", border: "none", borderRadius: "4px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  input:     { border: "1px solid #ccc", borderRadius: "4px", padding: "12px", fontSize: "14px", outline: "none" },
  submitBtn: { background: "#2bd97c", color: "#032b41", border: "none", borderRadius: "4px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  switchBtn: { background: "none", border: "none", color: "#2bd97c", fontSize: "13px", cursor: "pointer", textAlign: "center" },
  error:     { color: "red", fontSize: "13px", textAlign: "center" },
};
