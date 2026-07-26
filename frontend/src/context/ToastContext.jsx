import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../components/Icon'
import './Toast.css'

const ToastContext = createContext({ toast: () => {} })

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
  }, [])

  const toast = useCallback((message, type = 'info', duration = 2600) => {
    const id = ++toastId
    setToasts(prev => [...prev.slice(-2), { id, message, type }])
    timersRef.current[id] = setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="mf-toast-region" aria-live="polite" aria-atomic="false">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              className={`mf-toast mf-toast--${t.type}`}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.94, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={() => dismiss(t.id)}
              role="status"
            >
              <span className="mf-toast__icon">
                <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'signal' : 'spark'} size={14} strokeWidth={2} />
              </span>
              <span className="mf-toast__msg">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
