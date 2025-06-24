import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, DollarSign, Clock, Target, Activity } from 'lucide-react';

const ProjectDetails = ({ project, onBack }) => {
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    milestone_type: 'development',
    target_date: '',
    amount: ''
  });
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    activity_type: 'development',
    hours: '',
    amount: '',
    activity_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (project) {
      fetchMilestones();
      fetchActivities();
    }
  }, [project]);

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}/milestones`);
      const data = await response.json();
      setMilestones(data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}/activities`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone)
      });
      if (response.ok) {
        setNewMilestone({
          title: '',
          description: '',
          milestone_type: 'development',
          target_date: '',
          amount: ''
        });
        setShowMilestoneForm(false);
        fetchMilestones();
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      });
      if (response.ok) {
        setNewActivity({
          title: '',
          description: '',
          activity_type: 'development',
          hours: '',
          amount: '',
          activity_date: new Date().toISOString().split('T')[0]
        });
        setShowActivityForm(false);
        fetchActivities();
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const markMilestoneComplete = async (milestoneId) => {
    try {
      const milestone = milestones.find(m => m.id === milestoneId);
      const response = await fetch(`http://localhost:3001/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...milestone,
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0]
        })
      });
      if (response.ok) {
        fetchMilestones();
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
        
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          {project.name}
        </h1>
        {project.customer_name && (
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Client: {project.customer_name}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Milestones Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              <Target size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Milestones
            </h2>
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Plus size={14} />
              Add Milestone
            </button>
          </div>

          {showMilestoneForm && (
            <form onSubmit={handleAddMilestone} style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                required
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <select
                value={newMilestone.milestone_type}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, milestone_type: e.target.value }))}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                <option value="development">Development</option>
                <option value="payment">Payment</option>
                <option value="deployment">Deployment</option>
                <option value="testing">Testing</option>
                <option value="review">Review</option>
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="date"
                  value={newMilestone.target_date}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, target_date: e.target.value }))}
                  style={{ width: '100%' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newMilestone.amount}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, amount: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-success" style={{ fontSize: '12px' }}>Add</button>
                <button 
                  type="button" 
                  onClick={() => setShowMilestoneForm(false)}
                  className="btn btn-secondary" 
                  style={{ fontSize: '12px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {milestones.map(milestone => (
              <div key={milestone.id} style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: milestone.status === 'completed' ? '2px solid var(--accent-success)' : '2px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                      {milestone.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {milestone.target_date && (
                        <span>
                          <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          {new Date(milestone.target_date).toLocaleDateString()}
                        </span>
                      )}
                      {milestone.amount && (
                        <span>
                          <DollarSign size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          ₹{milestone.amount}
                        </span>
                      )}
                    </div>
                  </div>
                  {milestone.status !== 'completed' && (
                    <button
                      onClick={() => markMilestoneComplete(milestone.id)}
                      className="btn btn-success"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              <Activity size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Activities
            </h2>
            <button
              onClick={() => setShowActivityForm(true)}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Plus size={14} />
              Log Activity
            </button>
          </div>

          {showActivityForm && (
            <form onSubmit={handleAddActivity} style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <input
                type="text"
                placeholder="Activity title"
                value={newActivity.title}
                onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                required
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <select
                value={newActivity.activity_type}
                onChange={(e) => setNewActivity(prev => ({ ...prev, activity_type: e.target.value }))}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                <option value="development">Development</option>
                <option value="meeting">Meeting</option>
                <option value="testing">Testing</option>
                <option value="deployment">Deployment</option>
                <option value="documentation">Documentation</option>
                <option value="payment">Payment Received</option>
                <option value="installation">Installation</option>
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="date"
                  value={newActivity.activity_date}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, activity_date: e.target.value }))}
                  style={{ width: '100%' }}
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Hours"
                  value={newActivity.hours}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, hours: e.target.value }))}
                  style={{ width: '100%' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newActivity.amount}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, amount: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
              <textarea
                placeholder="Description"
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-success" style={{ fontSize: '12px' }}>Log Activity</button>
                <button 
                  type="button" 
                  onClick={() => setShowActivityForm(false)}
                  className="btn btn-secondary" 
                  style={{ fontSize: '12px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflow: 'auto' }}>
            {activities.map(activity => (
              <div key={activity.id} style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                    {activity.title}
                  </h4>
                  <span className="tag" style={{ textTransform: 'capitalize' }}>
                    {activity.activity_type}
                  </span>
                </div>
                {activity.description && (
                  <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {activity.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>
                    <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {new Date(activity.activity_date).toLocaleDateString()}
                  </span>
                  {activity.hours && (
                    <span>
                      <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {activity.hours}h
                    </span>
                  )}
                  {activity.amount && (
                    <span>
                      <DollarSign size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      ₹{activity.amount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;