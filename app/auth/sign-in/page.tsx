'use client'

import { signInAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import { validateEmail } from '@/lib/email-validator'

export default function SignInPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (!val) { setEmailError(null); return }
    const result = validateEmail(val)
    setEmailError(result.valid ? null : result.reason)
  }

  const handleEmailChange = (e: React.FocusEvent<HTMLInputElement>) => {
    if (emailError) {
      const result = validateEmail(e.target.value.trim())
      setEmailError(result.valid ? null : result.reason)
    }
  }

  const handleSubmit = (formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim()
    const result = validateEmail(email)
    if (!result.valid) {
      setEmailError(result.reason)
      return
    }
    setError(null)
    setEmailError(null)
    startTransition(async () => {
      const res = await signInAction(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        // Hard reload so RootLayout re-runs getCurrentUser() with the new cookies
        window.location.href = '/dashboard'
      }
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">

      {/* Background ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={false}
        animate={mounted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo mark */}
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
              Welcome back
            </h1>
            <p className="mt-1.5 text-base text-muted-foreground">
              Sign in to your Zephio account
            </p>
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={false}
          animate={mounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card px-8 py-8 shadow-xl shadow-black/5"
        >
          <form action={handleSubmit} className="space-y-5">

            {/* Email */}
            <motion.div
              initial={false}
              animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
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
              transition={{ delay: 0.25, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-3.5 py-3 text-sm text-destructive-foreground">
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div
              initial={false}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ delay: 0.3, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                type="submit"
                disabled={isPending}
                className="group relative h-11 w-full overflow-hidden text-base font-semibold"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={false}
          animate={mounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-5 text-center text-sm text-muted-foreground"
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-foreground transition-colors hover:text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
