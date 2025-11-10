import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  ALLOWED_ORIGINS: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS.split(',')
  const origin = c.req.header('origin') || ''

  return cors({
    origin: allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next)
})

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'NhapLuu API',
    version: '1.0.0',
    status: 'ok',
    message: 'Sabbe sattā sukhi hontu ☸️'
  })
})

// API Routes
app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: Date.now() })
})

// Auth routes
app.post('/api/auth/register', async (c) => {
  try {
    const { email } = await c.req.json()

    // Simple validation
    if (!email || !email.includes('@')) {
      return c.json({ error: 'Invalid email' }, 400)
    }

    // Generate user ID
    const userId = crypto.randomUUID()
    const now = Date.now()

    // Insert user
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, created_at, last_sync) VALUES (?, ?, ?, ?)'
    ).bind(userId, email, now, now).run()

    // Generate simple token (in production, use proper JWT)
    const token = btoa(JSON.stringify({ userId, email, exp: now + 30 * 24 * 60 * 60 * 1000 }))

    return c.json({
      success: true,
      user: { id: userId, email },
      token
    })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    return c.json({ error: 'Registration failed' }, 500)
  }
})

app.post('/api/auth/login', async (c) => {
  try {
    const { email } = await c.req.json()

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Generate token
    const now = Date.now()
    const token = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: now + 30 * 24 * 60 * 60 * 1000
    }))

    return c.json({
      success: true,
      user: { id: user.id, email: user.email },
      token
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Meditation routes
app.get('/api/meditations', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { userId } = JSON.parse(atob(token))

    const sessions = await c.env.DB.prepare(
      'SELECT * FROM meditation_sessions WHERE user_id = ? ORDER BY date DESC LIMIT 100'
    ).bind(userId).all()

    return c.json({ sessions: sessions.results })
  } catch (error: any) {
    console.error('Failed to fetch sessions:', error)
    return c.json({ error: 'Failed to fetch sessions', message: error.message }, 500)
  }
})

app.post('/api/meditations', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { userId } = JSON.parse(atob(token))
    const session = await c.req.json()

    const id = session.id || crypto.randomUUID()
    const now = Date.now()

    await c.env.DB.prepare(
      `INSERT INTO meditation_sessions (id, user_id, date, duration, type, quality, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, userId, session.date, session.duration, session.type,
      session.quality || null, session.notes || null, now, now
    ).run()

    return c.json({ success: true, id })
  } catch (error: any) {
    console.error('Failed to save session:', error)
    return c.json({ error: 'Failed to save session', message: error.message }, 500)
  }
})

// Sync endpoint
app.post('/api/sync', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { userId } = JSON.parse(atob(token))
    const { data, lastSync } = await c.req.json()

    // Simple sync: push all local data to server
    const now = Date.now()

    // Insert/update meditation sessions
    if (data.meditationSessions?.length) {
      for (const session of data.meditationSessions) {
        await c.env.DB.prepare(
          `INSERT OR REPLACE INTO meditation_sessions (id, user_id, date, duration, type, quality, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          session.id, userId, session.date, session.duration, session.type,
          session.quality || null, session.notes || null, now, now
        ).run()
      }
    }

    // Insert/update precepts
    if (data.preceptsRecords?.length) {
      for (const record of data.preceptsRecords) {
        await c.env.DB.prepare(
          `INSERT OR REPLACE INTO precepts_records (id, user_id, date, type, precepts, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          record.id, userId, record.date, record.type,
          JSON.stringify(record.precepts), record.notes || null, now, now
        ).run()
      }
    }

    // Insert/update program progress
    if (data.programProgress) {
      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO program_progress (user_id, start_date, current_week, completed_days, milestones, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        userId, data.programProgress.startDate, data.programProgress.currentWeek,
        JSON.stringify(data.programProgress.completedDays),
        JSON.stringify(data.programProgress.milestones), now
      ).run()
    }

    // Update sync metadata
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO sync_metadata (user_id, last_pull, last_push) VALUES (?, ?, ?)`
    ).bind(userId, now, now).run()

    return c.json({ success: true, synced_at: now })
  } catch (error: any) {
    console.error('Sync error:', error)
    return c.json({ error: 'Sync failed', message: error.message }, 500)
  }
})

export default app
