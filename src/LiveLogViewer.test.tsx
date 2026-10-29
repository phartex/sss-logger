import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LiveLogViewer } from './LiveLogViewer';

describe('LiveLogViewer Component', () => {
  it('renders the dashboard title and initial connection status', () => {
    render(<LiveLogViewer />);

    expect(screen.getByText(/Live System Logs/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
  });

  it('renders severity filter buttons', () => {
    render(<LiveLogViewer />);

    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'INFO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'WARN' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ERROR' })).toBeInTheDocument();
  });
});
