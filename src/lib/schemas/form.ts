import * as z from 'zod'
import { errorResponse, successResponse } from '../utils/common'

const blockSchema = z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['input', 'email', 'textArea', 'dropdown', 'payment']),
    options: z.array(z.string()).optional(),
    required: z.boolean().optional().default(false)
}))

const settingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    limitResponses: z.number().optional(),
    closed: z.boolean().optional(),
    // ........
}).optional()


//defining the structure:
// title: form 
// blocks: going ot be store in database.

// options: are optionals we only use when type is dropdown
// labels: you actual data.
// id: to uniquelly identify a block.
// dont' include userId for security.
const formSchema = z.object(
    {
        title: z.string().min(1),
        blocks: blockSchema,
        //optionals
        required: z.boolean().optional().default(false),
        description: z.string().optional(),
        published: z.boolean().optional(),
        settings: settingsSchema,
        publishedUrl: z.string().optional()
    }
)

const deleteSchema = z.object({
    formId: z.cuid()
})

const updateSchema = formSchema.pick({
    title: true,
    blocks: true,
    required: true,
    description: true,
    published: true,
    settings: true,      // can update settings
    publishedUrl: true   // can update URL
}).partial().extend({ 
    formId: z.cuid() 
}).refine((c) => { 
    return (c.blocks !== undefined || c.title !== undefined || c.description !== undefined || c.published !== undefined || c.settings !== undefined || c.publishedUrl !== undefined)
}, {
    message: "Provide some values to update." 
})


export function formValidator<T>(schema: z.ZodSchema<T>, formInput: unknown, path: string) {
    const res = schema.safeParse(formInput)
    
    // standard code for validation failure
    if (!res.success) return errorResponse({
        statusCode: 400,
        message: 'Invalid data format',
        error: res.error.format, // .format() is cleaner for frontend
        path: path
    })

    return successResponse({
        statusCode: 200,
        message: 'data format is correct',
        data: res.data, // Return the parsed data
        path: path
    })
}

export type createInputs = z.infer<typeof formSchema>
export type deleteInputs = z.infer<typeof deleteSchema>
export type updateInputs = z.infer<typeof updateSchema>