import { useState } from "react";

import { useApp } from "@/providers/AppProvider";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, { login }] = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    login(email, password).then((success: boolean) => {
      if (success) {
        navigate("/dashboard");
      }
    });

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In
    console.log("Google Sign-In clicked");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log("Forgot password clicked");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-500/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-3">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <img src="/assets/logo-green-v.png" className="w-[320px]" />
          <p className="text-base text-muted-foreground">Real-time ATM transaction monitoring and failure prediction system</p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80 dark:shadow-black/30">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-12 border-gray-200 bg-white/50 focus:border-primary dark:border-gray-600 dark:bg-gray-900/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button type="button" className="text-sm font-medium text-primary hover:underline" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 border-gray-200 bg-white/50 focus:border-primary dark:border-gray-600 dark:bg-gray-900/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full text-base font-medium" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-3 font-medium text-muted-foreground dark:bg-gray-800/80">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/50 text-base font-medium hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" className="font-medium text-primary hover:underline">
                  Contact us to register
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
