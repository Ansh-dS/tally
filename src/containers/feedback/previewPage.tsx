'use client'
/*
    Why do we need a preview page:
    It shows exactly what the final form looks like to the regular user, 
    but with inputs disabled so the form creator can test the design.
*/

import { useState, useEffect } from 'react'
import { type FormBlock, type FormHeader } from '@/lib/utils/store'
import { ResponsePage } from '@/containers/feedback/ResponsePage'

// (array of questions + title/description)
type PreviewFormData = {
  blocks: FormBlock[]
  header: FormHeader
}

//  to save our preview data inside the browser session
const PREVIEW_CACHE_KEY = 'tally-preview-form-data'

// Reads the saved form data from the browser session storage
function readPreviewCache(): PreviewFormData | null {
  // If the code is running on the server, browser storage doesn't exist yet, so return nothing
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(PREVIEW_CACHE_KEY)
    if (!raw) return null

    const cached = JSON.parse(raw) as Partial<PreviewFormData>
    if (!Array.isArray(cached.blocks)) return null

    // Return the cached data, using safe empty strings if text is missing
    return {
      blocks: cached.blocks,
      header: {
        title: cached.header?.title ?? '',
        description: cached.header?.description ?? '',
      },
    }
  } catch {
    return null // If something crashes while parsing, act like there is no cache
  }
}

// Saves the latest form data into the browser session storage
function writePreviewCache(data: PreviewFormData) {
  try {
    window.sessionStorage.setItem(PREVIEW_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage failures so the preview tab keeps working smoothly
  }
}

export default function PreviewPage() {
  // 1. ALL HOOKS MUST BE AT THE TOP (Rules of Hooks)

  const [formData, setFormData] = useState<PreviewFormData | null>(null)

  // This hook runs exactly once when the page loads in the browser
  useEffect(() => {
    // A. Read the temporary session cache first to quickly show the last saved state
    const cachedData = readPreviewCache()
    if (cachedData) {
      // The comment below tells our strict linter to allow this state update on mount
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(cachedData)
    }

    // B. Create a communication line named 'tally-form-data' to talk to the main editor tab
    const channel = new BroadcastChannel('tally-form-data')

    // C. Define what happens when the editor tab sends new form details over the channel
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.id === 'State_Updated') {
        const { blocks, header } = e.data?.formData

        const nextData = {
          // Simple defaults: if values are missing, use an empty array or empty string
          blocks: blocks ?? [],
          header: {
            title: header?.title ?? '',
            description: header?.description ?? '',
          },
        }

        // Update the screen state and save it to the backup session storage
        setFormData(nextData)
        writePreviewCache(nextData)
      }
    }

    // D. SHOUT: Broadcast a message to the editor tab asking for the absolute freshest state
    channel.postMessage({ id: 'REQUEST_INITIAL_STATE' })

    // E. Tell our communication channel to start listening for incoming messages
    channel.addEventListener('message', handleMessage)

    // F. CLEANUP: When the user closes this tab, disconnect the channel listeners to save memory
    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [])

  // Render the core layout renderer component, forcing inputs to be disabled since this is a preview
  return (
    <ResponsePage
      formData={formData}
      isDisabled={true}
      pageName="previewPage"
    />
  )
}

/*
  Coding Style Note:
  When a utility function doesn't return JSX or state outputs, we export it as a standard arrow function variable.
*/
export const handlePreview = (formId: string) => {
  // Construct the internal application preview URL route path
  const previewUrl = `/forms/${formId}/preview`

  // '_blank' makes sure the preview opens up in a brand new browser tab window
  window.open(previewUrl, '_blank')
}
