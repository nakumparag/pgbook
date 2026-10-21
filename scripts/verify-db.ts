import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const envPath of ['.env.local', '.env']) {
  if (!existsSync(envPath)) continue
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2').replace(/\s+#.*$/, '')
    process.env[match[1]] = value
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and Supabase public key in .env.local or .env')
  process.exit(1)
}

// Log connection info (safely masking the key)
console.log(`Connecting to: ${supabaseUrl}`)
console.log('Supabase public key loaded.')

const supabase = createClient(supabaseUrl, supabaseKey)

const tablesToVerify = [
  'profiles',
  'cities',
  'localities',
  'colleges',
  'business_hubs',
  'pgs',
  'rooms',
  'amenities',
  'pg_amenities',
  'pg_images',
  'favorites',
  'comparisons',
  'saved_searches',
  'visit_bookings',
  'reviews',
  'reports',
  'notifications',
  'collections',
  'collection_pgs',
  'blog_categories',
  'blog_posts'
]

async function verifyTables() {
  console.log('\n--- Table Verification ---')
  let allExist = true
  let serviceUnavailable = false

  for (const table of tablesToVerify) {
    try {
      // We do a limit(0) query just to check if the endpoint exists
      const { data, error } = await supabase.from(table).select('*').limit(0)
      
      if (error) {
        const message = error.message.toLowerCase()
        if (/521|502|503|504|bad gateway|web server is down|fetch failed/.test(message)) {
          console.error(`❌ Supabase API unavailable while checking ${table}: ${error.message.slice(0, 180)}`)
          allExist = false
          serviceUnavailable = true
        } else if (error.code === 'PGRST205' || message.includes('relation') || message.includes('does not exist')) {
          console.log(`❌ Table missing: ${table}`)
          allExist = false
        } else if (error.code === '42501' || error.code === '401' || error.code === '403') {
          // 42501 = Permission Denied. This proves the table exists, but RLS/grants are blocking anon access.
          console.log(`✅ Table exists and is secured: ${table}`)
        } else {
          console.log(`⚠️  Table ${table} error: ${error.message} (Code: ${error.code})`)
          allExist = false
        }
      } else {
        console.log(`✅ Table exists: ${table}`)
      }
    } catch (e: any) {
      console.log(`❌ Error checking ${table}:`, e.message)
      allExist = false
    }
  }
  
  console.log('\n--- Storage Verification ---')
  console.log('ℹ️  Storage bucket access is not checked by this script; verify pg-images in Supabase Dashboard.')

  return { allExist, serviceUnavailable }
}

verifyTables().then(({ allExist, serviceUnavailable }) => {
  if (!allExist) {
    console.error(serviceUnavailable
      ? '\nDatabase verification failed because the Supabase API is unavailable. Check the project status and retry.'
      : '\nDatabase verification failed. Review missing tables and permissions above.')
    process.exitCode = 1
    return
  }
  console.log('\nDatabase tables verified. Storage still needs a dashboard check.')
}).catch((error) => {
  console.error('\nDatabase verification could not complete:', error)
  process.exitCode = 1
})
