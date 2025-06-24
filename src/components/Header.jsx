import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Users, FolderOpen, BarChart3 } from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-primary)',
      padding: '16px 24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Personal CRM
          </h1>
          
          <nav style={{ display: 'flex', gap: '8px' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;