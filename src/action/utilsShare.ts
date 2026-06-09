import { useCallback } from "react"
import { useToast } from "@primitives/ToastProvider/ToastProvider"

interface clipboradOutput{
  status:'error'| 'success' 
  message:string
  title: string 
}

export async function copyToClipboard(shareUrl: string):Promise<clipboradOutput>  {
  try {
    await navigator.clipboard.writeText(shareUrl);      // Main: navigator.clipboard.writeText
    return {
        message:"Copied to clipboard!",
        status: "success", 
        title:"Copied"
    } 
  } catch (err) {
    console.error("Failed to copy: ", err)
    return {
        message: "Failed to copy", 
        status: "error",
        title: "Error"
    }
  }
}

export function useCopyHandler() {
  const { showToast } = useToast()

  return useCallback(async (description: string, url: string) => {
    const res = await copyToClipboard(url)

    if (res.status === 'success') {
      showToast({
        intent: res.status,
        title: res.title,
        variant: 'glass',
        description,
      })
    } else {
      showToast({
        intent: res.status,
        title: res.title,
        description: res.message,
        variant: 'solid',
      })
    }
  }, [showToast])
}


