import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import IncidentsList from '../IncidentsList';

global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([
    {
      id: 1, title: 'Incident 1', status: 'New', description: 'Description 1',
    },
    {
      id: 2, title: 'Incident 2', status: 'In Progress', description: 'Description 2',
    },
  ]),
})) as jest.Mock;

describe('IncidentsList', () => {
  test('renders incidents after fetch', async () => {
    render(<IncidentsList />);
    expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Incident 1')).toBeInTheDocument();
      expect(screen.getByText('Incident 2')).toBeInTheDocument();
    });
  });

  test('shows error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: false,
    }));

    render(<IncidentsList />);
    await waitFor(() => {
      expect(screen.getByText(/エラー/i)).toBeInTheDocument();
    });
  });
});
