import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import '../App.css';

const gridIcon = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 6H6V20H20V6Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M42 6H28V20H42V6Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M42 28H28V42H42V28Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 28H6V42H20V28Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const usersIcon = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M34 42V38C34 35.8783 33.1571 33.8434 31.6569 32.3431C30.1566 30.8429 28.1217 30 26 30H10C7.87827 30 5.84344 30.8429 4.34315 32.3431C2.84285 33.8434 2 35.8783 2 38V42M46 42V38C45.9987 36.2275 45.4087 34.5055 44.3227 33.1046C43.2368 31.7037 41.7163 30.7031 40 30.26M32 6.26C33.7208 6.7006 35.2461 7.7014 36.3353 9.10462C37.4245 10.5078 38.0157 12.2337 38.0157 14.01C38.0157 15.7863 37.4245 17.5122 36.3353 18.9154C35.2461 20.3186 33.7208 21.3194 32 21.76M26 14C26 18.4183 22.4183 22 18 22C13.5817 22 10 18.4183 10 14C10 9.58172 13.5817 6 18 6C22.4183 6 26 9.58172 26 14Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const alertIcon = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 18V26M24 34H24.02M20.58 7.72L3.64 36C3.29 36.61 3.1 37.29 3.1 37.99C3.1 38.69 3.28 39.37 3.63 39.98C3.97 40.59 4.47 41.09 5.07 41.45C5.68 41.8 6.36 41.99 7.06 42H40.94C41.64 41.99 42.32 41.8 42.92 41.45C43.53 41.09 44.02 40.59 44.37 39.98C44.72 39.37 44.9 38.69 44.9 37.99C44.9 37.29 44.71 36.61 44.36 36L27.42 7.72C27.06 7.13 26.56 6.65 25.96 6.31C25.36 5.97 24.69 5.79 24 5.79C23.31 5.79 22.64 5.97 22.04 6.31C21.44 6.65 20.94 7.13 20.58 7.72Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const crosshairIcon = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M44 24C44 35.0457 35.0457 44 24 44M44 24C44 12.9543 35.0457 4 24 4M44 24H36M24 44C12.9543 44 4 35.0457 4 24M24 44V36M4 24C4 12.9543 12.9543 4 24 4M4 24H12M24 4V12" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
      :root {
        --primary-bg: #1E1E1E;
        --primary-border: #333333;
        --primary-text: #FFFFFF;
        --card-bg: #2A2A2A;
        --sidebar-width: 240px;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
        background-color: var(--primary-bg);
        color: var(--primary-text);
      }

      .sidebar {
        width: var(--sidebar-width);
        height: 100vh;
        background-color: #252525;
        border-right: 1px solid var(--primary-border);
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        position: fixed;
        left: 0;
        top: 0;
      }

      .sidebar-logo {
        padding: 0 20px 20px;
        border-bottom: 1px solid var(--primary-border);
        margin-bottom: 20px;
        font-size: 24px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        padding: 0 16px;
        gap: 12px;
        overflow-y: auto;
      }

      .nav-button {
        padding: 10px 16px;
        border: 1px solid var(--primary-border);
        border-radius: 4px;
        background-color: transparent;
        color: var(--primary-text);
        font-size: 14px;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s;
        width: 100%;
      }

      .nav-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid var(--primary-border);
        height: 60px;
        background-color: #252525;
        position: fixed;
        top: 0;
        right: 0;
        left: var(--sidebar-width);
        z-index: 10;
      }

      .top-bar-left {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .top-bar-right {
        display: flex;
        gap: 16px;
      }

      .icon-button {
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.2s;
      }

      .icon-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        padding: 24px;
      }

      .data {
        background-color: var(--card-bg);
        border-radius: 8px;
        padding: 32px;
        border: 1px solid var(--primary-border);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 160px;
        margin: 16px;
      }

      .home-section {
        font-size: 20px;
        font-weight: 500;
      }

      .image-container {
        display: flex;
        gap: 16px;
        margin: 16px 0;
        justify-content: center;
      }

      .image-container img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        border: 1px solid var(--primary-border);
      }
      `}</style>

      <div className="flex h-screen">
      <aside className="sidebar">
        <div className="sidebar-logo">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold text-white border-none cursor-pointer p-0 m-0 hover:opacity-80 transition bg-transparent"
        >
          NEXUS
        </button>
        </div>
        <div className="sidebar-nav">
        <button className="nav-button" onClick={() => navigate('/homepage')}>Test page</button>
        <button className="nav-button" onClick={() => navigate('/server-management')}>Server Management</button>
        <button className="nav-button" onClick={() => navigate('/agent-management')}>Agent Management</button>
        <button className="nav-button" onClick={() => navigate('/endpoint-security')}>Endpoint Security</button>
        <button className="nav-button" onClick={() => navigate('/network-security')}>Network Security</button>
        <button className="nav-button" onClick={() => navigate('/threat-intelligence')}>Threat Intelligence</button>
        </div>
      </aside>

      <div className="flex flex-col flex-1" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <header className="top-bar">
        <div className="top-bar-left">
          <div className="home-section" style={{ fontSize: '24px' }}>Dashboard</div>
        </div>
        <div className="top-bar-right">
          <button className="icon-button" style={{ fontSize: '20px' }}>⚙️</button>
          <button className="icon-button" style={{ fontSize: '20px' }}>🔔</button>
          <button className="icon-button" style={{ fontSize: '20px' }}>👤</button>
        </div>
        </header>

        <section className="stat-grid" style={{ marginTop: '100px', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <button className="data" style={{ height: '140px', padding: '20px' }} onClick={() => alert('Events clicked')}>
          <StatCard icon={gridIcon} count={690} label="Events" />
        </button>
        <button className="data" style={{ height: '140px', padding: '20px' }} onClick={() => alert('Active Agents clicked')}>
          <StatCard icon={usersIcon} count={120} label="Active Agents" />
        </button>
        <button className="data" style={{ height: '140px', padding: '20px' }} onClick={() => alert('Alerts clicked')}>
          <StatCard icon={alertIcon} count={95} label="Alerts" />
        </button>
        <button className="data" style={{ height: '140px', padding: '20px' }} onClick={() => alert('Incidents clicked')}>
          <StatCard icon={crosshairIcon} count={23} label="Incidents" />
        </button>
        </section>

        <div className="image-container" style={{ marginTop: '0px' }}>
        <img src="/src/ui/assets/graph1.png" alt="Graph 1" style={{ width: '45%' }} />
        <img src="/src/ui/assets/graph2.png" alt="Graph 2" style={{ width: '45%' }} />
        </div>
        <div className='image-container'>
        <img src="/src/ui/assets/graph33.png" alt="Graph 3" style={{ borderRadius: '8px', width: '90%', margin: '0 auto' }} />
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;