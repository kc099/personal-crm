import { Mail, Phone, Building, MapPin, Edit, Trash2 } from 'lucide-react';

const CustomerCard = ({ customer, onEdit, onDelete }) => {
  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0'
          }}>
            {customer.name}
          </h3>
          
          {customer.company && (
            <p style={{ 
              color: 'var(--text-secondary)',
              fontSize: '14px',
              margin: '0 0 8px 0'
            }}>
              {customer.company}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-secondary)',
                  textDecoration: 'none'
                }}>
                  {customer.email}
                </span>
              </div>
            )}
            
            {customer.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {customer.phone}
                </span>
              </div>
            )}
            
            {customer.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {customer.address}
                </span>
              </div>
            )}
          </div>

          {customer.notes && (
            <div style={{ 
              marginTop: '12px',
              padding: '8px',
              background: 'var(--bg-tertiary)',
              borderRadius: '6px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {customer.notes}
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          onClick={() => onEdit(customer)}
          style={{
            padding: '4px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--bg-tertiary)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--text-muted)';
          }}
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(customer.id)}
          style={{
            padding: '4px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--accent-error)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--text-muted)';
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CustomerCard;