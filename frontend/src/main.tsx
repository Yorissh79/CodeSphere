import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router-dom";
import {router} from "./router/router.ts";
import {Provider} from "react-redux";
import {store} from "./store/store.ts";
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <ThemeProvider>
              <RouterProvider router={router}>

              </RouterProvider>
          </ThemeProvider>
      </Provider>
  </StrictMode>,
)
