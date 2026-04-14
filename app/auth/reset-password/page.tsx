'use client'

import { resetPasswordAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState, useTransition, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Lock, Eye, EyeOff, ArrowRight, AlertCircle,
  CheckCircle2, KeyRound, ShieldCheck,
} from 'lucide-react'

// Password strength helpers
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' }
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' }
  return { score, label: 'Strong', color: 'bg-green-500' }
}

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [otp, setOtp] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Pre-fill OTP from URL hash/query if Insforge puts it there
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token') ?? params.get('otp') ?? ''
    if (token) setOtp(token)
  }, [])

  const strength = getStrength(password)
  const mismatch = confirm.length > 0 && password !== confirm

  const handleOtpInput = (index: number, value: string) => {
    // Allow pasting full code into first box
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      setOtp(digits)
      otpRefs.current[Math.min(digits.length, 5)]?.focus()
      return
    }
    const digits = otp.split('')
    digits[index] = value.replace(/\D/g, '')
    const next = digits.join('')
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (otp.length < 6) { setError('Please enter the 6-digit code from your email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    const formData = new FormData()
    formData.set('otp', otp)
    formData.set('newPassword', password)
    formData.set('confirmPassword', confirm)

    startTransition(async () => {
      const res = await resetPasswordAction(formData)
      if (res.error) { setError(res.error); return }
      setDone(true)
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <AnimatePresence mode="wait">
          {done ? (
            /* ── Success state ── */
            <motion.div
              key="done"
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 flex flex-col items-center gap-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/10"
                >
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                </motion.div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Password updated</h1>
                  <p className="mt-1.5 text-base text-muted-foreground">
                    Your password has been reset successfully.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card px-8 py-7 shadow-xl shadow-black/5">
                <Button className="w-full h-11 text-base font-semibold gap-2" asChild>
                  <Link href="/auth/sign-in">
                    Sign in with new password
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            /* ── Reset form ── */
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
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset password</h1>
                  <p className="mt-1.5 text-base text-muted-foreground">
                    Enter the code from your email and choose a new password.
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
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* OTP boxes */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-foreground">
                      6-digit reset code
                    </label>
                    <div className="flex gap-2 justify-between">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp[i] ?? ''}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onFocus={(e) => e.target.select()}
                          className="h-12 w-full rounded-lg border border-border bg-background text-center text-lg font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 caret-primary"
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* New password */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2"
                  >
                    <label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                      New password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Strength meter */}
                    <AnimatePresence>
                      {password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <div className="flex gap-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i < strength.score
                                    ? strength.color
                                    : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${
                            strength.score <= 1 ? 'text-destructive' :
                            strength.score <= 2 ? 'text-amber-500' :
                            strength.score <= 3 ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {strength.label}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Confirm password */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2"
                  >
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${mismatch ? 'text-destructive' : 'text-muted-foreground'}`} />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`h-11 pl-10 pr-10 text-base transition-colors ${mismatch ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {mismatch && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 text-sm text-destructive"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          Passwords don&apos;t match
                        </motion.p>
                      )}
                    </AnimatePresence>
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button
                      type="submit"
                      disabled={isPending || mismatch || otp.length < 6 || password.length < 8}
                      className="group h-11 w-full text-base font-semibold"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                          Updating…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Set new password
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
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-5 text-center text-sm text-muted-foreground"
              >
                Remember it?{' '}
                <Link
                  href="/auth/sign-in"
                  className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
