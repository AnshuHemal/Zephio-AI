'use server'

import { createInsForgeServerClient, setAuthCookies, clearAuthCookies } from '@/lib/insforge-server'
import { validateEmail } from '@/lib/email-validator'
import { redirect } from 'next/navigation'
import { sendWelcomeEmail } from '@/lib/email'

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const emailCheck = validateEmail(email)
  if (!emailCheck.valid) {
    return { success: false, error: emailCheck.reason }
  }

  const insforge = await createInsForgeServerClient()
  const { data, error } = await insforge.auth.signInWithPassword({ email, password })

  if (error || !data?.accessToken || !data?.refreshToken) {
    return { success: false, error: error?.message ?? 'Sign in failed.' }
  }

  await setAuthCookies(data.accessToken, data.refreshToken)

  return { success: true }
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim()
  const redirectTo = String(formData.get('redirectTo') ?? '/')

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }
  if (!fullName) {
    return { success: false, error: 'Full name is required.' }
  }

  const emailCheck = validateEmail(email)
  if (!emailCheck.valid) {
    return { success: false, error: emailCheck.reason }
  }

  const insforge = await createInsForgeServerClient()
  const { data, error } = await insforge.auth.signUp({
    email,
    password,
    name: fullName,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/sign-in`
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (data?.requireEmailVerification) {
    return {
      success: true,
      needsVerification: true,
      email,
      fullName,
      message: 'Check your email for the verification code.',
    }
  }

  // No email verification required — session is live, save profile + DB record
  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken)

    const authedClient = await createInsForgeServerClient(data.accessToken)
    await Promise.allSettled([
      authedClient.auth.setProfile({ name: fullName }),
      data.user?.id
        ? authedClient.database
            .from('profiles')
            .upsert({ userId: data.user.id, fullName, email }, { onConflict: 'userId' })
        : Promise.resolve(),
    ])

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      to: email,
      firstName: fullName.split(' ')[0] || fullName,
    }).catch(() => {})

    return { success: true }
  }

  return { success: true, message: 'Signed up successfully.' }
}

export async function verifyEmailAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const otp = String(formData.get('otp') ?? '').trim()
  const fullName = String(formData.get('fullName') ?? '').trim()

  if (!email || !otp) {
    return { success: false, error: 'Email and verification code are required.' }
  }

  const insforge = await createInsForgeServerClient()
  const { data, error } = await insforge.auth.verifyEmail({ email, otp })

  if (error || !data?.accessToken || !data?.refreshToken) {
    return { success: false, error: error?.message ?? 'Verification failed or code expired.' }
  }

  await setAuthCookies(data.accessToken, data.refreshToken)

  if (fullName && data.user?.id) {
    const authedClient = await createInsForgeServerClient(data.accessToken)
    await Promise.allSettled([
      authedClient.auth.setProfile({ name: fullName }),
      authedClient.database
        .from('profiles')
        .upsert({ userId: data.user.id, fullName, email }, { onConflict: 'userId' }),
    ])
  }

  // Send welcome email after OTP verification (non-blocking)
  if (email) {
    sendWelcomeEmail({
      to: email,
      firstName: (fullName || email).split(' ')[0],
    }).catch(() => {})
  }

  return { success: true }
}

export async function signOutAction() {
  const insforge = await createInsForgeServerClient()
  await insforge.auth.signOut()
  await clearAuthCookies()
  redirect('/')
}
