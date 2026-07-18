import { prismaClient } from '@db/client'
import { handleQueryError } from '../db/query-error'

export interface QuestionStat {
  questionKey: string
  questionLabel: string
  droppedCount: number
}

export interface FormStat {
  formId: string
  formTitle: string
  totalFormDropOffs: number
  questionsDetail: QuestionStat[]
}

export interface WorkspaceStats {
  status: 'success' | 'failed' | 'error'
  userId: string
  totalWorkspaceDropOffs: number
  forms: FormStat[]
}

//  formID => { formTitle=> {questionKey=> actualQestion}}
type FormMetaMap = Map<string, { title: string; labelMap: Map<string, string> }>

async function fetchUserFormsMetadata(
  userId: string
): Promise<{ allowedForms: string[]; formsDetail: FormMetaMap }> {
  const userForms = await prismaClient.form.findMany({
    where: { userId },
    select: { id: true, title: true, blocks: true },
  })

  const formsDetail: FormMetaMap = new Map()
  const allowedForms: string[] = []

  userForms.forEach((form) => {
    allowedForms.push(form.id)

    const labelMap = new Map<string, string>()
    let questions: Array<{ id: string; label: string }> = []
    if (Array.isArray(form.blocks)) {
      questions = form.blocks as Array<{ id: string; label: string }>
    } else if (typeof form.blocks === 'string') {
      try {
        const parsed = JSON.parse(form.blocks)
        if (Array.isArray(parsed)) questions = parsed
      } catch (e) {
        // ignore parse error
      }
    }

    questions.forEach((block) => {
      if (block.id && block.label) {
        labelMap.set(block.id, block.label)
      }
    })

    formsDetail.set(form.id, { title: form.title, labelMap })
  })

  return { allowedForms, formsDetail }
}

async function eachQuestionDropOff(allowedFormIds: string[]) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  return prismaClient.formVisitor.groupBy({
    by: ['formId', 'lastVisitedQuestion'],
    where: {
      formId: { in: allowedFormIds },
      hasSubmitted: false,
      createdAt: { gte: oneDayAgo },
    },
    _count: { _all: true },
  })
}

export async function getWorkspaceDropOffDataForAI(
  userId: string
): Promise<WorkspaceStats> {
  try {
    const { allowedForms, formsDetail } = await fetchUserFormsMetadata(userId)
    if (allowedForms.length === 0) {
      return { status: 'failed', userId, totalWorkspaceDropOffs: 0, forms: [] }
    }

    const rawGroupedDropOffs = await eachQuestionDropOff(allowedForms)

    const formDataTracker: Record<string, QuestionStat[]> = {}
    let totalWorkspaceDropOffs = 0

    rawGroupedDropOffs.forEach((item) => {
      const count = item._count?._all ?? 0
      totalWorkspaceDropOffs += count

      const formDetail = formsDetail.get(item.formId)
      const question =
        formDetail?.labelMap.get(item.lastVisitedQuestion) ||
        `Field Code: ${item.lastVisitedQuestion}`

      if (!formDataTracker[item.formId]) {
        formDataTracker[item.formId] = []
      }

      formDataTracker[item.formId].push({
        questionKey: item.lastVisitedQuestion,
        questionLabel: question,
        droppedCount: count,
      })
    })

    const formsBreakdown: FormStat[] = []

    formsDetail.forEach((restDetails, formId) => {
      const questionsDetail = formDataTracker[formId] || []
      questionsDetail.sort((a, b) => b.droppedCount - a.droppedCount)

      formsBreakdown.push({
        formId,
        formTitle: restDetails.title,
        totalFormDropOffs: questionsDetail.reduce(
          (sum, question) => sum + question.droppedCount,
          0
        ),
        questionsDetail,
      })
    })

    formsBreakdown.sort((a, b) => b.totalFormDropOffs - a.totalFormDropOffs)

    return {
      status: 'success',
      userId,
      totalWorkspaceDropOffs,
      forms: formsBreakdown,
    }
  } catch (err) {
    const rich = handleQueryError(err, '/')
    console.error('getWorkspaceDropOffDataForAI error', { ...rich, userId })

    return { status: 'error', userId, totalWorkspaceDropOffs: 0, forms: [] }
  }
}
