import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.jsx'
import './index.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error)
    console.error('Error Info:', errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          padding: '20px',
          background: '#1a1a2e'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️ Something went wrong</h1>
          <p style={{ marginBottom: '8px' }}>Error: {this.state.error?.message || 'Unknown error'}</p>
          {this.state.errorInfo && (
            <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', maxWidth: '800px', overflow: 'auto', fontSize: '12px' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Simple test component to verify React works
const TestComponent = () => {
  console.log('✅ TestComponent rendering')
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      color: 'white',
      background: '#1a1a2e'
    }}>
      <h1>✅ React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
    </div>
  )
}

// Ensure root element exists and render
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
  document.body.innerHTML = '<div style="color: white; padding: 20px; background: #1a1a2e;">Error: Root element not found</div>'
} else {
  // Force root to be visible
  rootElement.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; min-height: 100vh !important;'
  document.body.style.cssText = 'opacity: 1 !important; visibility: visible !important; background: #1a1a2e !important;'
  
  console.log('✅ Root element found:', rootElement)
  console.log('✅ Root element styles:', window.getComputedStyle(rootElement).display)
  
  try {
    const root = ReactDOM.createRoot(rootElement)
    
    // First render a simple test to verify React works
    console.log('🔍 Step 1: Testing basic React render...')
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      </React.StrictMode>
    )
    
    console.log('✅ Step 1 complete: Basic React render successful')
    
    // Wait a moment, then render the full app
    setTimeout(() => {
      console.log('🔍 Step 2: Rendering full app with Privy...')
      try {
        // Get Privy App ID from environment or use default
        const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cmgn86sbf004wi90dqvbqfrs8';
        
        console.log('🔍 Privy App ID:', privyAppId);
        console.log('🔍 Environment variables:', {
          VITE_API_URL: import.meta.env.VITE_API_URL,
          VITE_PHAROS_CHAIN_ID: import.meta.env.VITE_PHAROS_CHAIN_ID,
          VITE_PHAROS_RPC_URL: import.meta.env.VITE_PHAROS_RPC_URL,
        });
        
        root.render(
          <React.StrictMode>
            <ErrorBoundary>
              <PrivyProvider
                appId={privyAppId}
                config={{
                  loginMethods: ['wallet', 'email', 'sms'],
                  appearance: {
                    theme: 'dark',
                    accentColor: '#4f46e5',
                  },
                  embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                  },
                }}
              >
                <App />
              </PrivyProvider>
            </ErrorBoundary>
          </React.StrictMode>
        )
        console.log('✅ Step 2 complete: Full app rendered successfully')
      } catch (privyError) {
        console.error('❌ Privy render failed:', privyError)
        // Fallback: render app without Privy
        root.render(
          <React.StrictMode>
            <ErrorBoundary>
              <div style={{ padding: '20px', color: 'white' }}>
                <h1>⚠️ Privy Error</h1>
                <p>Error: {privyError.message}</p>
                <p>Rendering app without wallet features...</p>
                <App />
              </div>
            </ErrorBoundary>
          </React.StrictMode>
        )
      }
    }, 1000)
    
  } catch (error) {
    console.error('❌ Failed to render React app:', error)
    console.error('Error stack:', error.stack)
    rootElement.innerHTML = `
      <div style="color: white; padding: 20px; text-align: center; z-index: 9999; background: #1a1a2e; min-height: 100vh;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">⚠️ Failed to load app</h1>
        <p style="margin-bottom: 8px;">Error: ${error.message}</p>
        <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; text-align: left; overflow: auto; max-width: 600px; margin: 0 auto 16px;">${error.stack || 'No stack trace'}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Reload Page
        </button>
      </div>
    `
  }
}
