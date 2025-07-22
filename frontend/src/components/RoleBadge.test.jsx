import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RoleBadge from '../components/RoleBadge'

// Mock the role utils
vi.mock('../utils/roleUtils', () => ({
  getRoleDisplayName: vi.fn((role) => {
    const roles = {
      host: 'Host',
      member: 'Member',
      moderator: 'Moderator'
    }
    return roles[role] || role
  }),
  getRoleColor: vi.fn((role) => {
    const colors = {
      host: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  })
}))

describe('RoleBadge Component', () => {
  it('renders role badge with correct text', () => {
    render(<RoleBadge role="host" />)
    expect(screen.getByText('Host')).toBeInTheDocument()
  })

  it('renders member role correctly', () => {
    render(<RoleBadge role="member" />)
    expect(screen.getByText('Member')).toBeInTheDocument()
  })

  it('returns null for empty role', () => {
    const { container } = render(<RoleBadge role={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('applies custom className', () => {
    render(<RoleBadge role="host" className="custom-class" />)
    const badge = screen.getByText('Host')
    expect(badge).toHaveClass('custom-class')
  })
})