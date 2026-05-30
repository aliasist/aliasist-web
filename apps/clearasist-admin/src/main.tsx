import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, SignIn, useAuth } from '@clerk/react'
import App from './App'
import './styles.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function Gate() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-electric/10 text-electric text-xs font-mono tracking-[0.16em] mb-6">
            CLEARASIST ADMIN
          </div>
          <SignIn routing="hash" />
        </div>
      </div>
    )
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Gate />
    </ClerkProvider>
  </React.StrictMode>,
)
