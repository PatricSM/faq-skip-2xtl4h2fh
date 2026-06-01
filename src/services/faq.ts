import pb from '@/lib/pocketbase/client'

export interface Category {
  id: string
  slug: string
  label: string
  order: number
  created?: string
  updated?: string
}

export interface Question {
  id: string
  category: string
  question: string
  answer: string
  status: 'published' | 'draft'
  order: number
  priority?: string
  created: string
  updated?: string
  expand?: {
    category: Category
  }
}

export const getCategory = async (id: string): Promise<Category> => {
  return pb.collection('categories').getOne<Category>(id)
}

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  return pb.collection('categories').create<Category>(data)
}

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  return pb.collection('categories').update<Category>(id, data)
}

export const deleteCategory = async (id: string): Promise<void> => {
  return pb.collection('categories').delete(id)
}

export const reorderCategories = async (
  updates: { id: string; order: number }[],
): Promise<void> => {
  for (const u of updates) {
    await pb.collection('categories').update(u.id, { order: u.order })
  }
}

export const countQuestionsByCategory = async (categoryId: string): Promise<number> => {
  const result = await pb.collection('questions').getList(1, 1, {
    filter: `category = "${categoryId}"`,
    fields: 'id',
  })
  return result.totalItems
}

export const fetchCategories = async (): Promise<Category[]> => {
  return pb.collection('categories').getFullList<Category>({
    sort: 'order,label',
  })
}

export const fetchPublishedQuestions = async (): Promise<Question[]> => {
  return pb.collection('questions').getFullList<Question>({
    filter: "status = 'published'",
    sort: 'order,-created',
    expand: 'category',
  })
}

export const fetchAllQuestions = async (): Promise<Question[]> => {
  return pb.collection('questions').getFullList<Question>({
    sort: 'order,-created',
    expand: 'category',
  })
}

export const getQuestion = async (id: string): Promise<Question> => {
  return pb.collection('questions').getOne<Question>(id)
}

export const createQuestion = async (data: Partial<Question>): Promise<Question> => {
  return pb.collection('questions').create<Question>(data)
}

export const updateQuestion = async (id: string, data: Partial<Question>): Promise<Question> => {
  return pb.collection('questions').update<Question>(id, data)
}

export const deleteQuestion = async (id: string): Promise<void> => {
  return pb.collection('questions').delete(id)
}

export const reorderQuestions = async (updates: { id: string; order: number }[]): Promise<void> => {
  for (const u of updates) {
    await pb.collection('questions').update(u.id, { order: u.order })
  }
}
