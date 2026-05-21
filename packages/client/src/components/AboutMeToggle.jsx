import React, { useEffect, useRef, useState } from 'react'
import { UserCircle, X } from 'lucide-react'
import AboutMeCard from './AboutMeCard'

export default function AboutMeToggle({ className = '' }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={panelRef} className={`fixed top-4 left-4 z-50 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close about me' : 'About me'}
        aria-expanded={open}
        className={`flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-all ${
          open
            ? 'bg-emerald-600 border-emerald-500 text-white'
            : 'bg-slate-900/80 border-slate-700 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 backdrop-blur-md'
        }`}
      >
        {open ? <X className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-14 left-0 w-[min(100vw-2rem,320px)] opacity-100 translate-y-0 transition-all duration-200">
          <AboutMeCard onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
