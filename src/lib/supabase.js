import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://slfgvgvguwavvbkpsngf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZmd2Z3ZndXdhdnZia3BzbmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzMwNzUsImV4cCI6MjA5MzE0OTA3NX0.QgkenXcDQb0FkXkIrZ6YaePPzq4GicM24-Uaa1kuR5M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)