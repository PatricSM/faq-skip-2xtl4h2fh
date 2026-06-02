import pb from '@/lib/pocketbase/client'

export interface Drop {
  id: string
  title: string
  slug: string
  description?: string
  video_url: string
  video_id: string
  category?: string
  duration_seconds?: number
  thumbnail_url?: string
  order?: number
  is_published?: boolean
  views?: number
  created: string
  updated: string
  expand?: {
    category?: any
  }
}

export interface QuestionDrop {
  id: string
  question: string
  drop: string
  order?: number
  created: string
  updated: string
  expand?: {
    question?: any
    drop?: Drop
  }
}

export const getDrops = async (page = 1, perPage = 50, filter = '') => {
  return pb.collection('drops').getList<Drop>(page, perPage, {
    filter,
    sort: 'order,-created',
    expand: 'category',
  })
}

export const getFullDrops = async (filter = '') => {
  return pb.collection('drops').getFullList<Drop>({
    filter,
    sort: 'order,-created',
    expand: 'category',
  })
}

export const getPublishedDrops = async () => {
  return pb.collection('drops').getFullList<Drop>({
    filter: 'is_published = true',
    sort: 'order,-created',
    expand: 'category',
  })
}

export const getDropBySlug = async (slug: string) => {
  return pb.collection('drops').getFirstListItem<Drop>(`slug = "${slug}"`, {
    expand: 'category',
  })
}

export const getDrop = async (id: string) => {
  return pb.collection('drops').getOne<Drop>(id, {
    expand: 'category',
  })
}

export const createDrop = async (data: Partial<Drop>) => {
  return pb.collection('drops').create<Drop>(data)
}

export const updateDrop = async (id: string, data: Partial<Drop>) => {
  return pb.collection('drops').update<Drop>(id, data)
}

export const deleteDrop = async (id: string) => {
  return pb.collection('drops').delete(id)
}

export const incrementDropViews = async (id: string) => {
  // Safe atomic increment supported by the backend
  return pb.collection('drops').update<Drop>(id, { 'views+': 1 } as any)
}

export const getDropsByQuestion = async (questionId: string) => {
  return pb.collection('question_drops').getFullList<QuestionDrop>({
    filter: `question = "${questionId}"`,
    sort: 'order,-created',
    expand: 'drop,drop.category',
  })
}

export const getQuestionsByDrop = async (dropId: string) => {
  return pb.collection('question_drops').getFullList<QuestionDrop>({
    filter: `drop = "${dropId}"`,
    sort: 'order,-created',
    expand: 'question',
  })
}

export const linkQuestionDrop = async (questionId: string, dropId: string, order = 0) => {
  return pb.collection('question_drops').create<QuestionDrop>({
    question: questionId,
    drop: dropId,
    order,
  })
}

export const unlinkQuestionDrop = async (id: string) => {
  return pb.collection('question_drops').delete(id)
}
