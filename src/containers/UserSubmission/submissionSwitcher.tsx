'use client'

import React, { useState, useContext, type Dispatch, type SetStateAction } from "react"
import { CheckFormPass } from "@containers/feedback/checkFormPass"
import { ResponsePage } from '@/containers/feedback/ResponsePage'
import { formType } from "@/lib/utils/data-fetchers"
import { passContext } from "../../lib/utils/passContext"


interface formData {
    formAttributes: formType
    formId: string
}

function PassProvider({ children }: { children: React.ReactNode }) {
    const [isValidPass, setValidPass] = useState<boolean>(false)

    return (
        <passContext.Provider value={{ isValidPass, setValidPass }}>
            {children}
        </passContext.Provider>
    )
}


export function SubmissionSwitcher({ formAttributes, formId }: formData) {
    const { isValidPass } = useContext(passContext)
    // Password Page. 
    const hashedPassword = formAttributes.password
    if (typeof hashedPassword === 'string' && !isValidPass) {
        return (
            <CheckFormPass hashedPassword={hashedPassword} ></CheckFormPass>
        )
    }

    // The submission page. 
    const formData = {
        blocks: JSON.parse(formAttributes.blocks),
        header: { title: formAttributes.title, description: formAttributes.description }
    }
    return <ResponsePage formData={formData} formId={formId} pageName='submitPage' />
}


export function SubmissionWithPassProvider({ formAttributes, formId }: formData) {
    return (
    <PassProvider >
        <SubmissionSwitcher formAttributes={formAttributes} formId={formId} />
    </PassProvider>)
}