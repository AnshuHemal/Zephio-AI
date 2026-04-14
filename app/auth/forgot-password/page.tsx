'use client'

import { forgotPasswordAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react'
import { validateEmail } from '@/lib/email-validator'

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

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

  const handleSubmit = (formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim()
    const result = validateEmail(email)
    if (!result.valid) { setEmailError(result.reason); return }
    setEmailError(null)

    startTransition(async () => {
      await forgotPasswordAction(formData)
      // Always show success — never reveal if email exists
      setSubmittedEmail(email)
      setSubmitted(true)
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="mb-8 flex flex-col items-center gap-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/10"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </motion.div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Check your inbox</h1>
                  <p className="mt-1.5 text-base text-muted-foreground">
                    We sent a reset link to
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{submittedEmail}</p>
                </div>
              </div>

              {/* Card */}
              <div className="rounded-2xl border border-border bg-card px-8 py-7 shadow-xl shadow-black/5 space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click the link in the email to reset your password. The link expires in <span className="font-medium text-foreground">1 hour</span>.
                  </p>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Didn&apos;t receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    try again
                  </button>
                  .
                </p>
              </div>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            /* ── Request form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 flex flex-col items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <KeyRound className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Forgot password?</h1>
                  <p className="mt-1.5 text-base text-muted-foreground">
                    Enter your email and we&apos;ll send a reset link.
                  </p>
                </div>
              </motion.div>

              {/* Form card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="rounded-2xl border border-border bg-card px-8 py-8 shadow-xl shadow-black/5"
              >
                <form action={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
                        autoFocus
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

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="group h-11 w-full text-base font-semibold"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send reset link
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-5 text-center text-sm text-muted-foreground"
              >
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
