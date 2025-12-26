import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8F5F0'
    }}>
      <Sidebar />

      <main style={{
        flex: 1,
        marginLeft: '250px',
        padding: '20px',
        overflowY: 'auto',
        minHeight: '100vh'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;