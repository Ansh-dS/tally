import { createContext, type Dispatch, type SetStateAction } from "react"

interface contextInputs {
    setValidPass: Dispatch<SetStateAction<boolean>>
    isValidPass: boolean
}

export const passContext = createContext<contextInputs>({ 
    setValidPass: () => {}, 
    isValidPass: false 
})
