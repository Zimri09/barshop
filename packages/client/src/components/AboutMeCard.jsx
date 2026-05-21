import React from 'react'
import { Github, Linkedin, Mail, MapPin, Phone, X } from 'lucide-react'

const contacts = [
  { icon: Mail, label: 'Email', value: 'zimri.logronio@demo.dev', href: 'mailto:zimri.logronio@demo.dev' },
  { icon: Phone, label: 'Phone', value: '+63 912 345 6789', href: 'tel:+639123456789' },
  { icon: Github, label: 'GitHub', value: 'github.com/zimrilogronio', href: 'https://github.com/zimrilogronio' },
  { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/zimrilogronio', href: 'https://linkedin.com/in/zimrilogronio' },
  { icon: MapPin, label: 'Location', value: 'Philippines', href: null },
]

export default function AboutMeCard({ className = '', onClose }) {
  return (
    <aside
      className={`rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-xl ${className}`}
      aria-label="About the developer"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90">About me</p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <img
            src="/zimri-profile.png"
            alt="Zimri V. Logronio"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
          />
          <div className="min-w-0 text-left">
            <h3 className="text-base font-semibold text-white leading-tight">Zimri V. Logronio</h3>
            <p className="text-sm text-emerald-400 font-medium mt-0.5">Web Developer</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed text-left">
          Full-stack web developer focused on building clean, responsive interfaces and reliable
          business applications. This BarStock system is a demo project showcasing inventory,
          POS, and role-based dashboards.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-700/80">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 text-left">Demo contacts</p>
          <ul className="space-y-2">
            {contacts.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="text-left">
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-2.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors group"
                  >
                    <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500 group-hover:text-emerald-400" />
                    <span>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
                      <span className="text-slate-300 group-hover:text-emerald-300">{value}</span>
                    </span>
                  </a>
                ) : (
                  <div className="flex items-start gap-2.5 text-xs text-slate-400">
                    <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
                      <span className="text-slate-300">{value}</span>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
