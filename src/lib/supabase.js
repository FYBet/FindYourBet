// Configuració centralitzada del client Supabase
// Qualsevol canvi de projecte només cal fer-lo aquí
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://slfgvgvguwavvbkpsngf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_HAtXntR__hl6efd6JK6klQ_9EKqV_qS'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)