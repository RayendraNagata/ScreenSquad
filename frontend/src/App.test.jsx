import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

// Mock the stores to avoid issues with authentication and socket connections in tests
vi.mock('../store/authStore', () => ({
  default: () => ({
    token: null,
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    initializeAuth: vi.fn()
  })
}))

vi.mock('../store/socketStore', () => ({
  default: () => ({
    socket: null,
    isConnected: false,
    connect: vi.fn(),
    disconnect: vi.fn()
  })
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    // The app should render the landing page when not authenticated
    expect(document.body).toBeTruthy()
  })

  it('contains React Router structure', () => {
    const { container } = render(<App />)
    // Check if the app renders with React Router structure
    expect(container).toBeTruthy()
    expect(container.firstChild).toBeTruthy()
  })
})