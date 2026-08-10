import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLibrarianStats } from '../api/transactionService';
import { IssueModal } from '../components/librarian/IssueModal';
import { ReturnModal } from '../components/librarian/ReturnModal';
import { BookFormModal } from '../components/librarian/BookFormModal';
import {
    LayoutDashboard, BookOpen, Users, ArrowRightLeft, RotateCcw,
    CalendarClock, FolderTree, BarChart3, Settings, LogOut,
    Search, Bell, TrendingUp, Library, AlertTriangle,
    BookPlus, UserPlus, ClipboardList, Package, Loader2, ChevronRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './LibrarianDashboard.css';

type NavId = 'dashboard' | 'books' | 'members' | 'borrowing' | 'returns' | 'reservations' | 'categories' | 'reports' | 'settings';
type TimeRange = '7d' | '30d' | '6m';

const NAV_ITEMS: { id: NavId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'borrowing', label: 'Borrowing', icon: ArrowRightLeft },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'reservations', label: 'Reservations', icon: CalendarClock },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
];

interface DashboardStats {
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    totalBookTitles: number;
    activeIssues: number;
    overdueBorrows: number;
    totalMembers: number;
    totalReservations: number;
    recentAdditions: number;
    availablePercent: number;
}

interface Transaction {
    id: string;
    student: string;
    book: string;
    action: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    status: string;
}

interface OverdueRecord {
    id: string;
    student: string;
    book: string;
    dueDate: string;
    daysOverdue: number;
}

interface ChartDataPoint { name: string; borrowings: number; }
interface ChartDataSets { '7d': ChartDataPoint[]; '30d': ChartDataPoint[]; '6m': ChartDataPoint[]; }
interface PopularCategory { name: string; borrows: number; }
interface BookInventory {
    id: string; title: string; author: string; category: string;
    availableCopies: number; totalCopies: number; status: string;
}

const PlaceholderRoute: React.FC<{ title: string; iconId: string }> = ({ title, iconId }) => {
    const Icon = NAV_ITEMS.find(i => i.id === iconId)?.icon || LayoutDashboard;
    return (
        <div className="ld-placeholder">
            <Icon size={48} className="ld-placeholder-icon" />
            <h2>{title}</h2>
            <p>This module is currently being upgraded for the Lumina Library System.</p>
        </div>
    );
};

