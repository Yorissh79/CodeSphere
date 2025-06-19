import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {RouterProvider} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './store/store';
import {GoogleOAuthProvider} from '@react-oauth/google';
import {Toaster} from 'react-hot-toast';
import {ErrorBoundary} from "./pages/errorboundary/ErrorBoundary.tsx";
import {router} from "./router/router.ts";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
    console.error('VITE_GOOGLE_CLIENT_ID is not set in .env');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={googleClientId || ''}>
                <Provider store={store}>
                    <ErrorBoundary fallback={<div>Redux store error occurred</div>}>
                        <RouterProvider router={router}/>
                        <Toaster position="top-right" reverseOrder={false}/>
                    </ErrorBoundary>
                </Provider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </StrictMode>
);