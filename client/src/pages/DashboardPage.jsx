import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShops, getReports, giveBadge, removeBadge, updateReportStatus, API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import '../styles/global.css';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('shops');
  const [shops, setShops] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [shopsRes, reportsRes] = await Promise.all([
          getShops({ limit: 50 }),
          getReports()
        ]);
        setShops(shopsRes.data.shops);
        setReports(reportsRes.data.reports);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGiveBadge = async (shopId) => {
    setActionLoading(shopId + '_give');
    try {
      await giveBadge(shopId);
      setShops((prev) =>
        prev.map((s) => (s._id === shopId ? { ...s, hasGovtBadge: true } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to give badge');
    } finally {
      setActionLoading('');
    }
  };

  const handleRemoveBadge = async (shopId) => {
    setActionLoading(shopId + '_remove');
    try {
      await removeBadge(shopId);
      setShops((prev) =>
        prev.map((s) => (s._id === shopId ? { ...s, hasGovtBadge: false } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove badge');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkReviewed = async (reportId) => {
    setActionLoading(reportId);
    try {
      await updateReportStatus(reportId);
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: 'reviewed' } : r))
      );
    } catch {
      toast.error('Failed to update report status');
    } finally {
      setActionLoading('');
    }
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const badgeShops = shops.filter((s) => s.hasGovtBadge);

  return (
    <div style={{background:'var(--bg-page)',minHeight:'100vh',paddingBottom:48}}>
      <main className="dashboard-page">
        {/* Header */}
        <div className="dashboard-header">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', marginBottom: 8 }}
            aria-label="Go back"
          >
            ←
          </button>
          <h1>🏛️ Govt Dashboard</h1>
          <p>
            {user?.role === 'admin' ? 'Admin' : 'Govt Official'} · {user?.name}
          </p>
        </div>

        {error && <div className="error-msg" style={{ margin: '0 16px' }}>{error}</div>}

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{shops.length}</div>
            <div className="dashboard-stat-label">Total Shops</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value" style={{ color: 'var(--success)' }}>
              {badgeShops.length}
            </div>
            <div className="dashboard-stat-label">Verified</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value" style={{ color: 'var(--warning)' }}>
              {pendingReports.length}
            </div>
            <div className="dashboard-stat-label">Pending Reports</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs" role="tablist">
          <button
            className={`dashboard-tab ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
            role="tab"
            aria-selected={activeTab === 'shops'}
          >
            All Shops
          </button>
          <button
            className={`dashboard-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
            role="tab"
            aria-selected={activeTab === 'reports'}
          >
            Reports {pendingReports.length > 0 && `(${pendingReports.length})`}
          </button>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : activeTab === 'shops' ? (
          <div className="dashboard-list" role="tabpanel">
            {shops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏪</div>
                <h3>No shops yet</h3>
              </div>
            ) : (
              shops.map((shop) => (
                <div key={shop._id} className="dashboard-shop-card">
                  <div className="dashboard-shop-top">
                    <div>
                      <div className="dashboard-shop-name">{shop.name}</div>
                      <div className="dashboard-shop-meta">
                        {shop.category} · {shop.area}, {shop.city}
                      </div>
                    </div>
                    {shop.hasGovtBadge && (
                      <span className="govt-badge">✅ Verified</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-dark)' }}>
                      {shop.averageRating > 0 ? `⭐ ${shop.averageRating.toFixed(1)}` : 'No ratings'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      · {shop.totalReviews} review{shop.totalReviews !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="dashboard-shop-actions">
                    <button
                      className="btn-primary"
                      style={{ fontSize: 13, padding: '8px 12px' }}
                      onClick={() => navigate(`/shop/${shop._id}`)}
                    >
                      View Shop
                    </button>
                    {shop.hasGovtBadge ? (
                      <button
                        className="btn-remove-badge"
                        onClick={() => handleRemoveBadge(shop._id)}
                        disabled={actionLoading === shop._id + '_remove'}
                      >
                        {actionLoading === shop._id + '_remove' ? '...' : '❌ Remove Badge'}
                      </button>
                    ) : (
                      <button
                        className="btn-give-badge"
                        onClick={() => handleGiveBadge(shop._id)}
                        disabled={actionLoading === shop._id + '_give'}
                      >
                        {actionLoading === shop._id + '_give' ? '...' : '✅ Give Badge'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="dashboard-list" role="tabpanel">
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No reports yet</h3>
                <p>All clear! No shops have been reported.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report._id}
                  className={`report-card ${report.status === 'reviewed' ? 'reviewed' : ''}`}
                >
                  <div className="report-card-header">
                    <div>
                      <div className="report-shop-name">
                        {report.shopId?.name || 'Unknown Shop'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {report.shopId?.city} · {report.shopId?.category}
                      </div>
                    </div>
                    <span className={`report-status-badge ${report.status}`}>
                      {report.status === 'pending' ? '⏳ Pending' : '✅ Reviewed'}
                    </span>
                  </div>

                  <div className="report-reason">{report.reason}</div>
                  <div className="report-description">{report.description}</div>

                  {report.photo && (
                    <img
                      src={`${API_URL}${report.photo}`}
                      alt="Report evidence"
                      style={{ maxHeight: 150, borderRadius: 'var(--radius-sm)', marginBottom: 8 }}
                    />
                  )}

                  <div className="report-meta">
                    Reported by {report.userId?.name || 'User'} ·{' '}
                    {new Date(report.createdAt).toLocaleDateString('en-IN')}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn-primary"
                      style={{ fontSize: 13, padding: '8px 12px' }}
                      onClick={() => navigate(`/shop/${report.shopId?._id}`)}
                    >
                      View Shop
                    </button>
                    {report.status === 'pending' && (
                      <button
                        className="btn-mark-reviewed"
                        onClick={() => handleMarkReviewed(report._id)}
                        disabled={actionLoading === report._id}
                      >
                        {actionLoading === report._id ? '...' : '✓ Mark Reviewed'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
