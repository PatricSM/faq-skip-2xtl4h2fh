import pb from '@/lib/pocketbase/client'

export const fetchActivityLogs = async (limit: number = 100) => {
  return pb.collection('activity_logs').getList(1, limit, {
    sort: '-created',
    expand: 'user',
  })
}
