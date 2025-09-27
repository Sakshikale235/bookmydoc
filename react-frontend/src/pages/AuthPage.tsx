import React, { useState } from "react";
import "@/assets/login_form.css";
import { BiUser, BiLockAlt, BiEnvelope } from "react-icons/bi";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const SocialIcons: React.FC = () => (
  <div className="social-icons">
    <a href="#"><FcGoogle /></a>
    <a href="#"><FaFacebook /></a>
    <a href="#"><BsGithub /></a>
    <a href="#"><BsLinkedin /></a>
  </div>
);

// ✅ replaced <i> with React Icons
const LoginForm: React.FC<{ onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }> = ({ onSubmit }) => (
  <div className="form-box login">
    <form onSubmit={onSubmit}>
      <div className="input-box">
        <input type="text" name="username" placeholder="Username" required />
        <BiUser className="icon" />
      </div>
      <div className="input-box">
        <input type="password" name="password" placeholder="Password" required />
        <BiLockAlt className="icon" />
      </div>
      <div className="forgot-link">
        <a href="#">forgot password?</a>
      </div>
      <button type="submit" className="btn">Login</button>
      <p>or login with social platforms</p>
      <SocialIcons />
    </form>
  </div>
);

const RegisterForm: React.FC<{ onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }> = ({ onSubmit }) => (
  <div className="form-box register">
    <form onSubmit={onSubmit}>
      <div className="input-box">
        <input type="text" name="username" placeholder="Username" required />
        <BiUser className="icon" />
      </div>
      <div className="input-box">
        <input type="email" name="email" placeholder="Email" required />
        <BiEnvelope className="icon" />
      </div>
      <div className="input-box">
        <input type="password" name="password" placeholder="Password" required />
        <BiLockAlt className="icon" />
      </div>
      <div className="input-box">
        <input type="password" name="confirm_password" placeholder="Confirm Password" required />
        <BiLockAlt className="icon" />
      </div>
      <button type="submit" className="btn">Register</button>
      <p>or Register with social platforms</p>
      <SocialIcons />
    </form>
  </div>
);

function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    fetch("/login/", {
      method: "POST",
      body: formData,
      headers: { "X-CSRFToken": getCookie("csrftoken") || "" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.location.href = data.redirect;
        } else {
          alert(data.error);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    fetch("/register/", {
      method: "POST",
      body: formData,
      headers: { "X-CSRFToken": getCookie("csrftoken") || "" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          setIsRegister(false);
        } else {
          alert(data.error);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className={`container${isRegister ? " active" : ""}`}>
      <LoginForm onSubmit={handleLogin} />
      <RegisterForm onSubmit={handleRegister} />

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" type="button" onClick={() => setIsRegister(true)}>Register</button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" type="button" onClick={() => setIsRegister(false)}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
