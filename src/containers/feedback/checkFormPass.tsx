'use client'

import { useState,useContext, useCallback} from 'react'
import { Box } from '@/components/ui/Box/Box'
import { Button } from '@/components/ui/Button/Button'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { Input } from '@/components/ui/Input/Input'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { handleUnlock } from '@/action/submitResponse'
import { passContext } from '@/lib/utils/passContext'

type CheckFormPassProps = {
	hashedPassword: string
}

export function CheckFormPass({
	hashedPassword,

}: CheckFormPassProps) {
	const [enteredPass, setEnteredPass] = useState('')
	const { setValidPass } = useContext(passContext)
	const [error, setError] = useState(false)

	const onUnlock = useCallback(async () => {
		setError(false)
		try {
			const isCorrect = await handleUnlock({ enteredPass, hashedPassword })
			if (isCorrect) {
				setValidPass(true)
			} else {
				setError(true)
			}
		} catch (err) {
			console.error('Error occurred in handleUnlock:', err)
		}
	}, [enteredPass, hashedPassword, setValidPass, handleUnlock])

	return (
		<Stack
			direction="vertical"
			align="center"
			justify="center"
			className="min-h-screen w-screen bg-surface-sunken px-4 py-8"
		>
			<Box
				as="section"
				className="w-full max-w-120 border-0 bg-transparent p-4 shadow-none rounded-none"
			>
				<EmptyState
					variant="default"
					spacing="default"
					fullWidth
					icon={
						<Box className="aspect-square rounded-full bg-action-primary/10 border-0 shadow-none flex items-center justify-center p-4">
							<Text variant="display" color="brand" className="leading-none">
								🔒
							</Text>
						</Box>
					}
					title="This form is password protected"
					description="Enter the form password to continue."
					action={
						<Stack direction="vertical" align="center" gap="md" className="w-full">
							<Stack direction="vertical" gap="md" className="w-full">
								<Input
									type="password"
									placeholder="Enter form password"
									value={enteredPass}
									onChange={(event) => setEnteredPass(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') {
											void onUnlock()
										}
									}}
									className="w-full"
								/>
								{error &&  (
									<Text color="danger" variant="caption" className="text-center">
										Incorrect password
									</Text>
								)}

								<Button variant="primary" size="md" fullWidth onClick={onUnlock}>
									Unlock Form
								</Button>
							</Stack>


						</Stack>
					}
					className="w-full p-10 shadow-overlay"
				/>

				<Box className="mt-8 border-0 bg-transparent shadow-none flex justify-center">
					<Text variant="caption" color="secondary" align="center">
						Powered by TallyBuilder
					</Text>
				</Box>
			</Box>
		</Stack>
	)
}



export default CheckFormPass