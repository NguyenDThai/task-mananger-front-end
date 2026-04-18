import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './route/index.tsx';
import { ToastContainer } from 'react-toastify';
import ChatGlobalListener from './components/share/chatbot/ChatGlobalListener.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ChatGlobalListener />
      <App />
      <ToastContainer position="top-center" />
    </Provider>
  </StrictMode>,
);
