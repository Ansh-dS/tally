'use client'
/*
    why do we need preview page:
        what user actually see at the enidng point. 
*/

import { useState, useEffect, useLayoutEffect } from 'react'
import { type FormBlock, type FormHeader } from '@/lib/utils/store'
import { ResponsePage } from '@/containers/feedback/ResponsePage'

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


  return (<ResponsePage formData={formData} isDisabled={true} pageName='previewPage' />)
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