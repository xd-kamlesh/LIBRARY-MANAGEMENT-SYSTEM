import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LibrarianDashboard } from './LibrarianDashboard';
import { StudentDashboard } from './StudentDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) return null;

    // Librarian gets full sidebar layout — no top nav needed
    if (user.role === 'LIBRARIAN') {
        return <LibrarianDashboard />;
    }

    // Student keeps existing layout with top nav
    return (
        <>
            <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div className="font-serif font-bold">Lumina</div>
                <button onClick={() => { localStorage.clear(); window.location.href = '/' }}>Sign Out</button>
            </nav>
            <StudentDashboard />
        </>
    );
};

export default Dashboard;
