// validating response from anonymous user.
// most of the time in different formats as each form have different configuration.

import { z } from 'zod'
import { prismaClient } from '@db/client'
import { handleQueryError } from '@utils/query-error'
import { ApiResponse, errorResponse, successResponse } from '../utils/common'

// in-general format.
// output would be in json format.
const submitResponseSchema = z.object({
  // why not 'z.cuid'?
  // it takes bit of more time so we should use cuid and uuid checks only for few situations like formId
  formId: z.string().cuid(),

  // record validates 'key-value' pair
  // in below first argument is 'key:string' whereas second argument is 'z.union'.
  answers: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  ),
})

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>

export async function responseValidator(payload: {
  path: string
  formRes: SubmitResponseInput
}): Promise<Partial<ApiResponse<SubmitResponseInput>>> {
  const { path, formRes } = payload
  // validating the structure or not.
  // so any external call with invalied structure didn't get processed.
  const resSubmitResponse = submitResponseSchema.safeParse(formRes)

  if (!resSubmitResponse.success) {
    return errorResponse({
      statusCode: 400,
      message: 'Invalid submission format',
      error: resSubmitResponse.error.format(),
      path: path,
    }) as ApiResponse<SubmitResponseInput>
  }

  const validatedData = resSubmitResponse.data

  // comparing the form configuration.
  try {
    // 1. fetch the configuration.
    const form = await prismaClient.form.findUnique({
      where: {
        id: validatedData.formId,
      },
      select: {
        blocks: true,
        published: true,
      },
    })

    // 2. comparing configuration.
    // Check if form exists and is published before accepting data
    if (!form || !form.published) {
      return errorResponse({
        statusCode: 404,
        message: 'Form not found or is currently private',
        path: path,
      })
    }

    // Return the validated data so it can be saved to the database
    return successResponse({
      statusCode: 200,
      message: 'Validation successful',
      data: validatedData,
      path: path,
    })
  } catch (err) {
    return handleQueryError(err, path) as ApiResponse<SubmitResponseInput>
  }
}
