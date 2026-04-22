// endpoint which:
// a. takes up the response.
// b. validate it.
// c. submit it.

/* 
why have we created POST Request(public) even if, we can use server actions? 
    a. if we get more users then server action can't able to process and craches.
*/

import { responseValidator } from '@schemas/response'
import { prismaClient } from '@db/client'
import { NextRequest, NextResponse } from 'next/server'
import { successResponse } from '@/lib/utils/responses'
import { handleQueryError } from '@/lib/db/query-error'
import { failedResponse } from '@/lib/utils/responses'
// {params}: special syntax to extract formId from the url.
/* 
typeof params is an object which contains:
  type definition of params as "formId:string " which is:
    wrapped around "Promise<>"
  params: Promise<{ formId: string}> 
*/
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params
  const path = `api/forms/${formId}/submit`

  try {
    const body = await req.json()
    const validatorRes = await responseValidator({
      path: path,
      formRes: { formId, ...body },
    })

    if (validatorRes.status !== 'success' || !validatorRes.data) {
      return NextResponse.json(
        failedResponse({
          statusCode: validatorRes.statusCode || 400,
          message: validatorRes.message || 'Validation failed',
          data: validatorRes, // This sends the validation details back to the frontend
          path: path,
        })
      )
    }

    // creating a new row in database.
    const resData = await prismaClient.response.create({
      data: {
        data: validatorRes.data?.answers,
        formId,
      },
    })

    // we didn't add 'summary' and 'score' in this call as creating both the things takes time.
    // so creating and storing them at correct place takes is the second step.
    return NextResponse.json(
      successResponse({
        statusCode: 201,
        message: 'Response submitted successfully',
        data: { id: resData.id },
      })
    )
  } catch (err) {
    return NextResponse.json(handleQueryError(err, path))
  }
}
