import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: RecordModel | null
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<RecordModel | null>(
    pb.authStore.isValid ? pb.authStore.record : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = Boolean(
    user &&
    typeof user.role === 'string' &&
    (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'superadmin'),
  )

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch((err) => {
          if (err.status === 401 || err.status === 403) {
            pb.authStore.clear()
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setIsLoading(false)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      pb.authStore.clear()
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
