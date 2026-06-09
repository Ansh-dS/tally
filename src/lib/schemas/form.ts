import * as z from 'zod'
import { errorResponse, successResponse } from '@utils/responses'

const blockDataSchema = z
  .object({
    placeholder: z.string().optional(),
    buttonText: z.string().optional(),
    severity: z.string().optional(),
    options: z.array(z.string()).optional(),
    defaultChecked: z.boolean().optional(),
  })
  .catchall(z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]))

const blockSchema = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum([
      'input',
      'email',
      'textarea',
      'textArea',
      'radio',
      'checkbox',
      'select',
      'switch',
      'Button',
      'Alert',
    ]),
    required: z.boolean().optional().default(false),
    data: blockDataSchema.optional(),
  })
)

const settingsSchema = z
  .object({
    limitResponses: z.number().optional(),
    closed: z.boolean().optional(),
  })
  .optional()

//defining the structure:
// title: form
// blocks: going ot be store in database.

// options: are optionals we only use when type is dropdown
// labels: you actual data.
// id: to uniquelly identify a block.
// dont' include userId for security.
export const formSchema = z.object({
  title: z.string().min(1),
  blocks: blockSchema,
  description: z.string().optional(),
  published: z.boolean().optional(),
  settings: settingsSchema,
})

export const deleteSchema = z.object({
  formId: z.cuid(),
})

export const updateSchema = formSchema
  .pick({
    title: true,
    blocks: true,
    description: true,
    published: true,
    settings: true, // can update settings
  })
  .partial()
  .extend({
    formId: z.cuid(),
  })
  .refine(
    (c) => {
      return (
        c.blocks !== undefined ||
        c.title !== undefined ||
        c.description !== undefined ||
        c.published !== undefined ||
        c.settings !== undefined
      )
    },
    {
      message: 'Provide some values to update.',
    }
  )

export function formValidator<T>(
  schema: z.ZodSchema<T>,
  formInput: unknown,
  path: string
) {
  const res = schema.safeParse(formInput)

  // standard code for validation failure
  if (!res.success)
    return errorResponse({
      statusCode: 400,
      message: 'Invalid data format',
      error: res.error.format(), // .format() is cleaner for frontend
      path: path,
    })

  return successResponse({
    statusCode: 200,
    message: 'data format is correct',
    data: res.data, // Return the parsed data
    path: path,
  })
}

export type createInputs = z.infer<typeof formSchema>
export type deleteInputs = z.infer<typeof deleteSchema>
export type updateInputs = z.infer<typeof updateSchema>
