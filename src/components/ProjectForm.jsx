import { useState, useEffect } from 'react';

const ProjectForm = ({ project, customers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customer_id: '',
    tech_stack: '',
    github_link: '',
    status: 'active',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        customer_id: project.customer_id || '',
        tech_stack: project.tech_stack ? project.tech_stack.join(', ') : '',
        github_link: project.github_link || '',
        status: project.status || 'active',
        start_date: project.start_date || '',
        end_date: project.end_date || ''
      });
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      tech_stack: formData.tech_stack.split(',').map(tech => tech.trim()).filter(Boolean),
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: 'var(--text-primary)'
        }}>
          Project Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: 'var(--text-primary)'
        }}>
          Customer
        </label>
        <select
          name="customer_id"
          value={formData.customer_id}
          onChange={handleChange}
          style={{ width: '100%' }}
        >
          <option value="">Select a customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} {customer.company ? `(${customer.company})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: 'var(--text-primary)'
        }}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            GitHub Link
          </label>
          <input
            type="url"
            name="github_link"
            value={formData.github_link}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: 'var(--text-primary)'
        }}>
          Tech Stack (comma separated)
        </label>
        <input
          type="text"
          name="tech_stack"
          value={formData.tech_stack}
          onChange={handleChange}
          placeholder="React, Node.js, PostgreSQL"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {project ? 'Update Project' : 'Add Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;