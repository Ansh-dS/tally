import type { FallbackPageProps } from '@containers/fallback/FallbackPage'

export type FormAccessState = {
    canShow: boolean
    reason?: 'not_published' | 'expired' | 'password_required'
}

export type FormFallbackConfig = Pick<
    FallbackPageProps,
    'icon' | 'title' | 'description' | 'actionLabel' | 'isPasswordProtected' | 'showActionButton'
>

export const fallbacks: Record<string, FormFallbackConfig> = {
    password_required: {
        icon: '🔒',
        title: 'This form is password protected',
        description: 'Enter the form password to continue.',
        actionLabel: 'Return to Home',
        isPasswordProtected: true,
        showActionButton: false,
    },
    expired: {
        icon: '⏰',
        title: 'This form is no longer accepting responses',
        description: 'The deadline to submit has passed. Please contact the form owner if you believe this is a mistake.',
        actionLabel: 'Return to Home',
        isPasswordProtected: false,
        showActionButton: false,
    },
    not_published: {
        icon: '🔍',
        title: 'Page not found',
        description: "The form or page you are looking for doesn't exist or has been deleted.",
        actionLabel: 'Return to Home',
        isPasswordProtected: false,
        showActionButton: false,
    },
    no_form_exists: {
        icon: '',
        title: "Form doesn't exist",
        description: 'The URL link is wrong',
        isPasswordProtected: false,
        showActionButton: false,
    }
}

export async function canShowForm({
    published,
    password,
    expDate,
}: {
    published: boolean
    password?: string | null
    expDate?: Date | null
}): Promise<FormAccessState> {
    if (!published) return { canShow: false, reason: 'not_published' }
    if (expDate && expDate < new Date()) return { canShow: false, reason: 'expired' }
    // Password-protected forms still need to render so the unlock UI can mount.
    if (password?.trim()) return { canShow: true }

    return { canShow: true }
}

export async function getFormFallbackConfig(
    accessState: FormAccessState
): Promise<FormFallbackConfig | null> {

    if (accessState.canShow) return null

    return fallbacks[accessState.reason!] || fallbacks.not_published
}
