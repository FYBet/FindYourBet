import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FormLabel } from '../../components/ui/FormLabel'
import './dashboard.css'

const SPORTS = ['Fútbol', 'Baloncesto', 'Tenis', 'MMA / Boxeo', 'Otro']
const MARKETS = ['1X2', 'Hándicap', 'Over/Under', 'Ambos marcan', 'Otro']

export function BetModal({ open, onClose, form, setForm, onSubmit }) {
  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div className="modal"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div className="modal-title">Nueva Apuesta</div>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="form-group-modal">
              <FormLabel>Evento</FormLabel>
              <Input placeholder="ej. Real Madrid vs Barcelona"
                value={form.event} onChange={e => set('event', e.target.value)} />
            </div>

            <div className="form-row-modal">
              <div>
                <FormLabel>Deporte</FormLabel>
                <select className="input" value={form.sport} onChange={e => set('sport', e.target.value)}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <FormLabel>Mercado</FormLabel>
                <select className="input" value={form.market} onChange={e => set('market', e.target.value)}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row-modal">
              <div>
                <FormLabel>Selección</FormLabel>
                <Input placeholder="ej. Real Madrid"
                  value={form.pick} onChange={e => set('pick', e.target.value)} />
              </div>
              <div>
                <FormLabel>Cuota</FormLabel>
                <Input type="number" placeholder="ej. 1.85" step="0.01" min="1.01"
                  value={form.odds} onChange={e => set('odds', e.target.value)} />
              </div>
            </div>

            <div className="form-group-modal">
              <FormLabel>Fecha</FormLabel>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>

            <div className="form-group-modal">
              <FormLabel>Stake (1–10)</FormLabel>
              <div className="stake-display">{form.stake}</div>
              <div className="stake-sub">% del bankroll recomendado</div>
              <input type="range" min="1" max="10" value={form.stake}
                onChange={e => set('stake', parseInt(e.target.value))}
                className="stake-slider" />
            </div>

            <div className="form-group-modal">
              <FormLabel>Análisis (opcional)</FormLabel>
              <textarea className="input" rows="3" style={{ resize: 'vertical' }}
                placeholder="Explica brevemente tu razonamiento..."
                value={form.analysis} onChange={e => set('analysis', e.target.value)} />
            </div>

            <Button full onClick={onSubmit}>📤 Publicar Apuesta</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
