import { AlertCircle } from 'lucide-react'
import { Alert, Stack, Box } from 'components'
import { type FormBlock } from '@utils/store'
import { EditableTitle } from '@components/editor/common-functions'
import { AlertSettings } from './AlertSettings'
export const AlertBlock = {
  label: 'Alert Notice',
  icon: AlertCircle,
  // We keep the component reference for the registry
  component: Alert,

  preview: (block?: FormBlock, isOverlay?: boolean, updateBlock?: any) => {
    // Default values if the block is just being dragged from the sidebar
    const severity = block?.data?.severity || 'info'
    const message =  block?.data?.placeholder || 'This is an informational alert block.'
    const label= block?.label || "Alert Title" 

    return (
      <Box className={`w-full ${isOverlay ? 'opacity-80' : ''}`}>
        <Stack gap="sm">
          {/* Header Label (Editable only on Canvas) */}
          <EditableTitle 
            block={block} 
            isOverlay={isOverlay} 
            updateBlock={updateBlock} 
            defaultText= {label}
          />

          {/* The Actual Alert Component */}
          <Alert 
            severity={severity} 
            className="w-full pointer-events-none transition-all"
          >
            {message}
          </Alert>
        </Stack>
      </Box>
    )
  },
  settings: AlertSettings
}