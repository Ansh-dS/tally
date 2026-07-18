'use client'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Button } from '@primitives/Button/Button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@primitives/Breadcrumb/Breadcrumb'
import { type FormBlock, type FormHeader } from '@/lib/utils/store'
import { motion, AnimatePresence } from 'framer-motion'
import { showToast } from '@primitives/ToastProvider/ToastProvider'
import { LiveFieldRenderer } from '@/containers/editor/sharePage/LiveFieldRender'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { submitUserResponse } from '@/action/submitResponse'
import { useRouter } from 'next/navigation'
import { createVisitor } from '@/lib/redis/visitor'
import { type VisitorProgress } from '@/lib/redis/visitor'

type PreviewFormData = {
  blocks: FormBlock[]
  header: FormHeader
}

type FormResponseValue = string | number | boolean | string[] | null
export type ResponseRow = Record<string, FormResponseValue>

// Renders the form either for preview or for user submission. Use `pageName` to control behavior.
export function ResponsePage({
  formData,
  formId,
  isDisabled = false,
  pageName,
}: {
  formData: PreviewFormData | null
  formId?: string
  isDisabled?: boolean
  pageName: 'submitPage' | 'previewPage'
}) {
  // 1. ALL HOOKS MUST BE AT THE TOP (Rules of Hooks)
  // according to the page number we are fetching out index range from the array
  const [currentPage, setCurrentPage] = useState(0)
  const [visitorProgress, setVisitorProgress] =
    useState<VisitorProgress | null>(null)
  const { handleSubmit, register } = useForm<ResponseRow>()
  const router = useRouter()

  // Safe defaults so useMemo below doesn't crash before data arrives
  const blocks = useMemo(
    () => (Array.isArray(formData?.blocks) ? formData.blocks : []),
    [formData]
  )
  const header = formData?.header ?? { title: '', description: '' }

  // --- PAGINATION CONFIGURATION ---
  const X_THRESHOLD = 5 // If blocks > 5, we paginate
  const Y_SUBPARTS = 2 // How many blocks to show per page

  // 1. Determine if we should paginate
  const isPaginated = blocks.length > X_THRESHOLD

  // 2. Calculate Total Pages
  const totalPages = isPaginated ? Math.ceil(blocks.length / Y_SUBPARTS) : 1

  // 3. Get ONLY the blocks for the current page
  const currentBlocks = useMemo(() => {
    if (!isPaginated) return blocks

    const startIndex = currentPage * Y_SUBPARTS
    return blocks.slice(startIndex, startIndex + Y_SUBPARTS)
  }, [blocks, currentPage, isPaginated, Y_SUBPARTS])

  // --- HANDLERS ---
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1)
  }

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1)
  }

  // below function: creating and storing visitor Progress
  useEffect(() => {
    if (pageName !== 'submitPage' || typeof formId !== 'string') return

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const progress = await createVisitor(formId)
        /* 'cancelled'=> when we remove tab or click back, we unmount this page components, 
              hence, cancled gets ture and no fetch req(tor redis) created.*/
        if (cancelled) return
        setVisitorProgress(progress)

        // requesting server.
        const fetchRes = await fetch(`/api/forms/${formId}/visitor/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress),
        })

        // handling result of fetch request
        if (!fetchRes.ok) {
          console.warn("Can't save visitor data in redis.")
        } else {
          console.log('Successfully save the visitor data in Redis')
        }
      })()
    }, 2000)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [formId, pageName])

  const onSubmit = async (data: ResponseRow) => {
    if (pageName === 'submitPage') {
      if (!visitorProgress?.visitorId) {
        showToast({
          title: 'Visitor not initialized yet. Please try again.',
          intent: 'error',
          variant: 'glass',
          hideIcon: true,
        })
        return
      }

      // send data to database.
      const isSubmitted = await submitUserResponse({
        answers: data,
        formId: formId ?? '',
        visitorId: visitorProgress.visitorId,
      })

      if (isSubmitted) {
        showToast({
          title: 'Form Submited',
          intent: 'success',
          variant: 'glass',
          hideIcon: true,
        })
        router.replace(`/f/${formId}/success`)
      }
    }
    if (pageName === 'previewPage') {
      showToast({
        title: '✨ Preview mode: Submission simulated.',
        intent: 'info',
        variant: 'glass',
        hideIcon: false,
      })
    }
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
    <Stack
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      align={'center'}
      justify={'start'}
      className="min-h-screen w-full bg-surface-base px-l text-fg-primary"
    >
      {/* HEADER & BREADCRUMBS */}
      <Stack
        direction="horizontal"
        align={'center'}
        className="w-full  h-20 justify-around px-6 border-0 animate-in fade-in duration-500 sticky top-0 bg-surface-base shadow-raised z-popover text-fg-primary"
      >
        <Text
          variant="body"
          weight="semibold"
          className="select-none"
          color={'accent'}
        >
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
            <Text variant="body" weight="semibold" color="secondary">
              {header.description}
            </Text>
          </Stack>
        )}

        {/* MAP THE BLOCKS */}
        <Stack className="gap-12 px-l">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={false}
              animate={{ opacity: 1, y: 0 }} // Animate to normal position
              exit={{ opacity: 0, y: -40 }} // Slide UP and fade out when leaving
              transition={{ duration: 0.4, ease: 'easeInOut' }} // Buttery smooth curve
              className="flex flex-col gap-12 w-full"
            >
              {blocks.length !== 0 &&
                currentBlocks.map((block, index) => (
                  <Box className=" bg-transparent border-0" key={block.id}>
                    {/* Passing block id for 'redistor' parameter . Each question marked with q1, q2, q3 ....*/}
                    <LiveFieldRenderer
                      block={block}
                      disabled={isDisabled}
                      questionNumber={index + currentPage * Y_SUBPARTS + 1}
                      register={register}
                      visitorDetails={
                        visitorProgress
                          ? {
                              visitorId: visitorProgress.visitorId,
                              userAgent: visitorProgress.userAgent,
                              formId: visitorProgress.formId,
                            }
                          : null
                      }
                    />
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
      <Box className="sticky bottom-8  max-w-170 bg-surface-overlay/15 backdrop-blur-lg border border-border-default/20 shadow-raised rounded-2xl py-4 px-6 z-50 text-fg-primary">
        {/* FIX 3: Changed justify-end back to justify-between, and removed the arbitrary ml-2xl/mr-2xl. 
            Flexbox will automatically push 'Previous' to the far left and 'Next' to the far right. */}
        <Stack
          direction="horizontal"
          align={'center'}
          className="w-full justify-between"
        >
          <Button
            variant="ghost"
            size="md"
            type="button"
            disabled={prevDisabled}
            className={prevDisabled ? 'hover:bg-trasnparent' : ''}
            onClick={handlePrev}
          >
            Previous
          </Button>

          {!isPaginated || currentPage === totalPages - 1 ? (
            <Button variant="primary" size="md" type="submit">
              Submit
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
