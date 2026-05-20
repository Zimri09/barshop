import React from 'react'
import { ToastContainer } from 'react-toastify'
import AppRouter from './routes/AppRouter'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
    </>
  )
}

export default App
