import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './index.css';
import Home from './pages/Home.jsx'; // Update to point to Home.jsx

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
    <Home /> {/* Now rendering Home.jsx */}
  </StrictMode>
);
