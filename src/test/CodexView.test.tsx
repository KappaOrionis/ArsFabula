import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CodexView from '../components/Codex/CodexView';
import { invoke } from '@tauri-apps/api/core';

describe('CodexView', () => {
  it('renders search input', () => {
    render(<CodexView />);
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
  });

  it('performs search on enter', async () => {
    const mockResults = [
      { id: '1', title: 'Pilum of Fire', content: 'Burn everything', entity_type: 'rule', metadata: {} }
    ];
    (invoke as any).mockResolvedValue(mockResults);

    render(<CodexView />);
    const input = screen.getByPlaceholderText(/Rechercher/i);
    
    fireEvent.change(input, { target: { value: 'Fire' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Pilum of Fire')).toBeInTheDocument();
    });

    expect(invoke).toHaveBeenCalledWith('search_lore', { 
      query: 'Fire', 
      filter_type: null 
    });
  });

  it('shows no results message', async () => {
    (invoke as any).mockResolvedValue([]);

    render(<CodexView />);
    const input = screen.getByPlaceholderText(/Rechercher/i);
    
    fireEvent.change(input, { target: { value: 'Unknown' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Aucun résultat trouvé/i)).toBeInTheDocument();
    });
  });
});
