import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Ensure environment variable is set
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
    console.error('VITE_GOOGLE_CLIENT_ID is not set in .env');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
            <GoogleOAuthProvider clientId={googleClientId || ''}>
                <Provider store={store}>
                    <RouterProvider router={router} />
                </Provider>
            </GoogleOAuthProvider>
    </StrictMode>
);