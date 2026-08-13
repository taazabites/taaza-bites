import React, { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { Navigate, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { UtensilsCrossed, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { user, login, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (user) {
    return <Navigate to="/" replace />
  }

  const isLoginDisabled = loading || !email || !password || password.length < 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    
    try {
      await login(email, password)
      navigate("/")
    } catch (err: any) {
      if (err.code === 'auth/captcha-check-failed') {
        setError("reCAPTCHA validation failed. Please check your network or try again.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "An error occurred during sign in.");
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError("")
    setSuccess("")
    if (!email) {
      setError("Please enter your email address first.")
      return
    }
    setLoading(true)
    try {
      await resetPassword(email)
      setSuccess("Password reset email sent successfully! Check your inbox.")
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
            <UtensilsCrossed className="h-6 w-6 text-zinc-950" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">TaazaBites</h1>
          <p className="text-zinc-400 font-medium tracking-widest text-sm uppercase mt-1">Admin Portal</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl">Authentication</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your clearance credentials to access the terminal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email" 
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-emerald-500 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                  required
                  autoComplete="new-password"
                />
              </div>
              
              {error && (
                <p className="text-xs text-rose-500 font-medium">{error}</p>
              )}

              {success && (
                <p className="text-xs text-emerald-500 font-medium">{success}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                disabled={isLoginDisabled}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Signing in..." : "Initiate Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

