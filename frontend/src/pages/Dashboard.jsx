import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, Plus, Search, Calendar, CheckCircle2, Circle, AlertCircle, 
  Trash2, Edit, ChevronLeft, ChevronRight, X, Sparkles, ListTodo
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Task List States
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort, Pagination States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Modal and Save Loading States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentTaskId, setCurrentTaskId] = useState(null);
  
  // Modal Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('pending');
  const [formPriority, setFormPriority] = useState('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch tasks helper
  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Search/filter query building: construct parameters for the API call
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        priority: priorityFilter,
        sort: sortBy,
        page,
        limit: 6
      });

      const res = await fetch(`${API_URL}/tasks?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
        setTotalPages(data.totalPages);
        setTotalTasks(data.totalTasks);
      } else {
        setError(data.msg || 'Unable to load tasks. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch tasks when query filters change
  useEffect(() => {
    // Debounce search slightly to avoid excessive API requests
    const delayDebounce = setTimeout(() => {
      if (token) {
        fetchTasks();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, priorityFilter, sortBy, page, token]);

  // Handle status toggle (Pending <-> Completed)
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Optimistic UI updates
        setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Adjust page if deleting the last item on the page
        if (tasks.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchTasks();
        }
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed to delete task');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting task');
    }
  };

  // Open modal for Task Creation
  const openCreateModal = () => {
    setModalMode('create');
    setFormTitle('');
    setFormDesc('');
    setFormStatus('pending');
    setFormPriority('medium');
    setFormDueDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Task Editing
  const openEditModal = (task) => {
    setModalMode('edit');
    setCurrentTaskId(task._id);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Modal Submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Title validation
    if (!formTitle.trim()) {
      setFormError('Task title is required');
      return;
    }

    const payload = {
      title: formTitle,
      description: formDesc,
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate ? new Date(formDueDate) : null
    };

    setIsSaving(true);
    try {
      const url = modalMode === 'create' 
        ? `${API_URL}/tasks` 
        : `${API_URL}/tasks/${currentTaskId}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchTasks();
      } else {
        setFormError(data.msg || 'Unable to save task. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Unable to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset page when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <Sparkles className="logo-icon animate-pulse" size={24} />
          <div className="logo-text">Task<span>Flow</span></div>
        </div>

        {user && (
          <div className="user-profile-section">
            <div className="user-info-badge">
              <div className="avatar-circle">
                {getInitials(user.name)}
              </div>
              <span style={{ fontWeight: 600 }}>{user.name}</span>
            </div>
            
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              <LogOut size={16} />
              <span className="hide-mobile">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Workspace */}
      <main className="dashboard-workspace animate-slide-up">
        {/* Intro Banner */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome back, {user ? user.name : 'User'}!
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Here is an overview of your active tasks and schedules.
          </p>
        </div>

        {/* Filters and Search Bar Controls */}
        <section className="workspace-controls glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div className="search-filter-box">
            {/* Real-time Search */}
            <div className="search-input-wrapper">
              <Search className="search-input-icon" size={18} />
              <input
                type="text"
                placeholder="Search by task title or desc..."
                className="form-input search-bar"
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="form-input form-select filter-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              className="form-input form-select filter-select"
              value={priorityFilter}
              onChange={(e) => handleFilterChange(setPriorityFilter, e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {/* Sorter */}
            <select
              className="form-input form-select filter-select"
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="dueDate_asc">Due Date (Asc)</option>
              <option value="dueDate_desc">Due Date (Desc)</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </section>

        {/* Global Error Display */}
        {error && (
          <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Task Cards Display Section */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '16px' }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border-color)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--text-muted)' }}>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo className="empty-icon" size={64} />
            <h3>No tasks matches found</h3>
            <p>
              {search || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? "Try adjusting your search queries or active filters." 
                : "Get started by adding your first task card to this board."}
            </p>
            {!search && statusFilter === 'all' && priorityFilter === 'all' && (
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus size={18} />
                <span>Create Task</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {tasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                
                return (
                  <div key={task._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="task-card-header">
                      <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                        {task.title}
                      </h3>
                      <button 
                        className="icon-btn toggle-btn" 
                        onClick={() => handleToggleStatus(task)}
                        title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={20} className="completed" style={{ color: 'var(--completed)' }} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                    </div>

                    <div className="task-card-meta">
                      <span className={`badge badge-${task.status}`}>
                        {task.status}
                      </span>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>

                    <p className="task-desc">
                      {task.description || <i>No description provided.</i>}
                    </p>

                    <div className="task-footer">
                      <div className={`due-date-display ${isOverdue ? 'overdue' : ''}`}>
                        <Calendar size={14} />
                        <span>
                          {task.dueDate 
                            ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'No due date'}
                        </span>
                        {isOverdue && <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>(Overdue)</span>}
                      </div>

                      <div className="task-actions">
                        <button 
                          className="icon-btn" 
                          onClick={() => openEditModal(task)}
                          title="Edit Task"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="icon-btn delete-btn" 
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="btn btn-secondary icon-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="pagination-info">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalTasks} total tasks)
                </span>

                <button
                  className="btn btn-secondary icon-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="icon-btn modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="modal-title">
              {modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h3>

            {formError && (
              <div className="alert alert-danger" style={{ padding: '10px 14px' }}>
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="taskTitle">TITLE</label>
                <input
                  type="text"
                  id="taskTitle"
                  className="form-input"
                  placeholder="e.g. Code auth route tests"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="taskDesc">DESCRIPTION</label>
                <textarea
                  id="taskDesc"
                  className="form-input"
                  placeholder="Add details about this task..."
                  rows="3"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="taskPriority">PRIORITY</label>
                  <select
                    id="taskPriority"
                    className="form-input form-select"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="taskStatus">STATUS</label>
                  <select
                    id="taskStatus"
                    className="form-input form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="taskDueDate">DUE DATE</label>
                <input
                  type="date"
                  id="taskDueDate"
                  className="form-input"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving task...' : (modalMode === 'create' ? 'Create Task' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
