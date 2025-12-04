import { useState, useEffect, useMemo } from 'react'
import './App.css'

interface Todo {
  id: number
  title: string
  completed: boolean
  created_at: string
}

type FilterType = 'all' | 'active' | 'completed'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos')
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo }),
      })
      const data = await res.json()
      setTodos([data, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      const data = await res.json()
      setTodos(todos.map(todo => todo.id === id ? data : todo))
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stats = useMemo(() => {
    const completed = todos.filter(t => t.completed).length
    const pending = todos.length - completed
    const progress = todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0
    return { total: todos.length, completed, pending, progress }
  }, [todos])

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed)
      case 'completed':
        return todos.filter(t => t.completed)
      default:
        return todos
    }
  }, [todos, filter])

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Todo App</h1>
        <p>Organize your tasks efficiently</p>
      </header>

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Progress Bar */}
      {todos.length > 0 && (
        <div className="progress-container">
          <div className="progress-header">
            <span>Progress</span>
            <span>{stats.progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={addTodo} className="add-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
        />
        <button type="submit" className="add-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Todo List */}
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span className="checkbox-custom"></span>
            </label>
            <div className="todo-content">
              <span className="todo-title">{todo.title}</span>
              <div className="todo-date">{formatDate(todo.created_at)}</div>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="delete-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {filteredTodos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            {filter === 'completed' ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            )}
          </div>
          <h3>
            {filter === 'all' && 'No tasks yet'}
            {filter === 'active' && 'No active tasks'}
            {filter === 'completed' && 'No completed tasks'}
          </h3>
          <p>
            {filter === 'all' && 'Add your first task above to get started!'}
            {filter === 'active' && 'All tasks are completed. Great job!'}
            {filter === 'completed' && 'Complete some tasks to see them here.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default App
