import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
    },
  }),
}));

test('renders login page for unauthenticated users', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
});
