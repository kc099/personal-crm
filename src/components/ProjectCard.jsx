import { ExternalLink, Calendar, User, Edit, Trash2, Plus } from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on-hold': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
            flex: 1,
            paddingRight: '40px'
          }}>
            {project.name}
          </h3>
          
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '4px'
          }}>
            <button
              onClick={() => onEdit(project)}
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
              onClick={() => onDelete(project.id)}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className={`tag ${getStatusColor(project.status)}`} style={{ textTransform: 'capitalize' }}>
            {project.status}
          </span>
          
          {project.customer_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {project.customer_name}
              </span>
            </div>
          )}
        </div>

        {project.description && (
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            margin: '0 0 12px 0'
          }}>
            {project.description}
          </p>
        )}

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {project.tech_stack.map((tech, index) => (
                <span key={index} className="tag" style={{ fontSize: '11px' }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {project.start_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Started: {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {project.github_link && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
              <a 
                href={project.github_link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '12px', 
                  color: 'var(--accent-primary)',
                  textDecoration: 'none'
                }}
              >
                View Repository
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        borderTop: '1px solid var(--border-primary)',
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => onViewDetails(project)}
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          <Plus size={14} />
          View Details
        </button>
        
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;