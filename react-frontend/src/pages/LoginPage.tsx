// src/pages/LoginPage.tsx
import React, { useState } from "react";
import "boxicons/css/boxicons.min.css"; // Boxicons CDN in React

const LoginPage = () => {
  const [isActive, setIsActive] = useState(false);

  // Style objects
  const globalStyles: React.CSSProperties = {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  };

  const bodyStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(90deg, #e2e2e2, #c9d6ff)',
    ...globalStyles
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '850px',
    height: '550px',
    background: '#fff',
    borderRadius: '30px',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
    margin: '20px',
    overflow: 'hidden'
  };

  const formBoxStyles: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    width: '50%',
    height: '100%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    color: '#333',
    textAlign: 'center',
    padding: '40px',
    zIndex: 1,
    transition: '0.6s ease-in-out 1.2s, visibility 0s 1s'
  };

  const formBoxActiveStyles: React.CSSProperties = {
    ...formBoxStyles,
    right: 0,
    visibility: 'hidden'
  };

  const formBoxRegisterStyles: React.CSSProperties = {
    ...formBoxStyles,
    left: 0,
    visibility: 'hidden'
  };

  const formBoxRegisterActiveStyles: React.CSSProperties = {
    ...formBoxRegisterStyles,
    left: 0,
    visibility: 'visible'
  };

  const formStyles: React.CSSProperties = {
    width: '100%'
  };

  const h1Styles: React.CSSProperties = {
    fontSize: '36px',
    margin: '5px 0'
  };

  const inputBoxStyles: React.CSSProperties = {
    position: 'relative',
    margin: '15px 0'
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '13px 50px 13px 20px',
    background: '#eee',
    borderRadius: '8px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#333',
    fontWeight: 500
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px',
    color: '#333'
  };

  const forgotLinkStyles: React.CSSProperties = {
    margin: '-15px 0 15px'
  };

  const forgotLinkAStyles: React.CSSProperties = {
    fontSize: '14.5px',
    color: '#eee',
    textDecoration: 'none'
  };

  const btnStyles: React.CSSProperties = {
    width: '100%',
    height: '48px',
    backgroundColor: '#7494ec',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#fff',
    fontWeight: 600
  };

  const pStyles: React.CSSProperties = {
    fontSize: '14.5px',
    margin: '10px 0'
  };

  const socialIconsStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center'
  };

  const socialIconAStyles: React.CSSProperties = {
    display: 'inline-flex',
    padding: '10px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    fontSize: '24px',
    color: '#333',
    textDecoration: 'none',
    margin: '0 8px'
  };

  const checkboxStyles: React.CSSProperties = {
    margin: '5px 0',
    textAlign: 'left'
  };

  const checkboxInputStyles: React.CSSProperties = {
    marginRight: '10px'
  };

  const checkboxLabelStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#333'
  };

  const linkStyles: React.CSSProperties = {
    color: '#7494ec',
    textDecoration: 'underline'
  };

  const toggleBoxStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%'
  };

  const toggleBoxBeforeStyles: React.CSSProperties = {
    position: 'absolute',
    left: isActive ? '50%' : '-250%',
    width: '300%',
    height: '100%',
    background: '#7494ec',
    borderRadius: '150px',
    zIndex: 2,
    transition: '1.8s ease-in-out'
  };

  const togglePanelStyles: React.CSSProperties = {
    position: 'absolute',
    width: '50%',
    height: '100%',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  };

  const toggleLeftStyles: React.CSSProperties = {
    ...togglePanelStyles,
    left: isActive ? '-50%' : 0,
    transitionDelay: isActive ? '0.6s' : '1.2s'
  };

  const toggleRightStyles: React.CSSProperties = {
    ...togglePanelStyles,
    right: isActive ? 0 : '-50%',
    transitionDelay: isActive ? '1.2s' : '0.6s'
  };

  const togglePanelPStyles: React.CSSProperties = {
    marginBottom: '20px'
  };

  const toggleBtnStyles: React.CSSProperties = {
    width: '160px',
    height: '46px',
    background: 'transparent',
    border: '2px solid #fff',
    boxShadow: 'none',
    borderRadius: '8px',
    borderStyle: 'solid',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#fff',
    fontWeight: 600
  };

  const mediaQueries = `
    @media screen and (max-width: 650px) {
      .container {
        height: calc(100vh - 40px);
      }
      .form-box {
        bottom: 0;
        width: 100%;
        height: 70%;
      }
      .container.active .form-box {
        right: 0;
        bottom: 30%;
      }
      .toggle-before {
        left: 0;
        top: -270%;
        width: 100%;
        height: 300%;
      }
      .container.active .toggle-before {
        left: 0;
        top: 70%;
      }
      .toggle-panel {
        width: 100%;
        height: 30%;
      }
      .toggle-panel.toggle-left {
        top: 0;
      }
      .container.active .toggle-panel.toggle-left {
        left: 0;
        top: -30%;
      }
      .toggle-panel.toggle-right {
        right: 0;
        bottom: -30%;
      }
      .container.active .toggle-panel.toggle-right {
        bottom: 0;
      }
    }
    @media screen and (max-width: 450px) {
      .form-box {
        padding: 20px;
      }
      .toggle-panel h1, h1 {
        font-size: 30px;
      }
    }
  `;

  return (
    <div style={bodyStyles}>
      <style dangerouslySetInnerHTML={{ __html: mediaQueries }} />
      <div style={containerStyles} className={`container ${isActive ? "active" : ""}`}>
        {/* Login form */}
        <div style={isActive ? formBoxActiveStyles : formBoxStyles} className="form-box">
          <form style={formStyles}>
            <h1 style={h1Styles}>Login</h1>
            <div style={inputBoxStyles}>
              <input type="text" placeholder="Username" required style={inputStyles} />
              <i className="bx bxs-user" style={iconStyles}></i>
            </div>
            <div style={inputBoxStyles}>
              <input type="password" placeholder="Password" required style={inputStyles} />
              <i className="bx bxs-lock-alt" style={iconStyles}></i>
            </div>
            <div style={forgotLinkStyles}>
              <a href="#" style={forgotLinkAStyles}>Forgot password?</a>
            </div>
            <button type="submit" style={btnStyles}>
              Login
            </button>
            <p style={pStyles}>or login with social platforms</p>
            <div style={socialIconsStyles}>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
            </div>
          </form>
        </div>

        {/* Registration form */}
        <div style={isActive ? formBoxRegisterActiveStyles : formBoxRegisterStyles} className="form-box">
          <form style={formStyles}>
            <h1 style={h1Styles}>Register</h1>
            <div style={inputBoxStyles}>
              <input type="text" placeholder="Name" required style={inputStyles} />
              <i className="bx bxs-user" style={iconStyles}></i>
            </div>
            <div style={inputBoxStyles}>
              <input type="tel" placeholder="Phone" required style={inputStyles} />
              <i className="bx bxs-phone" style={iconStyles}></i>
            </div>
            <div style={inputBoxStyles}>
              <input type="email" placeholder="Email" required style={inputStyles} />
              <i className="bx bxs-envelope" style={iconStyles}></i>
            </div>
            <div style={inputBoxStyles}>
              <input type="password" placeholder="Create Password" required style={inputStyles} />
              <i className="bx bxs-lock-alt" style={iconStyles}></i>
            </div>
            <div style={checkboxStyles}>
              <input type="checkbox" id="terms" required style={checkboxInputStyles} />
              <label htmlFor="terms" style={checkboxLabelStyles}>I agree to the <a href="#" style={linkStyles}>Terms of Service</a> and <a href="#" style={linkStyles}>Privacy Policy</a>.</label>
            </div>
            <div style={checkboxStyles}>
              <input type="checkbox" id="location" required style={checkboxInputStyles} />
              <label htmlFor="location" style={checkboxLabelStyles}>I allow this app to access my location for health insights.</label>
            </div>
            <button type="submit" style={btnStyles}>
              Register
            </button>
            <p style={pStyles}>or Register with social platforms</p>
            <div style={socialIconsStyles}>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
              <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
            </div>
          </form>
        </div>

        {/* Toggle section */}
        <div style={toggleBoxStyles} className="toggle-box">
          <div style={toggleBoxBeforeStyles} className="toggle-before"></div>
          <div style={toggleLeftStyles} className="toggle-panel toggle-left">
            <h1 style={h1Styles}>Hello, Welcome!</h1>
            <p style={togglePanelPStyles}>Don't have an account?</p>
            <button
              type="button"
              style={toggleBtnStyles}
              onClick={() => setIsActive(true)}
            >
              Register
            </button>
          </div>
          <div style={toggleRightStyles} className="toggle-panel toggle-right">
            <h1 style={h1Styles}>Welcome Back!</h1>
            <p style={togglePanelPStyles}>Already have an account?</p>
            <button
              type="button"
              style={toggleBtnStyles}
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
