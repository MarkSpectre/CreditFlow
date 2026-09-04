import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="652870265223-lm8eemfdcg6l0t7ocoee91rknpjo051j.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
