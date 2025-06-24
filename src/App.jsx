import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import CustomerCard from './components/CustomerCard';
import ProjectCard from './components/ProjectCard';
import ProjectDetails from './components/ProjectDetails';
import Modal from './components/Modal';
import CustomerForm from './components/CustomerForm';
import ProjectForm from './components/ProjectForm';
import { Plus, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchProjects();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCustomerSubmit = async (customerData) => {
    try {
      const url = editingCustomer 
        ? `http://localhost:3001/api/customers/${editingCustomer.id}`
        : 'http://localhost:3001/api/customers';
      
      const response = await fetch(url, {
        method: editingCustomer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        setShowCustomerModal(false);
        setEditingCustomer(null);
        fetchCustomers();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error saving customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please try again.');
    }
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      const url = editingProject 
        ? `http://localhost:3001/api/projects/${editingProject.id}`
        : 'http://localhost:3001/api/projects';
      
      const response = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        setShowProjectModal(false);
        setEditingProject(null);
        fetchProjects();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error saving project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/customers/${customerId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchCustomers();
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchProjects();
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.customer_name && project.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedProject) {
    return (
      <ThemeProvider>
        <ProjectDetails 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px' 
          }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  paddingLeft: '40px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  padding: '8px 12px 8px 40px'
                }}
              />
            </div>
            
            <button
              onClick={() => {
                if (activeTab === 'customers') {
                  setEditingCustomer(null);
                  setShowCustomerModal(true);
                } else if (activeTab === 'projects') {
                  setEditingProject(null);
                  setShowProjectModal(true);
                }
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add {activeTab === 'customers' ? 'Customer' : 'Project'}
            </button>
          </div>

          {activeTab === 'customers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={(customer) => {
                    setEditingCustomer(customer);
                    setShowCustomerModal(true);
                  }}
                  onDelete={handleDeleteCustomer}
                />
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(project) => {
                    setEditingProject(project);
                    setShowProjectModal(true);
                  }}
                  onDelete={handleDeleteProject}
                  onViewDetails={setSelectedProject}
                />
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="card">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Analytics Coming Soon
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Analytics dashboard with project stats, revenue tracking, and customer insights will be available soon.
              </p>
            </div>
          )}
        </main>

        {/* Customer Modal */}
        <Modal
          isOpen={showCustomerModal}
          onClose={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
          title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        >
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleCustomerSubmit}
            onCancel={() => {
              setShowCustomerModal(false);
              setEditingCustomer(null);
            }}
          />
        </Modal>

        {/* Project Modal */}
        <Modal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          title={editingProject ? 'Edit Project' : 'Add New Project'}
        >
          <ProjectForm
            project={editingProject}
            customers={customers}
            onSubmit={handleProjectSubmit}
            onCancel={() => {
              setShowProjectModal(false);
              setEditingProject(null);
            }}
          />
        </Modal>
      </div>
    </ThemeProvider>
  );
}

export default App;
