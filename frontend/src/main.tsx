import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router-dom";
import {router} from "./router/router.ts";
import {Provider} from "react-redux";
import {store} from "./store/store.ts";
import {HelmetProvider} from "react-helmet-async";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <HelmetProvider>
          <Provider store={store}>
              <RouterProvider router={router}>

              </RouterProvider>
          </Provider>
      </HelmetProvider>
  </StrictMode>,
)
