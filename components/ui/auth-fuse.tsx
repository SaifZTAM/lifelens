'use client'

import * as React from 'react'
import { useState, useId, useEffect } from 'react'
import { Slot } from '@radix-ui/react-slot'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LogoFull } from '@/components/Logo'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Illustration ─────────────────────────────────────────────────────────────

function LifeLensIllustration() {
  return (
    <svg width="100%" viewBox="0 0 680 560" role="img" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .dark .bg-scene { fill: #080f0e; }
        .dark .ring-1 { stroke: #1a3a36; }
        .dark .ring-2 { stroke: #122e2a; }
        .dark .card-bg { fill: #0e201e; stroke: #1f4a44; }
        .dark .card-label { fill: #4dd8c6; }
        .dark .card-text { fill: #8ab8b2; }
        .dark .card-sub { fill: #4a7a74; }
        .dark .line-conn { stroke: #1f5a52; }
        .dark .dot-acc { fill: #2dd4bf; }
        .dark .orb-outer { fill: #0f2e2a; stroke: #1d5a52; }
        .dark .orb-pupil { fill: #061412; }
        .dark .orb-inner { stroke: #2dd4bf; }
        .dark .scan-line { stroke: #2dd4bf; }
        .dark .spec { fill: #ffffff; }
        .dark .heartbeat { stroke: #2dd4bf; }
        .dark .risk-dot { fill: #f87171; }
        .dark .risk-text { fill: #f87171; }
        .dark .pill-bg { fill: #0d9488; }
        .dark .pill-text { fill: #ffffff; }
        .dark .btn-active { fill: #0d9488; }
        .dark .btn-idle { fill: #112826; }
        .dark .btn-active-t { fill: #ffffff; }
        .dark .btn-idle-t { fill: #4a7a74; }
        .dark .score-bg { stroke: #112826; }
        .dark .score-fg { stroke: #0d9488; }
        .dark .score-num { fill: #ffffff; }
        .dark .score-sub { fill: #4dd8c6; }
        .dark .browser-bar { fill: #061412; }
        .dark .browser-url { fill: #112826; }
        .dark .browser-url-t { fill: #4dd8c6; }
        .dark .browser-line { fill: #112826; }
        .dark .browser-live { fill: #0d9488; }
        .dark .browser-live-t { fill: #c7faf3; }

        :root:not(.dark) .bg-scene { fill: #f4faf9; }
        :root:not(.dark) .ring-1 { stroke: #b2ddd8; }
        :root:not(.dark) .ring-2 { stroke: #caeae6; }
        :root:not(.dark) .card-bg { fill: #ffffff; stroke: #c2e0db; }
        :root:not(.dark) .card-label { fill: #0f766e; }
        :root:not(.dark) .card-text { fill: #374151; }
        :root:not(.dark) .card-sub { fill: #6b9e99; }
        :root:not(.dark) .line-conn { stroke: #99cdc8; }
        :root:not(.dark) .dot-acc { fill: #0d9488; }
        :root:not(.dark) .orb-outer { fill: #e0f7f5; stroke: #5eead4; }
        :root:not(.dark) .orb-pupil { fill: #064e4a; }
        :root:not(.dark) .orb-inner { stroke: #5eead4; }
        :root:not(.dark) .scan-line { stroke: #0d9488; }
        :root:not(.dark) .spec { fill: #ffffff; }
        :root:not(.dark) .heartbeat { stroke: #0d9488; }
        :root:not(.dark) .risk-dot { fill: #dc2626; }
        :root:not(.dark) .risk-text { fill: #dc2626; }
        :root:not(.dark) .pill-bg { fill: #0d9488; }
        :root:not(.dark) .pill-text { fill: #ffffff; }
        :root:not(.dark) .btn-active { fill: #0d9488; }
        :root:not(.dark) .btn-idle { fill: #f0faf9; }
        :root:not(.dark) .btn-active-t { fill: #ffffff; }
        :root:not(.dark) .btn-idle-t { fill: #6b9e99; }
        :root:not(.dark) .score-bg { stroke: #d1ece9; }
        :root:not(.dark) .score-fg { stroke: #0d9488; }
        :root:not(.dark) .score-num { fill: #0f172a; }
        :root:not(.dark) .score-sub { fill: #0d9488; }
        :root:not(.dark) .browser-bar { fill: #f0faf9; }
        :root:not(.dark) .browser-url { fill: #e0f2f0; }
        :root:not(.dark) .browser-url-t { fill: #0d9488; }
        :root:not(.dark) .browser-line { fill: #e2f4f2; }
        :root:not(.dark) .browser-live { fill: #0d9488; }
        :root:not(.dark) .browser-live-t { fill: #ffffff; }
      `}</style>

      <defs>
        <clipPath id="eyeClipP"><circle cx="340" cy="272" r="74"/></clipPath>
        <radialGradient id="orbGrad" cx="42%" cy="36%" r="58%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.95"/>
          <stop offset="45%" stopColor="#0d9488"/>
          <stop offset="100%" stopColor="#042f2e"/>
        </radialGradient>
        <radialGradient id="outerHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="680" height="560" className="bg-scene"/>
      <ellipse cx="340" cy="272" rx="270" ry="240" fill="url(#outerHalo)"/>
      <circle cx="340" cy="272" r="168" fill="none" className="ring-1" strokeWidth="0.8" strokeDasharray="5 7"/>
      <circle cx="340" cy="272" r="118" fill="none" className="ring-2" strokeWidth="0.8" strokeDasharray="2 8"/>

      <line x1="295" y1="228" x2="206" y2="154" fill="none" className="line-conn" strokeWidth="0.8" strokeDasharray="4 5"/>
      <line x1="388" y1="226" x2="462" y2="140" fill="none" className="line-conn" strokeWidth="0.8" strokeDasharray="4 5"/>
      <line x1="274" y1="278" x2="142" y2="296" fill="none" className="line-conn" strokeWidth="0.8" strokeDasharray="4 5"/>
      <line x1="400" y1="308" x2="490" y2="368" fill="none" className="line-conn" strokeWidth="0.8" strokeDasharray="4 5"/>
      <line x1="340" y1="346" x2="340" y2="412" fill="none" className="line-conn" strokeWidth="0.8" strokeDasharray="4 5"/>

      <circle cx="340" cy="272" r="100" fill="url(#outerHalo)"/>
      <circle cx="340" cy="272" r="74" fill="url(#orbGrad)"/>
      <circle cx="340" cy="272" r="74" fill="none" className="orb-outer" strokeWidth="1.2"/>
      <circle cx="340" cy="272" r="54" fill="none" className="orb-inner" strokeWidth="1" opacity="0.4"/>
      <circle cx="340" cy="272" r="38" fill="none" className="orb-inner" strokeWidth="0.8" opacity="0.25"/>
      <circle cx="340" cy="272" r="24" className="orb-pupil"/>
      <circle cx="340" cy="272" r="24" fill="none" className="orb-inner" strokeWidth="1.2" opacity="0.55"/>
      <ellipse cx="330" cy="261" rx="6" ry="4" className="spec" opacity="0.8" transform="rotate(-25 330 261)"/>
      <circle cx="350" cy="278" r="2.5" className="spec" opacity="0.3"/>
      <line x1="272" y1="272" x2="294" y2="272" fill="none" className="scan-line" strokeWidth="0.8" opacity="0.4"/>
      <line x1="386" y1="272" x2="408" y2="272" fill="none" className="scan-line" strokeWidth="0.8" opacity="0.4"/>
      <line x1="340" y1="206" x2="340" y2="222" fill="none" className="scan-line" strokeWidth="0.8" opacity="0.3"/>
      <line x1="340" y1="322" x2="340" y2="338" fill="none" className="scan-line" strokeWidth="0.8" opacity="0.3"/>

      <circle cx="340" cy="104" r="3" className="dot-acc" opacity="0.5"/>
      <circle cx="502" cy="194" r="2.5" className="dot-acc" opacity="0.35"/>
      <circle cx="172" cy="182" r="2" className="dot-acc" opacity="0.45"/>
      <circle cx="476" cy="354" r="2.5" className="dot-acc" opacity="0.3"/>
      <circle cx="186" cy="390" r="2" className="dot-acc" opacity="0.35"/>
      <circle cx="556" cy="280" r="2" className="dot-acc" opacity="0.28"/>
      <circle cx="122" cy="340" r="1.8" className="dot-acc" opacity="0.3"/>

      {/* Card 1: Nudge */}
      <rect x="64" y="96" width="196" height="108" rx="16" className="card-bg" strokeWidth="0.8"/>
      <rect x="80" y="112" width="68" height="22" rx="11" className="pill-bg"/>
      <text x="114" y="127" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="11" fontWeight="700" className="pill-text" letterSpacing="0.2">Nudge</text>
      <circle cx="164" cy="123" r="4" className="risk-dot"/>
      <text x="172" y="127" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="10" fontWeight="600" className="risk-text">82% risk</text>
      <text x="80" y="152" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="11.5" className="card-text">Reddit – 47 min. Still</text>
      <text x="80" y="168" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="11.5" className="card-text">feels like 5, right?</text>
      <rect x="80" y="178" width="50" height="16" rx="8" className="btn-active"/>
      <text x="105" y="190" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" fontWeight="600" className="btn-active-t">Got it</text>
      <rect x="138" y="178" width="50" height="16" rx="8" className="btn-idle"/>
      <text x="163" y="190" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" className="btn-idle-t">Dismiss</text>

      {/* Card 2: Browser */}
      <rect x="414" y="84" width="204" height="108" rx="16" className="card-bg" strokeWidth="0.8"/>
      <rect x="428" y="100" width="176" height="28" rx="8" className="browser-bar"/>
      <circle cx="442" cy="114" r="4.5" fill="#f87171" opacity="0.9"/>
      <circle cx="455" cy="114" r="4.5" fill="#fbbf24" opacity="0.9"/>
      <circle cx="468" cy="114" r="4.5" fill="#4ade80" opacity="0.9"/>
      <rect x="476" y="108" width="116" height="12" rx="4" className="browser-url"/>
      <text x="534" y="118" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" className="browser-url-t">youtube.com</text>
      <rect x="428" y="136" width="118" height="9" rx="3" className="browser-line"/>
      <rect x="428" y="151" width="86" height="9" rx="3" className="browser-line"/>
      <rect x="554" y="134" width="54" height="30" rx="7" className="browser-live"/>
      <text x="581" y="148" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="8" fontWeight="700" className="browser-live-t" letterSpacing="1">LIVE</text>
      <text x="581" y="159" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="8" className="browser-live-t">2.4h</text>
      <text x="428" y="182" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9.5" className="card-label" fontWeight="600" letterSpacing="0.8">SCREEN TIME DETECTED</text>

      {/* Card 3: Focus Signal */}
      <rect x="40" y="258" width="180" height="90" rx="16" className="card-bg" strokeWidth="0.8"/>
      <text x="58" y="278" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9.5" fontWeight="600" className="card-label" letterSpacing="0.8">FOCUS SIGNAL</text>
      <polyline points="58,312 72,312 80,293 90,328 100,304 112,312 126,312 134,295 144,312 160,312 174,302 188,312 202,312" fill="none" className="heartbeat" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="58" y="340" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9.5" className="card-sub">Attention active</text>

      {/* Card 4: Focus Score */}
      <rect x="456" y="342" width="176" height="132" rx="16" className="card-bg" strokeWidth="0.8"/>
      <text x="474" y="364" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9.5" fontWeight="600" className="card-label" letterSpacing="0.8">FOCUS SCORE</text>
      <circle cx="544" cy="418" r="34" fill="none" className="score-bg" strokeWidth="7"/>
      <circle cx="544" cy="418" r="34" fill="none" className="score-fg" strokeWidth="7" strokeDasharray="150 214" strokeDashoffset="54" strokeLinecap="round"/>
      <text x="544" y="414" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="20" fontWeight="800" className="score-num">84</text>
      <text x="544" y="430" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" className="score-sub">/100</text>
      <text x="544" y="464" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9.5" className="card-sub">Above avg. today</text>

      {/* Card 5: AI Intervention */}
      <rect x="244" y="416" width="192" height="60" rx="16" className="card-bg" strokeWidth="0.8"/>
      <text x="340" y="438" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9.5" fontWeight="600" className="card-label" letterSpacing="0.8">AI INTERVENTION</text>
      <rect x="260" y="447" width="46" height="16" rx="8" className="btn-active"/>
      <text x="283" y="459" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" fontWeight="600" className="btn-active-t">Block</text>
      <rect x="312" y="447" width="52" height="16" rx="8" className="btn-idle"/>
      <text x="338" y="459" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" className="btn-idle-t">Remind</text>
      <rect x="370" y="447" width="46" height="16" rx="8" className="btn-idle"/>
      <text x="393" y="459" textAnchor="middle" fontFamily="'Roc Grotesk W05 Wide Bold','Roc Grotesk W05 Wide',Arial,sans-serif" fontSize="9" className="btn-idle-t">Allow</text>
    </svg>
  )
}

// ── Typewriter ────────────────────────────────────────────────────────────────

export interface TypewriterProps {
  text: string | string[]
  speed?: number
  cursor?: string
  loop?: boolean
  deleteSpeed?: number
  delay?: number
  className?: string
}

export function Typewriter({
  text,
  speed = 100,
  cursor = '|',
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [textArrayIndex, setTextArrayIndex] = useState(0)

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[textArrayIndex] || ''

  useEffect(() => {
    if (!currentText) return
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex])
            setCurrentIndex((prev) => prev + 1)
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentIndex(0)
            setTextArrayIndex((prev) => (prev + 1) % textArray.length)
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    )
    return () => clearTimeout(timeout)
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, text, textArray.length])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────

const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70')

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

// ── Button ────────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'lg-btn lg-btn-primary',
        outline: 'lg-btn lg-btn-secondary text-foreground',
        ghost: 'hover:bg-[var(--surface-raised)] text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-6',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

// ── Input ─────────────────────────────────────────────────────────────────────

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-[var(--surface-raised)] px-3 py-3 text-sm text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

// ── PasswordInput ─────────────────────────────────────────────────────────────

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId()
    const [showPassword, setShowPassword] = useState(false)
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            className={cn('pe-10', className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

// ── Forms ─────────────────────────────────────────────────────────────────────

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  error?: string
  loading?: boolean
}

function SignInForm({ onSubmit, error, loading }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your LifeLens account</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email-signin">Email</Label>
          <Input
            id="email-signin"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--risk-high)' }}>
            {error}
          </p>
        )}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>
    </form>
  )
}

interface SignUpFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  error?: string
  loading?: boolean
}

function SignUpForm({ onSubmit, error, loading }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
        <p className="text-sm text-muted-foreground">Start understanding your focus today</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email-signup">Email</Label>
          <Input
            id="email-signup"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          minLength={8}
        />
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--risk-high)' }}>
            {error}
          </p>
        )}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </div>
    </form>
  )
}

// ── AuthUI ────────────────────────────────────────────────────────────────────

export interface AuthUIProps {
  defaultMode?: 'signin' | 'signup'
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  signInError?: string
  signUpError?: string
  signInLoading?: boolean
  signUpLoading?: boolean
  successMessage?: string
}

const QUOTES = {
  signin: 'Your focus is your greatest asset. Welcome back.',
  signup: 'The best time to understand your habits was yesterday. Today works too.',
}

export function AuthUI({
  defaultMode = 'signin',
  onSignIn,
  onSignUp,
  signInError,
  signUpError,
  signInLoading,
  signUpLoading,
  successMessage,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(defaultMode === 'signin')
  const quote = isSignIn ? QUOTES.signin : QUOTES.signup

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2" style={{ background: 'var(--background)' }}>
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
      `}</style>

      {/* Left — form */}
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">

          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <LogoFull size={28} uid="auth-form" />
          </div>

          {successMessage ? (
            <div
              className="p-6 rounded-xl border text-center"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-dim)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{successMessage}</p>
            </div>
          ) : (
            <>
              <div
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--surface)', backdropFilter: 'blur(8px)', borderColor: 'var(--border)' }}
              >
                {isSignIn ? (
                  <SignInForm onSubmit={onSignIn} error={signInError} loading={signInLoading} />
                ) : (
                  <SignUpForm onSubmit={onSignUp} error={signUpError} loading={signUpLoading} />
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignIn((p) => !p)}
                  className="font-medium underline-offset-4 hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {isSignIn ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right — premium hero illustration + quote */}
      <div
        className="hidden md:block relative min-h-screen"
        style={{ background: 'var(--auth-scene-bg)' }}
      >
        {/* Illustration fills the panel */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <LifeLensIllustration />
        </div>
        {/* Quote pinned to bottom with a fade so it always sits on the scene colour */}
        <div
          className="absolute bottom-0 inset-x-0 px-10 pb-12 text-center"
          style={{ background: `linear-gradient(to top, var(--auth-scene-bg) 55%, transparent)` }}
        >
          <blockquote className="space-y-3 max-w-sm mx-auto">
            <p className="text-lg font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              &ldquo;
              <Typewriter key={quote} text={quote} speed={55} />
              &rdquo;
            </p>
            <cite className="block text-sm not-italic" style={{ color: 'var(--text-secondary)' }}>
              — LifeLens
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
