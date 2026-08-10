import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>404 - Not Found</h1>
            <Link to="/" style={{ marginTop: '1rem', color: 'var(--accent-blue)' }}>Return Home</Link>
        </div>
    );
};

export default NotFound;
