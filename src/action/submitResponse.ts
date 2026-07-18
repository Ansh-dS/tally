'use server'

import { verifyPassword } from '@/lib/utils/hash'
import { ResponseRow } from '@/containers/feedback/ResponsePage'
import { prismaClient } from '@db/client'
import { cookies, headers } from 'next/headers'
import { handleQueryError } from '@/lib/db/query-error'
import redisClient from '@/lib/redis/redis-connection'

interface unlockFormInputs {
  enteredPass: string
  hashedPassword: string
}

export async function handleUnlock({
  enteredPass,
  hashedPassword,
}: unlockFormInputs): Promise<boolean> {
  try {
    const isPassCorrect = await verifyPassword(enteredPass, hashedPassword)
    console.log('Password verification result:', isPassCorrect)
    return isPassCorrect
  } catch (err) {
    console.error('Error verifying password in Server Action:', err)
    throw err
  }
}

interface storeUserResponse {
  answers: ResponseRow
  formId: string
  visitorId: string
}

export async function submitUserResponse({
  answers,
  formId,
  visitorId,
}: storeUserResponse) {
  /*
    ipAddress
    userAgent
    formId
    */
  // header in the user request have ipAdress and userAgent.
  const header = await headers()

  const userAgent = header.get('user-agent') || 'Unknown Browser'
  const forwardedFor = header.get('x-forwarded-for')
  const cookieStore = await cookies()
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : header.get('x-real-ip') || '127.0.0.1'

  try {
    const responseRes = await prismaClient.response.create({
      data: {
        data: answers,
        formId: formId,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    })

    // Current visitor has submitted the form, so ensure the visitor row is marked submitted.
    const visitorRes = await prismaClient.formVisitor.update({
      where: {
        formId_visitorId: {
          formId,
          visitorId,
        },
      },
      data: {
        hasSubmitted: true,
      },
    })

    if (responseRes && visitorRes) {
      /* remove redisData and visitor cookie.
          redisdata=> as form submitted so can't add data
          cookie=> so user can able to give another response.
          by using del and maxAge to  0 we can delete both
      */

      await redisClient.del(`store:visitor:${visitorId}`)
      cookieStore.delete('visitor')

      return { status: 'success', message: 'form submit Successfully' }
    }
  } catch (err) {
    handleQueryError(
      err,
      'app/(public)/f/[formId]?whatHappen=Cant store user response.'
    )
  }
}
