import { prismaClient } from '@db/client'

// Use: Checks if a specific user is the owner of a specific form.
export async function isFormOwner(
  userId: string,
  formId: string
): Promise<boolean> {
  const form = await prismaClient.form.findUnique({
    where: { id: formId },
    select: { userId: true }, // Minimal data fetch for speed
  })

  return form?.userId === userId
}
