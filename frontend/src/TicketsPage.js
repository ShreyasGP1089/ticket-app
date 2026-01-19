import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from './config';

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy] = useState("createdAt");
  const [sortDirection] = useState("DESC");

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    avgTime: '0h'
  });

  const [categoryCounts, setCategoryCounts] = useState([]);

  const COLORS = ['#2A5C8C', '#4CAF50', '#FF6B6B', '#e28743', '#9932CC'];

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  const computeCategoryData = (tickets) => {
    const counts = {};
    tickets.forEach(ticket => {
      counts[ticket.category] = (counts[ticket.category] || 0) + 1;
    });
    const data = Object.keys(counts).map(category => ({
      name: category,
      value: counts[category]
    }));
    setCategoryCounts(data);
  };

  const fetchTickets = useCallback(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE_URL}/tickets/paginated`, {
      params: {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        sortDirection: sortDirection
      }
    })
      .then(response => {
        setTickets(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        computeCategoryData(response.data.content);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load tickets. Please try again.');
        setLoading(false);
        showToast('Failed to load tickets', 'error');
      });
  }, [currentPage, pageSize, sortBy, sortDirection, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const total = await axios.get(`${API_BASE_URL}/tickets/count`);
      const resolved = await axios.get(`${API_BASE_URL}/tickets/count/resolved`);
      const pending = await axios.get(`${API_BASE_URL}/tickets/count/pending`);
      const avgTime = await axios.get(`${API_BASE_URL}/avgduration`);

      setStats({
        total: total.data,
        resolved: resolved.data,
        pending: pending.data,
        avgTime: avgTime.data
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets, fetchStats]);

  const handleClose = async (ticketId) => {
    try {
      await axios.put(`${API_BASE_URL}/ticket/${ticketId}`);
      showToast('Ticket closed successfully!', 'success');
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error("Error updating ticket:", error);
      showToast('Failed to close ticket', 'error');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const categoryMatch = categoryFilter === "All" || ticket.category === categoryFilter;
    const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="App">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
          style={{ zIndex: 9999, minWidth: '300px', animation: 'slideInRight 0.3s ease' }}
          role="alert"
        >
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
          {toast.message}
        </div>
      )}

      <div className="d-flex justify-content-center py-5">
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div className="mb-4 text-center">
            <h2 className="ticket-heading" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2A5C8C' }}>
              📊 Tickets Dashboard
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              Manage and track your support tickets
            </p>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Filter by Category</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>All</option>
                <option>Technology</option>
                <option>Accounts</option>
                <option>Delivery</option>
                <option>Finance</option>
                <option>Product</option>
                <option>Refund</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Filter by Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Open</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          <div className="ticket-scroll-area border rounded p-3 mb-4 bg-white shadow-sm" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {loading ? (
              /* Loading Skeleton */
              <div className="row">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="col-md-6 mb-4">
                    <div className="card h-100" style={{ borderRadius: '12px' }}>
                      <div className="card-body">
                        <div className="placeholder-glow">
                          <span className="placeholder col-7 mb-2"></span>
                          <span className="placeholder col-4"></span>
                          <br />
                          <span className="placeholder col-8 mb-3"></span>
                          <br />
                          <span className="placeholder col-full"></span>
                          <span className="placeholder col-9"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <p className="text-danger mt-3">{error}</p>
                <button className="btn btn-primary" onClick={fetchTickets}>
                  <i className="bi bi-arrow-clockwise me-2"></i>Retry
                </button>
              </div>
            ) : (
              <div className="row">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map(ticket => (
                    <div key={ticket.id} className="col-md-6 mb-4" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div
                        className="card shadow-sm h-100 bg-white"
                        style={{
                          borderRadius: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <div className="card-body d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5 className="card-title mb-0" style={{ color: '#2A5C8C', fontWeight: '600' }}>
                                🎫 {ticket.ticketId}
                              </h5>
                              <small className="text-muted">
                                <i className="bi bi-calendar3 me-1"></i>
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </small>
                            </div>

                            <span className={`badge ${ticket.status === 'Resolved' ? 'bg-success' : 'bg-primary'} mb-3`}>
                              <i className={`bi bi-${ticket.status === 'Resolved' ? 'check-circle' : 'hourglass-split'} me-1`}></i>
                              {ticket.status}
                            </span>

                            <div className="mb-2">
                              <small className="text-muted"><i className="bi bi-person me-1"></i>From: </small>
                              <span className="text-dark fw-medium">{ticket.senderEmail}</span>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block mb-1"><i className="bi bi-chat-left-text me-1"></i>Description:</small>
                              <div
                                className="text-dark mb-1"
                                style={{
                                  fontSize: '0.9rem',
                                  lineHeight: '1.5',
                                  maxHeight: '60px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {ticket.message.length > 100 ? ticket.message.substring(0, 100) + '...' : ticket.message}
                              </div>
                              {ticket.message.length > 100 && (
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  style={{ fontSize: '0.85rem' }}
                                  onClick={() => handleShowModal(ticket)}
                                >
                                  Read More
                                </button>
                              )}
                            </div>

                            <div className="mt-2">
                              <small className="text-muted"><i className="bi bi-tag me-1"></i>Category: </small>
                              <span className="badge bg-secondary">{ticket.category}</span>
                              <small className="text-muted ms-3">
                                <i className="bi bi-percent me-1"></i>{(ticket.confidence * 100).toFixed(1)}% confident
                              </small>
                            </div>
                          </div>

                          {/* Close Button */}
                          {ticket.status !== 'Resolved' && (
                            <div className="text-end mt-3">
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleClose(ticket.id)}
                                style={{ transition: 'all 0.2s' }}
                              >
                                <i className="bi bi-check2-circle me-1"></i>
                                Close Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p className="text-muted mt-3" style={{ fontSize: '1.1rem' }}>No tickets found matching your criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mb-4 px-3">
            <div>
              <span className="text-muted">
                Showing {tickets.length} of {totalElements} tickets
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="bi bi-chevron-left"></i> Previous
              </button>

              <span className="mx-3">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                className="btn btn-outline-primary btn-sm"
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
            <div>
              <select
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0); // Reset to first page
                }}
                style={{ width: 'auto' }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Stats Section */}
          <div className="row mb-5">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100 bg-white">
                <div className="card-body">
                  <h5 className="card-title text-center mb-4">Ticket Distribution by Category</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryCounts}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {categoryCounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="col-md-6">
              <div className="row h-100">
                <div className="col-6 mb-4">
                  <div className="card stat-card h-100 text-center p-3">
                    <i className="bi bi-ticket-perforated fs-2 mb-2 text-primary"></i>
                    <h1 className="display-5">{stats.total}</h1>
                    <p className="text-muted mb-0">Total Tickets</p>
                  </div>
                </div>
                <div className="col-6 mb-4">
                  <div className="card stat-card h-100 text-center p-3">
                    <i className="bi bi-check-circle fs-2 mb-2 text-success"></i>
                    <h1 className="display-5">{stats.resolved}</h1>
                    <p className="text-muted mb-0">Resolved Tickets</p>
                  </div>
                </div>
                <div className="col-6 mb-4">
                  <div className="card stat-card h-100 text-center p-3">
                    <i className="bi bi-clock-history fs-2 mb-2 text-warning"></i>
                    <h1 className="display-5">{stats.pending}</h1>
                    <p className="text-muted mb-0">Pending Tickets</p>
                  </div>
                </div>
                <div className="col-6 mb-4">
                  <div className="card stat-card h-100 text-center p-3">
                    <i className="bi bi-speedometer2 fs-2 mb-2 text-info"></i>
                    <h1 className="display-5">{stats.avgTime}</h1>
                    <p className="text-muted mb-0">Avg. Resolution Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Contact Section */}
      <footer id="contact" className="bg-dark text-light py-5 mt-5">
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

      {/* Ticket Detail Modal */}
      {showModal && selectedTicket && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>

                {/* Header */}
                <div className="modal-header text-white p-4" style={{ background: 'linear-gradient(135deg, #2A5C8C 0%, #4a90e2 100%)' }}>
                  <h5 className="modal-title d-flex align-items-center fw-bold">
                    <i className="bi bi-ticket-detailed-fill me-2 fs-4"></i>
                    Ticket Details
                    <span className="ms-3 badge bg-white text-primary rounded-pill px-3 py-2" style={{ fontSize: '0.85rem' }}>
                      #{selectedTicket.ticketId}
                    </span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body p-4 bg-light">

                  {/* Info Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-white rounded-3 shadow-sm border h-100 d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 me-3 d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                          <i className="bi bi-person-circle fs-4 text-primary"></i>
                        </div>
                        <div>
                          <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Sender</small>
                          <span className="fw-bold text-dark">{selectedTicket.senderEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-white rounded-3 shadow-sm border h-100 d-flex align-items-center">
                        <div
                          className={`rounded-circle me-3 d-flex justify-content-center align-items-center ${selectedTicket.status === 'Resolved' ? 'bg-success bg-opacity-10' : 'bg-warning bg-opacity-10'}`}
                          style={{ width: '50px', height: '50px', flexShrink: 0 }}
                        >
                          <i className={`bi bi-${selectedTicket.status === 'Resolved' ? 'check-circle-fill text-success' : 'hourglass-split text-warning'} fs-4`}></i>
                        </div>
                        <div>
                          <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Status</small>
                          <span className={`badge ${selectedTicket.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-white rounded-3 shadow-sm border h-100 d-flex align-items-center">
                        <div className="rounded-circle bg-secondary bg-opacity-10 me-3 d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                          <i className="bi bi-tag-fill fs-4 text-secondary"></i>
                        </div>
                        <div>
                          <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Category</small>
                          <span className="fw-bold text-dark me-2">{selectedTicket.category}</span>
                          <small className="text-muted">({(selectedTicket.confidence * 100).toFixed(1)}% match)</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-white rounded-3 shadow-sm border h-100 d-flex align-items-center">
                        <div className="rounded-circle bg-info bg-opacity-10 me-3 d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                          <i className="bi bi-calendar-event-fill fs-4 text-info"></i>
                        </div>
                        <div>
                          <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Created On</small>
                          <span className="fw-bold text-dark">
                            {new Date(selectedTicket.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Section */}
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                      <h6 className="text-muted text-uppercase small fw-bold mb-0">
                        <i className="bi bi-chat-quote-fill me-2 text-primary"></i>
                        Message Content
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="p-3 bg-light rounded-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: '#4a4a4a', lineHeight: '1.6' }}>
                        {selectedTicket.message}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="modal-footer bg-white border-top-0 p-4">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={handleCloseModal}>Close</button>
                  {selectedTicket.status !== 'Resolved' && (
                    <button
                      type="button"
                      className="btn btn-success rounded-pill px-4 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', border: 'none' }}
                      onClick={() => {
                        handleClose(selectedTicket.id);
                        handleCloseModal();
                      }}
                    >
                      <i className="bi bi-check2-circle me-2"></i>Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )
      }
    </div >
  );
}

export default TicketsPage;
