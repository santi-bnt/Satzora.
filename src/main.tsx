import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './a2/A2App';
import './styles.css';
import './a2/a2.css';
import './a2/flashcards.css';
import './a2/brand-theme.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
