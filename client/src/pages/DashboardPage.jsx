import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShops, getReports, giveBadge, removeBadge, updateReportStatus, API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { 
  ArrowLeft, LayoutDashboard, ShieldCheck, AlertCircle, 
  Users, Store, BarChart3, Clock, Settings, 
  MoreHorizontal, CheckCircle2, XCircle, Search, 
  TrendingUp, TrendingDown, Flag, Star
} from 'lucide-react';
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
    <div className="dashboard-page-container">
      {/* Sidebar - Desktop Only Concept */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"><ShieldCheck size={24} /></div>
          <span>Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'shops' ? 'active' : ''} onClick={() => setActiveTab('shops')}>
            <Store size={18} /> Shops
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            <Flag size={18} /> Reports {pendingReports.length > 0 && <span className="notif-dot" />}
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={18} /> Users
          </button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={18} /> Analytics
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-top-header">
          <div className="header-left">
            <button className="mobile-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
            <div>
              <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p className="header-sub">Manage system data and moderation</p>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-user-pill">
              <div className="avatar-small">{user?.name?.[0]}</div>
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <section className="stats-grid">
          <div className="stat-box">
            <div className="stat-info">
              <span className="stat-label">Total Shops</span>
              <span className="stat-value">{shops.length}</span>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(91, 79, 232, 0.1)', color: 'var(--brand)' }}>
              <Store size={22} />
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-info">
              <span className="stat-label">Verified Shops</span>
              <span className="stat-value">{badgeShops.length}</span>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-info">
              <span className="stat-label">Pending Reports</span>
              <span className="stat-value">{pendingReports.length}</span>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)' }}>
              <AlertCircle size={22} />
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <div className="dashboard-content-card">
          {/* Mobile Tabs */}
          <div className="mobile-tabs">
            {['shops', 'reports', 'users', 'analytics'].map(t => (
              <button key={t} className={activeTab === t ? 'active' : ''} onClick={() => setActiveTab(t)}>
                {t === 'shops' && <Store size={16} />}
                {t === 'reports' && <Flag size={16} />}
                {t === 'users' && <Users size={16} />}
                {t === 'analytics' && <BarChart3 size={16} />}
                <span>{t}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="dashboard-loader">
              <div className="spinner" />
              <p>Fetching latest data...</p>
            </div>
          ) : activeTab === 'shops' ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shop Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map(shop => (
                    <tr key={shop._id}>
                      <td><span className="font-bold">{shop.name}</span></td>
                      <td><span className="badge-outline">{shop.category}</span></td>
                      <td>{shop.city}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star size={12} fill="var(--accent)" color="var(--accent)" />
                          <span>{shop.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td>
                        {shop.hasGovtBadge ? 
                          <span className="status-pill success"><CheckCircle2 size={12} /> Verified</span> : 
                          <span className="status-pill neutral">Standard</span>
                        }
                      </td>
                      <td>
                        <div className="table-actions">
                          {shop.hasGovtBadge ? (
                            <button className="action-btn remove" onClick={() => handleRemoveBadge(shop._id)} disabled={actionLoading.includes(shop._id)}>
                              Revoke
                            </button>
                          ) : (
                            <button className="action-btn approve" onClick={() => handleGiveBadge(shop._id)} disabled={actionLoading.includes(shop._id)}>
                              Verify
                            </button>
                          )}
                          <button className="action-btn view" onClick={() => navigate(`/shop/${shop._id}`)}>Details</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="reports-grid">
              {reports.map(report => (
                <div key={report._id} className={`report-item-card ${report.status}`}>
                  <div className="report-item-header">
                    <div className="report-item-meta">
                      <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
                      <span className={`report-badge ${report.status}`}>{report.status}</span>
                    </div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                  </div>
                  <h3 className="report-item-title">{report.shopId?.name || 'Unknown Shop'}</h3>
                  <p className="report-item-reason">{report.reason}</p>
                  <p className="report-item-desc">{report.description}</p>
                  <div className="report-item-footer">
                    <div className="reporter-info">By {report.userId?.name}</div>
                    <div className="report-item-actions">
                      {report.status === 'pending' && (
                        <button className="btn-success-small" onClick={() => handleMarkReviewed(report._id)}>Resolve</button>
                      )}
                      <button className="btn-outline-small" onClick={() => navigate(`/shop/${report.shopId?._id}`)}>View Shop</button>
                    </div>
                  </div>
                </div>
              ))}
              {reports.length === 0 && <div className="empty-dash">No reports to display</div>}
            </div>
          ) : activeTab === 'users' ? (
            <div className="placeholder-section">
              <Users size={48} className="opacity-20" />
              <h3>User Management coming soon</h3>
              <p>Advanced controls for user roles, verification, and moderation.</p>
            </div>
          ) : (
            <div className="analytics-section">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Growth</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">+12%</span>
                    <span className="text-green-500 flex items-center text-sm mb-1"><TrendingUp size={14} /> 2.4%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">New users this week</p>
                </div>
                <div className="analytics-card">
                  <h4>Engagement</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">84%</span>
                    <span className="text-green-500 flex items-center text-sm mb-1"><TrendingUp size={14} /> 5.1%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Review completion rate</p>
                </div>
              </div>
              <div className="chart-placeholder">
                <BarChart3 size={48} className="opacity-10" />
                <span>Interactive Charts Integration (Phase 5)</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
