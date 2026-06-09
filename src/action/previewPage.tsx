'use client'
/*
    why do we need preview page:
        what user actually see at the enidng point. 
*/

import { useState, useMemo, useEffect, useLayoutEffect } from 'react'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Button } from '@primitives/Button/Button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@primitives/Breadcrumb/Breadcrumb'
import { type FormBlock, type FormHeader } from '@/lib/utils/store'
import { motion, AnimatePresence } from 'framer-motion'
import { showToast } from '@primitives/ToastProvider/ToastProvider'
import { LiveFieldRenderer } from '@/containers/editor/sharePage/LiveFieldRender'

type PreviewFormData = {
  blocks: FormBlock[]
  header: FormHeader
}

const PREVIEW_CACHE_KEY = 'tally-preview-form-data'

function readPreviewCache(): PreviewFormData | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(PREVIEW_CACHE_KEY)
    if (!raw) return null

    const cached = JSON.parse(raw) as Partial<PreviewFormData>
    if (!Array.isArray(cached.blocks)) return null

    return {
      blocks: cached.blocks,
      header: {
        title: cached.header?.title ?? '',
        description: cached.header?.description ?? '',
      },
    }
  } catch {
    return null
  }
}

function writePreviewCache(data: PreviewFormData) {
  try {
    window.sessionStorage.setItem(PREVIEW_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage failures and keep the live preview functional.
  }
}

export default function PreviewPage() {
  // 1. ALL HOOKS MUST BE AT THE TOP (Rules of Hooks)
  const [formData, setFormData] = useState<PreviewFormData | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  // Safe defaults so useMemo below doesn't crash before data arrives
  const blocks = Array.isArray(formData?.blocks) ? formData!.blocks : []
  const header = formData?.header ?? { title: '', description: '' }

  useLayoutEffect(() => {
    const cachedData = readPreviewCache()
    if (cachedData) {
      setFormData(cachedData)
    }
  }, [])

  useEffect(() => {
    // creating a channel.
    const channel = new BroadcastChannel("tally-form-data")

    // handles new messages.
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.id === 'State_Updated') {
        const { blocks, header } = e.data?.formData;

        const nextData = {
          // 2. Simple defaults: if it's not there, it's an empty array/string.
          blocks: blocks ?? [],
          header: {
            title: header?.title ?? '',
            description: header?.description ?? '',
          },
        }

        setFormData(nextData)
        writePreviewCache(nextData)
      }
    }

    //SHOUT: For the first time when page loads/ reloads
    channel.postMessage({ id: 'REQUEST_INITIAL_STATE' });

    // listens new messages. 
    // this "addEvenListener" is bind to "channel" not "Document". 
    channel.addEventListener("message", handleMessage)

    // when this component unMounts we remove this listner using "useEffect" return.
    // so we reutrn a function.
    return () => {
      channel.removeEventListener("message", handleMessage)
      channel.close()
    }
  }, [])

  // --- PAGINATION CONFIGURATION ---
  const X_THRESHOLD = 5; // If blocks > 5, we paginate
  const Y_SUBPARTS = 2;  // How many blocks to show per page

  // 1. Determine if we should paginate
  const isPaginated = blocks.length > X_THRESHOLD

  // 2. Calculate Total Pages
  const totalPages = isPaginated ? Math.ceil(blocks.length / Y_SUBPARTS) : 1

  // 3. Get ONLY the blocks for the current page
  const currentBlocks = useMemo(() => {
    if (!isPaginated) return blocks;

    const startIndex = currentPage * Y_SUBPARTS
    return blocks.slice(startIndex, startIndex + Y_SUBPARTS)
  }, [blocks, currentPage, isPaginated, Y_SUBPARTS]);

  // --- HANDLERS ---
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1)
  }

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1)
  }

  const handleSubmit = () => {
    showToast(
      {
        title: "Form Submited",
        intent: "success",
        variant: "glass",
        hideIcon: true
      })
  }

  const prevDisabled = !isPaginated || currentPage === 0
  // ==========================================
  // Render nothing until the preview data arrives to avoid a visible flash.
  // ==========================================
  if (!formData) {
    return null
  }

  // --- MAIN RENDER (Only runs once formData exists) ---
  return (
    // FIX: Added min-h-screen, w-full, and the animate-in fade-in classes
    <Stack align={"center"} justify={"start"} className="min-h-screen w-full bg-surface-base px-l text-fg-primary">

      {/* HEADER & BREADCRUMBS */}
      <Stack direction="horizontal" align={"center"} className="w-full  h-20 justify-around px-6 border-0 animate-in fade-in duration-500 sticky top-0 bg-surface-base shadow-raised z-popover text-fg-primary">
        <Text variant="body" weight="semibold" className="select-none" color={"accent"}>
          {header.title || 'Untitled Form'}
        </Text>

        {/* Breadcrumbs (Only if paginated) */}
        {isPaginated && (
          <Breadcrumb variant="solid" size="sm">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <Box key={idx} className="inline-flex items-center border-0">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    isCurrentPage={idx === currentPage}
                    onClick={() => setCurrentPage(idx)}
                    className={idx !== currentPage ? 'cursor-pointer' : ''}
                  >
                    Page {idx + 1}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {idx < totalPages - 1 && <BreadcrumbSeparator />}
              </Box>
            ))}
          </Breadcrumb>
        )}
      </Stack>

      {/* MAIN CONTENT ZONE */}
      {/* FIX 1: Increased mb-12 to mb-32. 
          Why? Because the footer is sticky at the bottom, we need extra empty space 
          at the very end of the page so the footer doesn't permanently cover the last question. */}
      <Box className="flex-1 w-full max-w-170 min-h-125 flex flex-col px-10 py-12 mt-8 mb-32 border-border-default/15 shadow-popout rounded-lg bg-surface-raised text-fg-primary">

        {/* Show Title/Desc only on the very first page */}
        {currentPage === 0 && (
          <Stack gap="sm" className="mb-12 select-none">
            <Text variant="h1" className="text-4xl font-bold">
              {header.title || 'Untitled Form'}
            </Text>
            <Text variant="body" weight="semibold" color="secondary" >
              {header.description}
            </Text>
          </Stack>
        )}

        {/* MAP THE BLOCKS */}
        <Stack className="gap-12 px-l  ">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={false}
              animate={{ opacity: 1, y: 0 }}        // Animate to normal position
              exit={{ opacity: 0, y: -40 }}         // Slide UP and fade out when leaving
              transition={{ duration: 0.4, ease: "easeInOut" }} // Buttery smooth curve
              className="flex flex-col gap-12 w-full"
            >
              {blocks.length !== 0 && currentBlocks.map((block) => (
                <Box className=' bg-transparent border-0' key={block.id}>
                  <LiveFieldRenderer block={block} disabled />
                </Box>
              ))}
            </motion.div>
          </AnimatePresence>
        </Stack>


      </Box>

      {/* 🚀 THE REFINED NAVIGATION FOOTER (Floating Control Bar) */}
      {/* FIX 2: 
          - Matched max-w-170 to align perfectly with the card above.
          - Added bg-surface-base/80 and backdrop-blur-md for a premium glass effect.
          - Added a subtle border, shadow, and rounded corners to make it look like a floating remote control.
      */}
      <Box className='sticky bottom-8  max-w-170 bg-surface-overlay/15 backdrop-blur-lg border border-border-default/20 shadow-raised rounded-2xl py-4 px-6 z-50 text-fg-primary'>

        {/* FIX 3: Changed justify-end back to justify-between, and removed the arbitrary ml-2xl/mr-2xl. 
            Flexbox will automatically push 'Previous' to the far left and 'Next' to the far right. */}
        <Stack direction="horizontal" align={"center"} className="w-full justify-between" >
          
            <Button variant="ghost" size="md" disabled={prevDisabled}className={prevDisabled?"hover:bg-trasnparent": "" } onClick={handlePrev}>
              Previous
            </Button>
          

          {(!isPaginated || currentPage === totalPages - 1) ? (
            <Button variant="primary" size="md" onClick={handleSubmit}>
              Submit
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleNext}>
              Next
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

/*
 when we don't get any output then we use:
    const + arrow function
    otherwise i USE "function"
*/
export const handlePreview = (formId: string) => {
  // Use the formId from your store or params
  const previewUrl = `/forms/${formId}/preview`;

  // '_blank' ensures it opens in a new tab
  window.open(previewUrl, '_blank');
}