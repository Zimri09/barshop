import React from 'react'
import { ToastContainer } from './services/toast.jsx'
import AppRouter from './routes/AppRouter'
import AboutMeToggle from './components/AboutMeToggle'
import './App.css'

function App() {
  return (
    <>
      <AboutMeToggle />
      <AppRouter />
      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
    </>
  )
}

export default App
