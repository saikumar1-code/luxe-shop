import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uincleqwecexlfhhoqnm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbmNsZXF3ZWNleGxmaGhvcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjcwNjMsImV4cCI6MjA4Nzc0MzA2M30.d-_i6EUZvONnGsNW3XuInkmbECBlh37ymba-qLNPXPs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
