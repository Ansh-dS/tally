// central data for owner to modify data of form.
// we can create a single form having all:
// create, delete etc etc logic because:
// each asks for different input data. 

import { createInputs, updateInputs, deleteInputs } from '@schemas/form'
import { prismaClient } from '@db/client'
import { autherization } from '@auth/autherization'
import { ApiResponse, successResponse } from '@/lib/utils/common'
import { handleQueryError } from '@utils/query-error'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createForm(input: createInputs, path: string): Promise<Partial<ApiResponse>> {
    const authRes = await autherization(path)

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
                userId: user.id
            }
        }
        )

        // freah data would render.
        revalidatePath('/dashboard', 'page')

        return successResponse({
            statusCode: 201,
            path: path,
            message: 'Form successfully created'
        })

    }
    catch (err) {
        return handleQueryError(err, path)
    }



}

export async function updateForm(input: updateInputs, path: string) {
    const authRes = await autherization(path)

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
                userId: user.id
            }
        })

        // the above doesn't throw error.
        // so throw the error by yourself so could get handeled by 'handleQueryError'.
        if (result.count === 0) {
            throw new Prisma.PrismaClientKnownRequestError(
                'Record to update not found.',
                { code: 'P2025', clientVersion: '5.x.x' }
            )
        }

        // freah data would render.
        revalidatePath('/dashboard', 'page')
        revalidatePath(`/${formId}/edit`, 'page')

        return successResponse({
            statusCode: 200,
            message: "Form updated successfully",
            path: path
        })
    }

    catch (err) {
        return handleQueryError(err, path)
    }
}

export async function deleteForm(input: deleteInputs, path: string) {
    const authRes = await autherization(path)

    if (authRes.status === 'failed' || authRes.status === 'error') return authRes
    const user = authRes.data as { id: string }

    try {
        // Use deleteMany to ensure ownership
        const result = await prismaClient.form.deleteMany({
            where: {
                id: input.formId,
                userId: user.id
            }
        })

        if (result.count === 0) {
            // This mimics the Prisma error object structure
            throw new Prisma.PrismaClientKnownRequestError(
                'Record to update not found.',
                { code: 'P2025', clientVersion: '5.x.x' } // Use your Prisma version
            )
        }
        revalidatePath('/dashboard', 'page')
        return successResponse({
            statusCode: 200,
            message: "Successfully deleted Form ",
            path: path
        })
    }

    catch (err) {
        return handleQueryError(err, path)
    }
}
