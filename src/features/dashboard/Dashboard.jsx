import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBets } from './hooks/useBets'
import { BetModal } from './BetModal'
import MisApuestas from './MisApuestas'
import Ingresos from './Ingresos'
import Ranking from './Ranking'
import './dashboard.css'

const TABS = [
  { id: 'perfil', label: 'Mi Perfil' },
  { id: 'ranking', label: 'Ranking' },
]

const PERFIL_TABS = [
  { id: 'apuestas', label: 'Mis Apuestas' },
  { id: 'ingresos', label: 'Ingresos' },
]

export default function Dashboard({ user, logout }) {
  const [tab, setTab] = useState('perfil')
  const [perfilTab, setPerfilTab] = useState('apuestas')
  const {
    bets, loadingBets, showModal, setShowModal,
    form, setForm, submitBet, resolveBet,
    won, lost, yieldVal, avgOdds
  } = useBets(user)

  return (
    <div className="dashboard">
      <BetModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={submitBet}
      />

      <motion.nav className="dash-nav"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="dash-nav-left">
          <div className="dash-logo">FindYour<span>Bet</span></div>
          <div className="dash-nav-tabs">
            {TABS.map(t => (
              <motion.button key={t.id} className={`dash-tab ${tab === t.id ? 'active' : ''}`}
                whileTap={{ scale: 0.97 }} onClick={() => setTab(t.id)}>
                {t.label}
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

      <div className="dash-body">
        <AnimatePresence mode="wait">

          {tab === 'perfil' && (
            <motion.div key="perfil"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="profile-tabs">
                {PERFIL_TABS.map(t => (
                  <motion.button key={t.id} className={`profile-tab ${perfilTab === t.id ? 'active' : ''}`}
                    whileTap={{ scale: 0.97 }} onClick={() => setPerfilTab(t.id)}>
                    {t.label}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {perfilTab === 'apuestas' && (
                  <MisApuestas
                    bets={bets} loadingBets={loadingBets}
                    won={won} lost={lost} yieldVal={yieldVal} avgOdds={avgOdds}
                    onNewBet={() => setShowModal(true)} onResolveBet={resolveBet}
                  />
                )}
                {perfilTab === 'ingresos' && <Ingresos />}
              </AnimatePresence>
            </motion.div>
          )}

          {tab === 'ranking' && <Ranking />}

        </AnimatePresence>
      </div>
    </div>
  )
}
