import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Button } from '@primitives/Button/Button'
import { Alert } from '@primitives/Alert/Alert'
import { Input } from '@primitives/Input/Input'
import { Send, X } from 'lucide-react'
import type { ReactNode } from 'react'

interface SheetContentInput {
  setAssistantOpen: (open: boolean) => void
}

export function SheetContent({ setAssistantOpen }: SheetContentInput): ReactNode {
  return (
    <Stack gap="none" className="h-full">
     <Box className="rounded-none border-0 border-b border-slate-800 bg-slate-950/70 p-4">
       <Stack direction="horizontal" align="center" gap="sm" className="justify-between">
         <Stack gap="none">
           <Text variant="label" weight="semibold">
             AI Data Assistant Copilot
           </Text>
           <Text variant="caption" color="secondary">
             Query individual submission records dynamically using custom natural language logic.
           </Text>
         </Stack>
         <Button
           variant="ghost"
           size="sm"
           collapsed
           aria-label="Close assistant"
           onClick={() => setAssistantOpen(false)}
         >
           <X />
         </Button>
       </Stack>
     </Box>

     <Stack gap="md" className="flex-1 overflow-y-auto p-4">
       <Box className="border-0 bg-slate-950/60 p-4">
         <Text variant="caption" color="secondary">
           Hi Anshdeep! Ask me anything about your 3,401 form completions. I will fetch matching rows natively.
         </Text>
       </Box>

       <Box className="border-0 bg-brand/10 p-4">
         <Text variant="caption" color="secondary">
           Show me what students from @iitp.ac.in thought about the pricing structure blocks.
         </Text>
       </Box>

       <Alert severity="info">
         Database Filter Parameter Extracted: {`{ "College Email": "iitp.ac.in" }`}
       </Alert>

       <Box className="border-0 bg-slate-950/60 p-4">
         <Text variant="body">
           Based on the matched responses, students from IIT Patna find the core tier affordable due to student
           discounts, but mention that the standard premium limits feel steep for individual projects.
         </Text>
       </Box>
     </Stack>

     <Box className="rounded-none border-0 border-t border-slate-800 bg-slate-950/70 p-4">
       <Stack direction="horizontal" align="center" gap="sm">
         <Input
           placeholder="Query fields, sum values, isolate bugs..."
           className="bg-slate-950"
         />
         <Button variant="primary" endIcon={<Send />} className="shrink-0">
           Stream Run
         </Button>
       </Stack>
     </Box>
    </Stack>
  )
}