export const LibrarianDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active nav from URL structure (e.g. /librarian/books)
    const currentPath = location.pathname.split('/').pop();
    const activeNav = (currentPath === 'librarian' || currentPath === '') ? 'dashboard' : currentPath;

    const [activeModal, setActiveModal] = useState<'issue' | 'return' | 'book' | null>(null);
    const [activeTime, setActiveTime] = useState<TimeRange>('7d');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalBooks: 0, availableBooks: 0, borrowedBooks: 0, totalBookTitles: 0,
        activeIssues: 0, overdueBorrows: 0, totalMembers: 0,
        totalReservations: 0, recentAdditions: 0, availablePercent: 100,
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [overdueRecords, setOverdueRecords] = useState<OverdueRecord[]>([]);
    const [chartData, setChartData] = useState<ChartDataSets>({ '7d': [], '30d': [], '6m': [] });
    const [categories, setCategories] = useState<PopularCategory[]>([]);
    const [inventory, setInventory] = useState<BookInventory[]>([]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getLibrarianStats();
            setStats(data.stats);
            setRecentTransactions(data.recentTransactions || []);
            setOverdueRecords(data.overdueRecords || []);
            if (data.chartData) setChartData(data.chartData);
            if (data.popularCategories) setCategories(data.popularCategories);
            if (data.inventoryPreview) setInventory(data.inventoryPreview);
        } catch (err) {
            console.error('Failed to fetch librarian stats', err);
            setError('Failed to load dashboard data. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'LIBRARIAN') {
            window.location.href = '/';
            return;
        }
        fetchStats();
    }, [user]);

    const handleModalClose = () => {
        setActiveModal(null);
        fetchStats();
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'L';

    // Collection Data for Pie Chart
    const collectionData = [
        { name: 'Available', value: stats.availableBooks },
        { name: 'Borrowed', value: stats.borrowedBooks > stats.overdueBorrows ? stats.borrowedBooks - stats.overdueBorrows : 0 },
        { name: 'Reserved', value: stats.totalReservations },
        { name: 'Overdue', value: stats.overdueBorrows }
    ].filter(d => d.value > 0);
    const pieColors = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

    const handleNavClick = (id: string) => {
        if (id === 'dashboard') {
            navigate('/librarian');
        } else {
            navigate(`/librarian/${id}`);
        }
    };

    return (
        <div className="ld-shell">
            {/* ═══ Sidebar ═══ */}
            <aside className="ld-sidebar">
                <div className="ld-sidebar-brand">
                    <div className="brand-icon">L</div>
                    <div>
                        <div className="brand-text">Lumina</div>
                    </div>
                </div>

                <nav className="ld-sidebar-nav">
                    <div className="ld-nav-section">
                        <div className="ld-nav-label">Main</div>
                        {NAV_ITEMS.slice(0, 6).map(item => (
                            <button
                                key={item.id}
                                className={`ld-nav-item ${activeNav === item.id ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.id)}
                            >
                                <item.icon className="ld-nav-icon" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="ld-nav-section">
                        <div className="ld-nav-label">System</div>
                        {NAV_ITEMS.slice(6).map(item => (
                            <button
                                key={item.id}
                                className={`ld-nav-item ${activeNav === item.id ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.id)}
                            >
                                <item.icon className="ld-nav-icon" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="ld-sidebar-footer">
                    <button className="ld-nav-item logout" onClick={handleLogout}>
                        <LogOut className="ld-nav-icon" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ═══ Main Area ═══ */}
            <div className="ld-main">
                {/* ── Header ── */}
                <header className="ld-header">
                    <div className="ld-header-left">
                        <h1>{greeting}, {user?.name?.split(' ')[0] || 'Librarian'}.</h1>
                        <p>Here's what's happening at Lumina today</p>
                    </div>

                    <div className="ld-header-right">
                        <div className="ld-search">
                            <Search className="ld-search-icon" size={18} />
                            <input type="text" placeholder="Search tasks or books..." />
                        </div>

                        <button className="ld-icon-btn">
                            <Bell size={18} />
                        </button>

                        <div className="ld-profile-area">
                            <div className="ld-profile-avatar">{initials}</div>
                            <div className="ld-profile-info">
                                <span className="ld-profile-name">{user?.name || 'Admin'}</span>
                                <span className="ld-profile-role">Librarian</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="ld-content-area">
                    <Routes>
                        <Route path="/" element={
                            loading ? (
                                <div className="ld-loader">
                                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--ld-accent-primary)' }} />
                                </div>
                            ) : error ? (
                                <div className="ld-error">
                                    <AlertTriangle size={48} style={{ marginBottom: '1rem', margin: '0 auto', display: 'block' }} />
                                    <h2>{error}</h2>
                                    <button onClick={fetchStats} className="ld-btn-primary" style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px' }}>Retry</button>
                                </div>
                            ) : (
                                <>
                                    {/* ── 1. Statistics ── */}
                                    <div className="ld-stats-container">
                                        <div className="ld-stat-card primary">
                                            <div className="ld-stat-header">Total Books</div>
                                            <div className="ld-stat-value">{stats.totalBooks.toLocaleString()}</div>
                                            <div className="ld-stat-sub">
                                                <Library className="ld-stat-icon-small" /> {stats.totalBookTitles} titles
                                            </div>
                                        </div>

                                        <div className="ld-stat-card success">
                                            <div className="ld-stat-header">Available</div>
                                            <div className="ld-stat-value">{stats.availableBooks.toLocaleString()}</div>
                                            <div className="ld-stat-sub">
                                                <TrendingUp className="ld-stat-icon-small" /> {stats.availablePercent}% available
                                            </div>
                                        </div>

                                        <div className="ld-stat-card neutral">
                                            <div className="ld-stat-header">Active Borrows</div>
                                            <div className="ld-stat-value">{stats.activeIssues.toLocaleString()}</div>
                                            <div className="ld-stat-sub">
                                                <ArrowRightLeft className="ld-stat-icon-small" /> Currently borrowed
                                            </div>
                                        </div>

                                        <div className="ld-stat-card danger">
                                            <div className="ld-stat-header">Overdue</div>
                                            <div className="ld-stat-value">{stats.overdueBorrows.toLocaleString()}</div>
                                            <div className="ld-stat-sub">
                                                <AlertTriangle className="ld-stat-icon-small" /> Needs attention
                                            </div>
                                        </div>

                                        <div className="ld-stat-card primary">
                                            <div className="ld-stat-header">Members</div>
                                            <div className="ld-stat-value">{stats.totalMembers.toLocaleString()}</div>
                                            <div className="ld-stat-sub">
                                                <Users className="ld-stat-icon-small" /> Registered students
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── 2. Analytics & Quick Actions ── */}
                                    <div className="ld-dashboard-grid ld-grid-row-1">
                                        {/* Borrowing Analytics (Spans 2 columns usually, or just scale down) */}
                                        <div className="ld-panel ld-span-2">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Borrowing Activity</div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {(['7d', '30d', '6m'] as TimeRange[]).map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => setActiveTime(r)}
                                                            style={{
                                                                background: activeTime === r ? 'var(--ld-accent-primary-light)' : 'transparent',
                                                                color: activeTime === r ? 'var(--ld-accent-primary)' : 'var(--ld-text-secondary)',
                                                                border: 'none', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                                            }}
                                                        >
                                                            {r.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ height: '220px', width: '100%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartData[activeTime]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="var(--ld-accent-primary)" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="var(--ld-accent-primary)" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ld-text-tertiary)' }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fontSize: 12, fill: 'var(--ld-text-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                        <Area type="monotone" dataKey="borrowings" stroke="var(--ld-accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" activeDot={{ r: 6, fill: 'var(--ld-accent-primary)', stroke: 'white', strokeWidth: 2 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="ld-panel">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Quick Actions</div>
                                            </div>
                                            <div className="ld-quick-actions-grid">
                                                <div className="ld-action-card" onClick={() => setActiveModal('book')}>
                                                    <div className="ld-action-icon"><BookPlus size={20} /></div>
                                                    Add Book
                                                </div>
                                                <div className="ld-action-card" onClick={() => setActiveModal('issue')}>
                                                    <div className="ld-action-icon"><ArrowRightLeft size={20} /></div>
                                                    Issue Book
                                                </div>
                                                <div className="ld-action-card" onClick={() => setActiveModal('return')}>
                                                    <div className="ld-action-icon green"><RotateCcw size={20} /></div>
                                                    Return Book
                                                </div>
                                                <div className="ld-action-card" onClick={() => handleNavClick('members')}>
                                                    <div className="ld-action-icon"><UserPlus size={20} /></div>
                                                    Manage Members
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── 3. Overview & Categories ── */}
                                    <div className="ld-dashboard-grid ld-grid-row-2">

                                        {/* Collection Overview */}
                                        <div className="ld-panel">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Collection Overview</div>
                                            </div>
                                            <div style={{ height: '220px', display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '50%', height: '100%' }}>
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie
                                                                data={collectionData}
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={2}
                                                                dataKey="value"
                                                            >
                                                                {collectionData.map((_entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div style={{ width: '50%', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {collectionData.map((d, i) => (
                                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ld-text-secondary)', fontWeight: 500 }}>
                                                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: pieColors[i % pieColors.length] }} />
                                                                {d.name}
                                                            </span>
                                                            <span style={{ fontWeight: 700, color: 'var(--ld-text-primary)' }}>{d.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Popular Categories */}
                                        <div className="ld-panel">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Popular Categories</div>
                                            </div>
                                            <div style={{ height: '220px', width: '100%' }}>
                                                <ResponsiveContainer>
                                                    <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                                        <XAxis type="number" hide />
                                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--ld-text-secondary)', fontWeight: 500 }} width={120} />
                                                        <Tooltip cursor={{ fill: 'var(--ld-bg-page)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                        <Bar dataKey="borrows" fill="var(--ld-accent-primary)" radius={[0, 4, 4, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Overdue */}
                                        <div className="ld-panel">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Overdue Books</div>
                                            </div>

                                            {overdueRecords.length > 0 ? (
                                                <div className="ld-overdue-list" style={{ overflowY: 'auto', maxHeight: '220px', paddingRight: '0.5rem' }}>
                                                    {overdueRecords.map(rec => (
                                                        <div className="ld-overdue-card" key={rec.id}>
                                                            <div className="ld-overdue-info">
                                                                <div className="ld-overdue-title">{rec.book}</div>
                                                                <div className="ld-overdue-sub">{rec.student} • Due {rec.dueDate}</div>
                                                            </div>
                                                            <div className="ld-overdue-badge">
                                                                {rec.daysOverdue}d late
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="ld-empty-state" style={{ padding: '2rem 1rem', flex: 1 }}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--ld-accent-secondary-light)', color: 'var(--ld-accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                        <TrendingUp size={24} />
                                                    </div>
                                                    <div style={{ fontWeight: 600, color: 'var(--ld-text-primary)' }}>No overdue books</div>
                                                    <div>All clear!</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── 4. Tables ── */}
                                    <div className="ld-dashboard-grid ld-grid-row-3">
                                        {/* Recent Transactions */}
                                        <div className="ld-panel">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Recent Transactions</div>
                                                <button className="ld-panel-action" onClick={() => handleNavClick('borrowing')}>View All</button>
                                            </div>

                                            {recentTransactions.length > 0 ? (
                                                <div className="ld-table-container">
                                                    <table className="ld-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Student</th>
                                                                <th>Book & Date</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {recentTransactions.slice(0, 5).map(tx => (
                                                                <tr key={tx.id}>
                                                                    <td style={{ fontWeight: 600 }}>{tx.student}</td>
                                                                    <td>
                                                                        <div style={{ fontWeight: 500 }}>{tx.book}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--ld-text-tertiary)', marginTop: '2px' }}>{tx.borrowDate}</div>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`ld-status-pill ${tx.status === 'ACTIVE' ? 'active' : tx.status === 'RETURNED' ? 'returned' : 'overdue'}`}>
                                                                            {tx.status === 'ACTIVE' ? 'Active' : tx.status === 'RETURNED' ? 'Returned' : 'Overdue'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="ld-empty-state">
                                                    <ClipboardList size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                                                    <div style={{ fontWeight: 600, color: 'var(--ld-text-primary)' }}>No recent transactions</div>
                                                    <div>Issue a book to see activity here</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inventory Preview */}
                                        <div className="ld-panel">
                                            <div className="ld-panel-header">
                                                <div className="ld-panel-title">Book Inventory Preview</div>
                                                <button className="ld-panel-action" onClick={() => handleNavClick('books')}>View All</button>
                                            </div>

                                            {inventory.length > 0 ? (
                                                <div className="ld-table-container">
                                                    <table className="ld-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Book</th>
                                                                <th>Category</th>
                                                                <th>Availability</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {inventory.slice(0, 5).map(item => (
                                                                <tr key={item.id}>
                                                                    <td>
                                                                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{item.title}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--ld-text-tertiary)', marginTop: '2px' }}>{item.author}</div>
                                                                    </td>
                                                                    <td><span style={{ background: 'var(--ld-bg-page)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, border: '1px solid var(--ld-border)' }}>{item.category}</span></td>
                                                                    <td>
                                                                        <span style={{ fontWeight: 600, color: item.availableCopies > 0 ? 'var(--ld-accent-secondary)' : 'var(--ld-accent-danger)' }}>
                                                                            {item.availableCopies} / {item.totalCopies}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--ld-text-tertiary)', cursor: 'pointer', padding: '0.5rem' }}>
                                                                            <ChevronRight size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="ld-empty-state">
                                                    <Package size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                                                    <div style={{ fontWeight: 600, color: 'var(--ld-text-primary)' }}>No books in inventory</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )
                        } />

                        <Route path="books" element={<PlaceholderRoute title="Books Management" iconId="books" />} />
                        <Route path="members" element={<PlaceholderRoute title="Members Management" iconId="members" />} />
                        <Route path="borrowing" element={<PlaceholderRoute title="Borrowing Management" iconId="borrowing" />} />
                        <Route path="returns" element={<PlaceholderRoute title="Returns Management" iconId="returns" />} />
                        <Route path="reservations" element={<PlaceholderRoute title="Reservations Management" iconId="reservations" />} />
                        <Route path="categories" element={<PlaceholderRoute title="Categories Management" iconId="categories" />} />
                        <Route path="reports" element={<PlaceholderRoute title="Reports / Analytics" iconId="reports" />} />
                        <Route path="settings" element={<PlaceholderRoute title="Settings" iconId="settings" />} />
                        <Route path="*" element={<Navigate to="/librarian" replace />} />
                    </Routes>
                </div>
            </div>

            {/* ═══ Modals ═══ */}
            <IssueModal isOpen={activeModal === 'issue'} onClose={handleModalClose} />
            <ReturnModal isOpen={activeModal === 'return'} onClose={handleModalClose} />
            <BookFormModal isOpen={activeModal === 'book'} onClose={handleModalClose} />
        </div>
    );
};
