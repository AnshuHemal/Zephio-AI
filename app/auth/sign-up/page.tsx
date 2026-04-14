'use client'

import { signUpAction, verifyEmailAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle2, Sparkles, User, ShieldCheck } from 'lucide-react'
import { validateEmail } from '@/lib/email-validator'

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [emailToVerify, setEmailToVerify] = useState('')
  const [fullNameToVerify, setFullNameToVerify] = useState('')
  const [mounted, setMounted] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (!val) { setEmailError(null); return }
    const result = validateEmail(val)
    setEmailError(result.valid ? null : result.reason)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (emailError) {
      const result = validateEmail(e.target.value.trim())
      setEmailError(result.valid ? null : result.reason)
    }
  }

  const handleSignUpSubmit = (formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim()
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      setEmailError(emailCheck.reason)
      return
    }
    setEmailError(null)
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await signUpAction(formData)
        if (result?.error) {
          setMessage({ type: 'error', text: result.error })
        } else if (result?.needsVerification && result?.email) {
          setNeedsVerification(true)
          setEmailToVerify(result.email)
          setFullNameToVerify((result as any).fullName ?? '')
          setMessage({ type: 'success', text: result.message || 'Check your email for the verification code.' })
        } else if (result?.success) {
          // Hard reload so RootLayout re-runs getCurrentUser() with the new cookies
          window.location.href = '/dashboard'
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'An error occurred' })
      }
    })
  }

  const handleVerifySubmit = (formData: FormData) => {
    setMessage(null)
    formData.append('email', emailToVerify)
    formData.append('fullName', fullNameToVerify)
    startTransition(async () => {
      try {
        const result = await verifyEmailAction(formData)
        if (result?.error) {
          setMessage({ type: 'error', text: result.error })
        } else if (result?.success) {
          // Hard reload so RootLayout re-runs getCurrentUser() with the new cookies
          window.location.href = '/dashboard'
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'An error occurred' })
      }
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">

      {/* Background ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <AnimatePresence mode="wait">

          {/* ── OTP verification step ── */}
          {needsVerification ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="mb-8 flex flex-col items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Check your email
                  </h1>
                  <p className="mt-1.5 text-base text-muted-foreground">
                    We sent a code to{' '}
                    <span className="font-semibold text-foreground">{emailToVerify}</span>
                  </p>
                </div>
              </div>

              {/* Card */}
              <div className="rounded-2xl border border-border bg-card px-8 py-8 shadow-xl shadow-black/5">
                <form action={handleVerifySubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-semibold text-foreground">
                      Verification code
                    </label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="123456"
                        maxLength={6}
                        className="h-11 pl-10 text-center font-mono text-lg tracking-[0.4em]"
                        required
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        key="msg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className={`flex items-center gap-2 rounded-lg border px-3.5 py-3 text-sm ${
                          message.type === 'error'
                            ? 'border-destructive/20 bg-destructive/8 text-destructive-foreground'
                            : 'border-green-500/20 bg-green-500/8 text-green-700 dark:text-green-400'
                        }`}>
                          {message.type === 'error'
                            ? <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                            : <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                          }
                          {message.text}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button type="submit" disabled={isPending} className="group h-11 w-full text-base font-semibold">
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Verify & continue
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={() => { setNeedsVerification(false); setMessage(null) }}
                  className="font-semibold text-foreground transition-colors hover:text-primary underline-offset-4 hover:underline"
                >
                  Go back
                </button>
              </p>
            </motion.div>

          ) : (
            /* ── Sign-up form ── */
            <motion.div
              key="signup"
              initial={false}
              animate={mounted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.97 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <motion.div
                initial={false}
                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 flex flex-col items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Create an account
                  </h1>
                  <p className="mt-1.5 text-base text-muted-foreground">
                    Start building with Zephio today
                  </p>
                </div>
              </motion.div>

              {/* Card */}
              <motion.div
                initial={false}
                animate={mounted ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="rounded-2xl border border-border bg-card px-8 py-8 shadow-xl shadow-black/5"
              >
                <form action={handleSignUpSubmit} className="space-y-5">

                  {/* Full Name */}
                  <motion.div
                    initial={false}
                    animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2"
                  >
                    <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="h-11 pl-10 text-base"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={false}
                    animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.25, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2"
                  >
                    <label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${emailError ? 'text-destructive' : 'text-muted-foreground'}`} />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`h-11 pl-10 text-base transition-colors ${emailError ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                        onBlur={handleEmailBlur}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>
                    <AnimatePresence>
                      {emailError && (
                        <motion.p
                          key="email-err"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 text-sm text-destructive"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {emailError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={false}
                    animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.3, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2"
                  >
                    <label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="h-11 pl-10 text-base"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        key="msg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className={`flex items-center gap-2 rounded-lg border px-3.5 py-3 text-sm ${
                          message.type === 'error'
                            ? 'border-destructive/20 bg-destructive/8 text-destructive-foreground'
                            : 'border-green-500/20 bg-green-500/8 text-green-700 dark:text-green-400'
                        }`}>
                          {message.type === 'error'
                            ? <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                            : <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                          }
                          {message.text}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Legal consent */}
                  <motion.p
                    initial={false}
                    animate={mounted ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.35, duration: 0.35 }}
                    className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      By creating an account, you agree to our{' '}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="font-semibold text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="font-semibold text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </motion.p>

                  {/* Submit */}
                  <motion.div
                    initial={false}
                    animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ delay: 0.38, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button type="submit" disabled={isPending} className="group h-11 w-full text-base font-semibold">
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                          Creating account…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create account
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>

              <motion.p
                initial={false}
                animate={mounted ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-5 text-center text-sm text-muted-foreground"
              >
                Already have an account?{' '}
                <Link
                  href="/auth/sign-in"
                  className="font-semibold text-foreground transition-colors hover:text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
