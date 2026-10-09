import { renderToString } from 'react-dom/server'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './components/Landing'

export function render() {
  return renderToString(<ThemeProvider><LangProvider><AuthProvider><Landing /></AuthProvider></LangProvider></ThemeProvider>)
}
