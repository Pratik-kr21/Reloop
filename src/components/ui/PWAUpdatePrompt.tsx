import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X, Wifi, WifiOff } from 'lucide-react'

export default function PWAUpdatePrompt() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showOfflineBanner, setShowOfflineBanner] = useState(false)

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('[GreenBuddy PWA] Service Worker registered:', r)
        },
        onRegisterError(error: unknown) {
            console.error('[GreenBuddy PWA] Service Worker registration error:', error)
        },
    })

    // Online / offline detection
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setShowOfflineBanner(false)
        }
        const handleOffline = () => {
            setIsOnline(false)
            setShowOfflineBanner(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <>
            {/* ── Update available toast ── */}
            {needRefresh && (
                <div
                    role="alert"
                    aria-live="polite"
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        right: '1.5rem',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,197,94,0.1)',
                        maxWidth: '20rem',
                        animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    <div style={{
                        width: '2.25rem',
                        height: '2.25rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e, #10b981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 0 12px rgba(34,197,94,0.4)',
                    }}>
                        <RefreshCw size={14} color="white" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>
                            Update Available
                        </p>
                        <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                            Tap to get the latest version
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            id="pwa-update-btn"
                            onClick={() => updateServiceWorker(true)}
                            style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #22c55e, #10b981)',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseOver={e => ((e.target as HTMLButtonElement).style.opacity = '0.85')}
                            onMouseOut={e => ((e.target as HTMLButtonElement).style.opacity = '1')}
                        >
                            Refresh
                        </button>
                        <button
                            id="pwa-dismiss-btn"
                            onClick={() => setNeedRefresh(false)}
                            aria-label="Dismiss update notification"
                            style={{
                                padding: '0.375rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => {
                                const el = e.target as HTMLButtonElement
                                el.style.background = 'rgba(255,255,255,0.05)'
                                el.style.color = '#f1f5f9'
                            }}
                            onMouseOut={e => {
                                const el = e.target as HTMLButtonElement
                                el.style.background = 'transparent'
                                el.style.color = '#94a3b8'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Offline / online banner ── */}
            {showOfflineBanner && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        position: 'fixed',
                        top: '5rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9998,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '2rem',
                        background: isOnline
                            ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: `1px solid ${isOnline ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: isOnline ? '#86efac' : '#fca5a5',
                        animation: 'slideDown 0.3s ease',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                    {isOnline ? 'Back online!' : 'You\'re offline — browsing cached content'}
                </div>
            )}

            {/* Keyframe animations injected globally */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(1rem); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translate(-50%, -0.5rem); }
                    to   { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </>
    )
}
