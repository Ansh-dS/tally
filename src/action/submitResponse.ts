'use server'

import { verifyPassword } from '@/lib/utils/hash'
import { ResponseRow } from '@/containers/feedback/ResponsePage'
import { prismaClient } from '@db/client'
import { headers } from 'next/headers'
import { handleQueryError } from '@/lib/db/query-error'

interface unlockFormInputs {
    enteredPass: string,
    hashedPassword: string
}

export async function handleUnlock({ enteredPass, hashedPassword }: unlockFormInputs): Promise<boolean> {
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
    answers: ResponseRow,
    formId: string
}

export async function submitUserResponse({ answers, formId }: storeUserResponse) {
    /*
    ipAddress
    userAgent
    formId
    */
    // header in the user request have ipAdress and userAgent.
    const header = await headers()

    const userAgent= header.get('user-agent') || 'Unknown Browser'
    const forwardedFor= header.get('x-forwarded-for')
    const ipAddress= forwardedFor? forwardedFor.split(',')[0].trim(): header.get('x-real-ip') || '127.0.0.1'


    try {
        const res= await prismaClient.response.create({
            data: {
                data: answers,
                formId: formId,
                ipAddress: ipAddress ,
                userAgent: userAgent ,
            }
        })
      
        if (res) return {status:'success', message: 'form submit Successfully'}
    }
    catch (err) {
        handleQueryError(err, 'app/(public)/f/[formId]?whatHappen=Cant store user response.')
    }
}



/* what are we goigng to store.
  summary       String?                             //AI-generated summary 
  score         Int?                                //Lead quality score out of 100. 
*/