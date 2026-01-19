import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import TicketsPage from './TicketsPage';
import logo from './assets/logo.png';
import preview from './assets/preview.png';
import step1 from './assets/step1.png';
import step2 from './assets/step2.png';
import step3 from './assets/step3.png';
import hero from './assets/hero.png';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Shared Header Component
function Header() {
  return (
    <header className="header-strip shadow-sm">
      <div className="container">
        <div className="row align-items-center py-2">
          {/* Logo + Brand */}
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <img src={logo} alt="ResolveRight Logo" className="logo me-3" />
              <Link to="/" className="text-decoration-none">
                <div>
                  <h1 className="brand-title mb-0">ResolveRight</h1>
                  <p className="brand-tagline mb-0">AI-Powered Support</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="col-md-8">
            <nav className="d-flex justify-content-end align-items-center gap-1">
              <Link to="/" className="nav-link-custom">
                <i className="bi bi-house-door me-2"></i>Home
              </Link>
              <Link to="/tickets" className="nav-link-custom">
                <i className="bi bi-ticket-perforated me-2"></i>Tickets
              </Link>
              <a href="#contact" className="nav-link-custom">
                <i className="bi bi-envelope me-2"></i>Contact
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

// Home Page
function HomePage() {
  return (
    <>
      {/* Split Section */}
      <section className="split-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6 d-flex flex-column justify-content-center">
              <div className="content-block mt-5">
                <h1 className="left-split-heading mb-3">ResolveRight: Right Solutions, Right Now</h1>
                <p className="left-split-paragraph mb-4">
                  ResolveRight is an AI-powered support automation platform that transforms customer service operations through intelligent issue classification, precision routing, and resolution-first workflows.
                </p>
                <div className="d-flex justify-content-center gap-4 ps-5">
                  <button className="btn btn-primary">Get Started</button>
                  <Link to="/tickets" className="btn btn-outline-secondary">View Tickets</Link>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="image-container">
                <img src={preview} alt="Analytics" className="img-fluid rounded-3" />
                <p className="image-caption text-muted mt-2 text-center">
                  From request to resolution — lightning fast
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold mb-4 text-start" style={{ fontSize: "3rem", color: "#007BFF" }}>
            How ResolveRight Works
          </h2>
          <div className="row mb-5 gx-4">
            {[{ src: step1, title: "Step 1: Auto-Classification" },
            { src: step2, title: "Step 2: Precision Routing" },
            { src: step3, title: "Step 3: Fast Resolution" }].map((step, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="p-3 border rounded bg-white shadow-sm h-100 d-flex flex-column align-items-center text-center">
                  <img src={step.src} alt={step.title} className="img-fluid rounded mb-3" style={{ maxHeight: '220px', objectFit: 'cover' }} />
                  <p className="fw-semibold fs-5">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="row align-items-center">
            <div className="col-md-8">
              <p className="mb-0 text-start">
                ResolveRight uses AI to analyze and auto-assign tickets from multiple channels.
                <br />
                <strong>Try it now:</strong> Send an email to <a href="mailto:resolverright4@gmail.com" className="fw-bold text-decoration-none">resolverright4@gmail.com</a> to see it in action!
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button className="btn btn-primary btn-lg">Watch Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <header className="hero-section py-5">
        <div className="container text-center">
          <h1 className="display-4">Where precision meets customer care</h1>
          <p className="lead mt-3">
            Exclusively designed for support teams, our AI-powered system analyzes incoming requests across email, WhatsApp, and multiple channels, accurately categorizing issues, and routing them to optimally skilled agents in real-time.
          </p>
          <div className="mt-4">
            <img src={hero} alt="Hero" className="img-fluid rounded" />
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Quantifying Operational Excellence</h2>
          <div className="row text-center">
            {[{
              icon: "bi-bar-chart-fill", color: "text-primary", stat: "99.1%", desc: "Classification Accuracy"
            }, {
              icon: "bi-stopwatch-fill", color: "text-success", stat: "800ms", desc: "Average Assignment Time"
            }, {
              icon: "bi-emoji-smile-fill", color: "text-warning", stat: "89%", desc: "Higher Satisfaction"
            }, {
              icon: "bi-graph-up-arrow", color: "text-danger", stat: "450K", desc: "Weekly Updates"
            }].map((item, index) => (
              <div className="col-md-3 mb-4" key={index}>
                <div className="p-4 border rounded bg-white shadow-sm h-100">
                  <i className={`bi ${item.icon} display-6 ${item.color} mb-2`}></i>
                  <h3>{item.stat}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Contact Section */}
      <footer id="contact" className="bg-dark text-light py-5">
        <div className="container">
          <div className="row">
            {/* Company Info */}
            <div className="col-md-4 mb-4">
              <h5 className="mb-3">
                <i className="bi bi-gear-fill me-2"></i>ResolveRight
              </h5>
              <p className="text-muted">
                AI-powered support automation platform delivering intelligent issue classification and precision routing.
              </p>
              <div className="social-links mt-3">
                <button onClick={() => window.open('https://linkedin.com', '_blank')} className="btn btn-link text-light me-3 p-0" title="LinkedIn" aria-label="LinkedIn">
                  <i className="bi bi-linkedin fs-4"></i>
                </button>
                <button onClick={() => window.open('https://twitter.com', '_blank')} className="btn btn-link text-light me-3 p-0" title="Twitter" aria-label="Twitter">
                  <i className="bi bi-twitter fs-4"></i>
                </button>
                <button onClick={() => window.open('https://github.com', '_blank')} className="btn btn-link text-light me-3 p-0" title="GitHub" aria-label="GitHub">
                  <i className="bi bi-github fs-4"></i>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-md-4 mb-4">
              <h5 className="mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/" className="text-muted text-decoration-none">
                    <i className="bi bi-chevron-right me-2"></i>Home
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/tickets" className="text-muted text-decoration-none">
                    <i className="bi bi-chevron-right me-2"></i>View Tickets
                  </Link>
                </li>
                <li className="mb-2">
                  <a href="#about" className="text-muted text-decoration-none">
                    <i className="bi bi-chevron-right me-2"></i>About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-md-4 mb-4">
              <h5 className="mb-3">Contact Us</h5>
              <ul className="list-unstyled">
                <li className="mb-2 text-muted">
                  <i className="bi bi-envelope-fill me-2"></i>
                  support@resolveright.com
                </li>
                <li className="mb-2 text-muted">
                  <i className="bi bi-telephone-fill me-2"></i>
                  +1 (555) 123-4567
                </li>
                <li className="mb-2 text-muted">
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  San Francisco, CA
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <hr className="bg-secondary my-4" />
          <div className="row">
            <div className="col-12 text-center text-muted">
              <p className="mb-0">
                © {new Date().getFullYear()} ResolveRight. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// Main App
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tickets" element={<TicketsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
