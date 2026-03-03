import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Navigation */}
      <nav className="p-4 md:p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">RentPro</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/customer/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Customer Sign In</Button>
            </Link>
            <Link to="/producer/login">
              <Button variant="ghost" size="sm">Vendor Sign In</Button>
            </Link>
            <Link to="/producer/register">
              <Button variant="gradient" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Manage Your Equipment Rentals{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your equipment rental business with our comprehensive vendor dashboard. 
            Track inventory, manage bookings, and grow your revenue effortlessly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/producer/register">
              <Button size="lg" variant="gradient" className="shadow-primary">
                Start as Vendor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/customer/register">
              <Button size="lg" variant="outline" className="shadow-medium">
                Browse Equipment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed specifically for equipment rental businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-medium bg-gradient-card border-0 hover:shadow-strong transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Complete control over your equipment catalog with real-time availability tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium bg-gradient-card border-0 hover:shadow-strong transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Instant Bookings</CardTitle>
                <CardDescription>
                  Accept and manage rental requests with automated booking workflows
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium bg-gradient-card border-0 hover:shadow-strong transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Detailed insights into your business performance and revenue trends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium bg-gradient-card border-0 hover:shadow-strong transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Integrated payment processing with automatic invoicing and receipts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium bg-gradient-card border-0 hover:shadow-strong transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Maintenance Tracking</CardTitle>
                <CardDescription>
                  Schedule and track equipment maintenance to maximize uptime
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium bg-gradient-card border-0 hover:shadow-strong transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Mobile Ready</CardTitle>
                <CardDescription>
                  Access your dashboard anywhere with our responsive mobile interface
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="shadow-strong bg-gradient-card border-0 p-8">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of vendors who trust RentPro to manage their equipment rentals
              </p>
              <Link to="/producer/register">
                <Button size="lg" variant="gradient" className="shadow-primary">
                  Get Started Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} RentPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};