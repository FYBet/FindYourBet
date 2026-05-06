import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useBets } from './hooks/useBets'
import { useDMs } from './social/hooks/useDMs'
import { BetModal } from './BetModal'
import Estadisticas from './Estadisticas'
import Historial from './MisApuestas'
import Ranking from './Ranking'
import Canales from './canales'
import Contacto from './Contacto'
import Social from './social'
import './dashboard.css'

const NAV_TABS = [
  { id: 'estadisticas', label: 'Perfil' },
  { id: 'social', label: 'Social' },
  { id: 'canales', label: 'Canales' },
  { id: 'ranking', label: 'Ranking' },
]

const PERFIL_SIDEBAR = [
  { id: 'estadisticas', label: 'Estadísticas personales', icon: '📊' },
  { id: 'historial', label: 'Historial', icon: '📋' },
  { id: 'contacto', label: 'Contáctenos', icon: '✉️' },
]

const SOCIAL_SIDEBAR = [
  { id: 'social', label: 'Mensajes directos', icon: '💬' },
  { id: 'canales', label: 'Canales', icon: '📡' },
]

export default function Dashboard({ user, logout }) {
  const [tab, setTab] = useState('estadisticas')
  const [preselectedChannelId, setPreselectedChannelId] = useState(null)
  const [searchParams] = useSearchParams()
  const {
    bets, allBets, loadingBets, showModal, setShowModal,
    form, setForm, submitBet, resolveBet, deleteBet,
    won, lost, yieldVal, avgOdds,
    period, setPeriod
  } = useBets(user)

  const { unreadCount } = useDMs(user?.id)

  useEffect(() => {
    const canalCode = searchParams.get('canal')
    if (canalCode) setTab('canales')
  }, [searchParams])

  const canalCode = searchParams.get('canal')
  const isPerfilTab = ['estadisticas', 'historial', 'contacto'].includes(tab)
  const isSocialTab = ['social', 'canales'].includes(tab)

  const handleAddBetFromCanal = (channelId) => {
    setPreselectedChannelId(channelId)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setPreselectedChannelId(null)
  }

  const sidebarItems = isPerfilTab ? PERFIL_SIDEBAR : isSocialTab ? SOCIAL_SIDEBAR : null

  return (
    <div className="dashboard">
      <BetModal
        open={showModal}
        onClose={handleCloseModal}
        form={form}
        setForm={setForm}
        onSubmit={submitBet}
        user={user}
        preselectedChannelId={preselectedChannelId}
      />

      <motion.nav className="dash-nav"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="dash-nav-left">
          <div className="dash-logo">FindYour<span>Bet</span></div>
          <div className="dash-nav-tabs">
            {NAV_TABS.map(t => (
              <motion.button key={t.id} className={`dash-tab ${tab === t.id || (t.id === 'social' && isSocialTab) ? 'active' : ''}`}
                whileTap={{ scale: 0.97 }} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === 'social' && unreadCount > 0 && (
                  <span style={{ marginLeft: '6px', background: 'var(--color-error)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 6px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="dash-nav-right">
          <div className="user-chip">
            <div className="user-avatar">{(user?.name || 'U')[0].toUpperCase()}</div>
            <span>{user?.name || 'Usuario'}</span>
          </div>
          <motion.button className="dash-tab" whileTap={{ scale: 0.98 }} onClick={logout}>
            Salir
          </motion.button>
        </div>
      </motion.nav>

      <div className="dash-layout">

        {sidebarItems && (
          <aside className="dash-sidebar">
            {isPerfilTab && <div className="sidebar-label">Mi perfil</div>}
            {isSocialTab && <div className="sidebar-label">Social</div>}
            {sidebarItems.map(item => (
              <div key={item.id} className="sidebar-section">
                <button
                  className={`sidebar-item ${tab === item.id ? 'active' : ''}`}
                  onClick={() => setTab(item.id)}>
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                  {item.id === 'social' && unreadCount > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--color-error)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 6px' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </aside>
        )}

        <div className="dash-content">
          <AnimatePresence mode="wait">

            {tab === 'estadisticas' && (
              <Estadisticas
                bets={bets} loadingBets={loadingBets}
                won={won} lost={lost} yieldVal={yieldVal} avgOdds={avgOdds}
                onNewBet={() => setShowModal(true)}
                period={period} onPeriodChange={setPeriod}
              />
            )}

            {tab === 'historial' && (
              <Historial
                bets={bets} loadingBets={loadingBets}
                won={won} lost={lost} yieldVal={yieldVal} avgOdds={avgOdds}
                onNewBet={() => setShowModal(true)} onResolveBet={resolveBet}
                onDeleteBet={deleteBet}
                period={period} onPeriodChange={setPeriod}
              />
            )}

            {tab === 'contacto' && <Contacto />}

            {tab === 'social' && <Social user={user} />}

            {tab === 'canales' && (
              <Canales
                user={user}
                initialCanalCode={canalCode}
                onAddBet={handleAddBetFromCanal}
              />
            )}

            {tab === 'ranking' && <Ranking user={user} />}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}