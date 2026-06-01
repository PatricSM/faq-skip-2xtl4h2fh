import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'superadmin'
  isActive: boolean
  created: string
  updated: string
}

export const fetchUsers = async (): Promise<User[]> => {
  return pb.collection('users').getFullList<User>({ sort: '-created' })
}

export const getUser = async (id: string): Promise<User> => {
  return pb.collection('users').getOne<User>(id)
}

export const createUser = async (data: Partial<User> & { password?: string }): Promise<User> => {
  return pb.collection('users').create<User>({
    ...data,
    passwordConfirm: data.password,
    emailVisibility: true,
  })
}

export const updateUser = async (
  id: string,
  data: Partial<User> & { password?: string },
): Promise<User> => {
  const payload: any = { ...data }
  if (payload.password) {
    payload.passwordConfirm = payload.password
  } else {
    delete payload.password
  }
  return pb.collection('users').update<User>(id, payload)
}

export const deleteUser = async (id: string): Promise<void> => {
  return pb.collection('users').delete(id)
}
