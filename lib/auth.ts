import { cookies } from 'next/headers'
import { getIronSession, IronSession } from 'iron-session'
import { prisma } from './prisma'

export interface SessionData {
  userId?: string
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'dev-secret-change-me-dev-secret-change-me',
  cookieName: 'kilometry_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session.userId) return null
  return prisma.user.findUnique({ where: { id: session.userId } })
}
