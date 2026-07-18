import { getAuthorizedUser } from '@/action/dashboard'
import { allForms } from '@/action/form'
import { prismaClient } from '@db/client'
import { FormBlock } from '@utils/store'
import { redirect } from 'next/navigation'
import { handleQueryError } from '../db/query-error'
import { type DashboardDropoffInsight } from '../ai/inputsAndOutputs'
import { type aiDropOffSummary } from '../ai/inputsAndOutputs'
import redisClient from '@redis/redis-connection'
type DashboardForm = {
  id: string
  title: string | null
  published: boolean
  updatedAt?: string | Date
  _count?: {
    responses?: number
    submissions?: number
  }
}

export async function getDashboardData(path: string) {
  const userData = await getAuthorizedUser(path)
  const formsRes = await allForms({
    userId: userData.id,
  })

  return {
    userData,
    formsData: formsRes.data as DashboardForm[] | null,
  }
}

// The Settings Type (What goes in the 'settings' Json column)
export interface FormSettings {
  theme: 'light' | 'dark' | 'system'
  isDraft: boolean
  showProgressBar: boolean
}

// 3. The Full Editor State (The Bridge)
export interface EditorForm {
  id: string
  title: string
  description: string | null
  published: boolean
  blocks: FormBlock[]
}
/* 
1. Below funciton is similar to above but not the same, we are fetching different data, specificly for editor. 
2. we aren't passing the data from dashboard to editor as there isn't way:
    we should avoid to pass userId from dashboard to editor because of:
      security issue. 
*/
export async function getEditorData(formId: string, path: string) {
  // 1. Authenticate user securely on the server
  const userData = await getAuthorizedUser(path)

  // run when form is not new.
  if (formId !== 'new') {
    // 2. Try fast Redis hydration FIRST (bypasses Prisma completely)
    try {
      const redisData = await redisClient.get(`draft:form:${formId}`)
      if (redisData) {
        const snapshot = JSON.parse(redisData)
        return {
          userData,
          form: {
            id: formId,
            title: snapshot.title ?? 'Untitled Form',
            description: snapshot.description ?? null,
            published: snapshot.published ?? false,
            blocks: snapshot.blocks,
          } as EditorForm,
        }
      }
    } catch (err) {
      console.warn(
        `[getEditorData] Failed to hydrate from Redis for form ${formId}:`,
        err
      )
    }

    // 3. Fetch the specific form, including the heavy JSON blocks
    const form = await prismaClient.form.findUnique({
      where: {
        id: formId,
        userId: userData.id, // Security check to ensure ownership
      },
      select: {
        id: true,
        title: true,
        description: true,
        blocks: true, // for the editor canvas
        published: true,
      },
    })

    if (form === null) {
      redirect('/forms?warning=form_not_found')
      // use an alret to tell the user that fomId doesn't exist.
    }

    return {
      userData,
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        published: form.published,
        blocks: form.blocks as unknown as FormBlock[],
      } as EditorForm,
    }
  }

  return {
    userData,
    form: null,
  }
}

export interface formType {
  title: string | undefined
  blocks: string
  expiresAt: Date | null
  password: string | null
  published: boolean
  description: string | undefined
}
export async function getform({ formId }: { formId: string }) {
  /* 
  output: 
    header, blocks, exipyAt , password, published.
  
  first fetch => then decide, weather to give autherization or not. 
  */
  try {
    const formAttributes = await prismaClient.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        title: true,
        blocks: true,
        expiresAt: true,
        password: true,
        published: true,
        description: true,
      },
    })

    return formAttributes as formType
  } catch (err) {
    console.error('500: Our database service is not working.')
  }
}

export interface FormStatItem {
  formId: string
  formTitle: string
  totalViews: number
  submissions: number
  conversionRatio: number
  published: boolean
}

export interface WorkspaceStatsAndForms {
  status: 'success' | 'failed' | 'error'
  globalStats: {
    totalViews: number
    submissions: number
    conversionRatio: number
    activeForms: number
  }
  forms: FormStatItem[]
}

