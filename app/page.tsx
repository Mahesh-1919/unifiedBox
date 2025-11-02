import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Users,
  BarChart3,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Unified Inbox</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Manage All Your Customer Conversations in One Place
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Unify SMS, WhatsApp, email, and social messages into a single
                collaborative inbox. Respond faster, work together seamlessly,
                and never miss a customer message.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild data-testid="button-get-started">
                  <a href="/login">Get Started</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  data-testid="button-learn-more"
                >
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-card border border-card-border rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-muted/60 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-chart-2" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-2 bg-muted/60 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-chart-3" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-4/5 mb-2"></div>
                      <div className="h-2 bg-muted/60 rounded w-2/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need for Customer Communication
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help teams collaborate and respond
              to customers efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="bg-card border border-card-border rounded-lg p-6"
              data-testid="feature-unified-inbox"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unified Inbox</h3>
              <p className="text-muted-foreground">
                Aggregate messages from SMS, WhatsApp, email, and social media
                into one collaborative inbox
              </p>
            </div>

            <div
              className="bg-card border border-card-border rounded-lg p-6"
              data-testid="feature-real-time"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Get instant notifications when new messages arrive. See
                who&apos;s typing and collaborate in real-time
              </p>
            </div>

            <div
              className="bg-card border border-card-border rounded-lg p-6"
              data-testid="feature-team"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Share notes, assign conversations, and work together with
                role-based permissions
              </p>
            </div>

            <div
              className="bg-card border border-card-border rounded-lg p-6"
              data-testid="feature-analytics"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Track response times, message volumes, and engagement metrics
                across all channels
              </p>
            </div>

            <div
              className="bg-card border border-card-border rounded-lg p-6"
              data-testid="feature-contacts"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Contact Management</h3>
              <p className="text-muted-foreground">
                Keep track of all customer interactions with complete message
                history and team notes
              </p>
            </div>

            <div
              className="bg-card border border-card-border rounded-lg p-6"
              data-testid="feature-multi-channel"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Multi-Channel Support
              </h3>
              <p className="text-muted-foreground">
                Send and receive messages across SMS, WhatsApp, and more from a
                single interface
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Unify Your Customer Communications?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join teams who are already responding faster and collaborating
            better
          </p>
          <Button size="lg" asChild data-testid="button-cta-start">
            <a href="/login">Start Now</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            © 2024 Unified Inbox. Built for teams that care about customer
            communication.
          </p>
        </div>
      </footer>
    </div>
  );
}
