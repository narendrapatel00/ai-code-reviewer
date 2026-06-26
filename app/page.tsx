import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Code2, ShieldAlert, Zap, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between backdrop-blur-md bg-background/50 sticky top-0 z-50 border-b border-border/50">
        <Link className="flex items-center justify-center" href="#">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-lg tracking-tight">AI Code Reviewer</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors mt-2" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors mt-2" href="#pricing">
            Pricing
          </Link>
          <div className="ml-4 flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          
          <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
            <div className="flex flex-col items-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                GPT-4 Powered Analysis
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 drop-shadow-sm max-w-4xl">
                Ship better code, <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">faster than ever.</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Automated code reviews that catch bugs, detect security flaws, and improve performance before you merge. Like having a senior engineer review every commit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto rounded-full group">
                    Start Reviewing for Free
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full">
                    See How it Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-muted/30 border-y border-border/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Comprehensive Code Analysis</h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Our AI doesn&apos;t just look for syntax errors. It understands context, architecture, and business logic.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Bug Detection",
                  description: "Find logical bugs, race conditions, and edge cases that linters miss.",
                  icon: Code2,
                  color: "text-red-500",
                  bg: "bg-red-500/10"
                },
                {
                  title: "Security Analysis",
                  description: "Detect injection flaws, hardcoded secrets, and unsafe dependencies.",
                  icon: ShieldAlert,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10"
                },
                {
                  title: "Performance",
                  description: "Identify memory leaks, expensive queries, and unoptimized loops (Big-O analysis).",
                  icon: Zap,
                  color: "text-green-500",
                  bg: "bg-green-500/10"
                },
                {
                  title: "Best Practices",
                  description: "Ensure DRY, SOLID principles, and modern language conventions.",
                  icon: BookOpen,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                }
              ].map((feature, i) => (
                <Card key={i} className="bg-background/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Start for free, upgrade when you need more power.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="flex flex-col border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Hobby</CardTitle>
                  <CardDescription>Perfect for personal projects</CardDescription>
                  <div className="mt-4 text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {['50 reviews per month', 'Basic bug detection', 'Standard support', 'Community access'].map((feature, i) => (
                      <li key={i} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Get Started</Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] bg-background/80 relative scale-105 z-10">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <CardDescription>For professional developers</CardDescription>
                  <div className="mt-4 text-4xl font-bold">$19<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {['Unlimited reviews', 'Advanced security analysis', 'Performance Big-O checks', 'Export to PDF/Markdown', 'Priority support'].map((feature, i) => (
                      <li key={i} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Upgrade to Pro</Button>
                </CardFooter>
              </Card>

              {/* Team Plan */}
              <Card className="flex flex-col border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Team</CardTitle>
                  <CardDescription>For engineering teams</CardDescription>
                  <div className="mt-4 text-4xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/mo/user</span></div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {['Everything in Pro', 'GitHub/GitLab integrations', 'Team shared prompts', 'Custom rules engine', 'Dedicated account manager'].map((feature, i) => (
                      <li key={i} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-background border-t border-border/50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2026 AI Code Reviewer. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Terms of Service</Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