export async function getFormsAndDashboardStats(
  userId: string
): Promise<WorkspaceStatsAndForms> {
  try {
    // 1. Fire both queries concurrently.
    const [userForms, rawVisitorStats] = await Promise.all([
      // A: Get all forms to establish the baseline (even if they have 0 views)
      prismaClient.form.findMany({
        where: { userId },
        select: { id: true, title: true, published: true },
      }),
      // B: Group all visitors in the entire workspace by Form and Submission Status
      prismaClient.formVisitor.groupBy({
        by: ['formId', 'hasSubmitted'],
        where: { form: { userId } }, // form contains formId, which is indirectly connected to userId, so writting 'userId' wouldn't give error.
        _count: { _all: true },
      }),
    ])

    // 2.  (O(1) lookup), building formId => {views, submissions}
    const statsTracker: Record<string, { views: number; submissions: number }> =
      {}

    rawVisitorStats.forEach((stat) => {
      const count = stat._count?._all ?? 0

      if (!statsTracker[stat.formId]) {
        statsTracker[stat.formId] = { views: 0, submissions: 0 }
      }

      // Every row is a view. If hasSubmitted is true, it ALSO counts as a submission.
      statsTracker[stat.formId].views += count
      if (stat.hasSubmitted) {
        statsTracker[stat.formId].submissions += count
      }
    })

    // 3. Assemble the final payload while calculating global totals
    let globalViews = 0
    let globalSubmissions = 0
    let activeForms = 0
    const formsBreakdown: FormStatItem[] = []

    userForms.forEach((form) => {
      const formStats = statsTracker[form.id] || { views: 0, submissions: 0 }
      let publishflag = false

      globalViews += formStats.views
      globalSubmissions += formStats.submissions

      const conversionRatio =
        formStats.views > 0
          ? parseFloat(
              ((formStats.submissions / formStats.views) * 100).toFixed(1)
            )
          : 0

      if (form.published) {
        activeForms++
        publishflag = true
      }
      formsBreakdown.push({
        formId: form.id,
        formTitle: form.title,
        totalViews: formStats.views,
        submissions: formStats.submissions,
        conversionRatio: conversionRatio,
        published: publishflag,
      })
    })

    // Sort forms by highest views first to highlight active campaigns
    formsBreakdown.sort((a, b) => b.totalViews - a.totalViews)

    const globalConversionRatio =
      globalViews > 0
        ? parseFloat(((globalSubmissions / globalViews) * 100).toFixed(1))
        : 0

    return {
      status: 'success',
      globalStats: {
        totalViews: globalViews,
        submissions: globalSubmissions,
        conversionRatio: globalConversionRatio,
        activeForms: activeForms,
      },
      forms: formsBreakdown,
    }
  } catch (err) {
    const rich = handleQueryError(err, `/`)
    console.error('getFullWorkspaceStats error', { ...rich, userId })

    return {
      status: 'error',
      globalStats: {
        totalViews: 0,
        submissions: 0,
        conversionRatio: 0,
        activeForms: 0,
      },
      forms: [],
    }
  }
}

export async function getDropOffAlerts(
  userId: string
): Promise<aiDropOffSummary> {
  try {
    //1.Querying our indexed time-series ledger directly on the server
    const latestInsight = await prismaClient.userInsight.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestInsight) {
      return {
        status: 'success',
        data: null,
        message: 'No drop-off insights generated for this workspace yet.',
      }
    }

    //2.Extract the global metrics wrapper containing both raw stats and AI insights
    const aiInsight = latestInsight.aiInsight

    return {
      status: 'success',
      data: aiInsight
        ? (aiInsight as unknown as DashboardDropoffInsight)
        : null,
      message: '',
    }
  } catch (error) {
    console.error(
      '❌ Failed to fetch dashboard AI insights via Server Action:',
      error
    )

    //3. Pass back the user-friendly message directly to the state engine
    return {
      status: 'error',
      data: null,
      message: 'We hit a temporary hiccup compiling your drop-off analytics.',
    }
  }
}
