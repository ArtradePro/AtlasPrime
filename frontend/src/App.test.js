import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AtlasPrime Lead Generation heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/AtlasPrime - Lead Generation/i);
  expect(headingElement).toBeInTheDocument();
});
