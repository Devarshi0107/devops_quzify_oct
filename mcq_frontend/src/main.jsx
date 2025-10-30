import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LoaderProvider } from "./context/LoaderContext"; 


createRoot(document.getElementById('root')).render(

  <StrictMode>
    <LoaderProvider>
    <App />
    </LoaderProvider>
  </StrictMode>,
)
