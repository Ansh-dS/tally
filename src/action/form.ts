// central data for owner to modify data of form.
// we can create a single form having all:
// create, delete etc etc logic because:
// each asks for different input data.

import { createInputs, updateInputs, deleteInputs } from '@schemas/form'
import { prismaClient } from '@db/client'
import { protectApiRoute } from '@/lib/auth/authorization'
import {
  ApiResponse,
  failedResponse,
  successResponse,
} from '@/lib/utils/responses'
import { handleQueryError } from '@/lib/db/query-error'
import { revalidatePath } from 'next/cache'

export async function createForm(
  input: createInputs,
  path: string
): Promise<Partial<ApiResponse>> {
  const authRes = await protectApiRoute(path)

  if (authRes.status === 'failed' || authRes.status === 'error') return authRes

  const user = authRes.data as { id: string }
  try {
    await prismaClient.form.create({
      data: {
        title: input.title,
        blocks: input.blocks,
        settings: input.settings || {},
        description: input.description,
        // foriegn key: we are directly inserting it as 'connect' is slower.
        userId: user.id,
      },
    })

    // freah data would render.
    revalidatePath('/dashboard', 'page')

    return successResponse({
      statusCode: 201,
      path: path,
      message: 'Form successfully created',
    })
  } catch (err) {
    return handleQueryError(err, path)
  }
}

export async function updateForm(input: updateInputs, path: string) {
  const authRes = await protectApiRoute(path)

  // we are using zod before we send the values inside this function.
  // here one of them ( block or data ) will exist.
  if (authRes.status === 'failed' || authRes.status === 'error') return authRes

  const user = authRes.data as { id: string }

  // better way of finding the optional data.
  const { formId, ...updates } = input

  try {
    //Regular .update() can't check userId in the 'where' clause easily
    const result = await prismaClient.form.updateMany({
      data: updates,
      where: {
        id: formId,
        // also check wether the user owns the data or not
        userId: user.id,
      },
    })

    // the above doesn't throw error.
    // so throw the error by yourself so could get handeled by 'handleQueryError'.
    if (result.count === 0) {
      return failedResponse({
        statusCode: 404,
        message: 'Record to update not found.',
        path,
      })
    }

    // freah data would render.
    revalidatePath('/dashboard', 'page')
    revalidatePath(`/${formId}/edit`, 'page')

    return successResponse({
      statusCode: 200,
      message: 'Form updated successfully',
      path: path,
    })
  } catch (err) {
    return handleQueryError(err, path)
  }
}

export async function deleteForm(input: deleteInputs, path: string) {
  const authRes = await protectApiRoute(path)

  if (authRes.status === 'failed' || authRes.status === 'error') return authRes
  const user = authRes.data as { id: string }

  try {
    // Use deleteMany to ensure ownership
    const result = await prismaClient.form.deleteMany({
      where: {
        id: input.formId,
        userId: user.id,
      },
    })

    if (result.count === 0) {
      return failedResponse({
        statusCode: 404,
        message: 'Record to delete not found.',
        path,
      })
    }
    revalidatePath('/dashboard', 'page')
    return successResponse({
      statusCode: 200,
      message: 'Successfully deleted Form ',
      path: path,
    })
  } catch (err) {
    return handleQueryError(err, path)
  }
}

interface AllFormsProps {
  userId: string
}

export async function allForms({ userId }: AllFormsProps) {
  try {
    // 1. Validation: Ensure we actually have a userId
    if (!userId) {
      return {
        success: false,
        data: null,
        message: 'Unauthorized: User ID is required.',
      }
    }

    // 2. Fetch: Get forms from Prisma
    const forms = await prismaClient.form.findMany({
      where: {
        userId: userId,
      },
      // Always show the most recently updated forms first
      orderBy: {
        updatedAt: 'desc',
      },
      // Pro-tip: Only select the fields you need for the dashboard
      // to keep the payload light.
      select: {
        id: true,
        title: true,
        published: true,
        updatedAt: true,
        _count: {
          select: { submissions: true },
        },
      },
    })

    // Keep dashboard payload shape stable even though schema uses published/submissions.
    // rather importing 'types' of form use 'tyepof'
    /* [] after 'typeof': is more about types of each element present in an object or array:
        [number]: we can call each element using forms[0]........
        so the type of each form is 'xyz'. 
      when to apply [] after 'typeof':
        if 'typeof xyz' is a object or array. 
    */
    const normalizedForms = forms.map((form: (typeof forms)[number]) => ({
      id: form.id,
      title: form.title,
      status: form.published ? 'published' : 'draft',
      updatedAt: form.updatedAt,
      _count: {
        responses: form._count.submissions,
      },
    }))

    // 3. Optional: Trigger a revalidate if the path requires fresh data
    // revalidatePath(currentPath)

    return {
      success: true,
      data: normalizedForms,
    }
  } catch (error) {
    console.error(`[ALL_FORMS_ERROR]:`, error)

    return {
      success: false,
      data: null,
      message: 'Failed to fetch forms. Please try again later.',
    }
  }
}
