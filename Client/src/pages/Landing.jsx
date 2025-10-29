import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, Calendar, TrendingUp, Shield, Zap, BarChart3,
  Clock, FileText, DollarSign, CheckCircle2, ArrowRight,
  Building2, Target, Globe
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import logo from '/image.png';

export default function WorkForce360Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productivityData = [
    { month: 'Jan', efficiency: 65, satisfaction: 70 },
    { month: 'Feb', efficiency: 68, satisfaction: 72 },
    { month: 'Mar', efficiency: 72, satisfaction: 75 },
    { month: 'Apr', efficiency: 75, satisfaction: 78 },
    { month: 'May', efficiency: 78, satisfaction: 82 },
    { month: 'Jun', efficiency: 85, satisfaction: 88 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 145 },
    { name: 'Sales', value: 98 },
    { name: 'Marketing', value: 67 },
    { name: 'Operations', value: 123 },
  ];

  const timeData = [
    { day: 'Mon', hours: 42 },
    { day: 'Tue', hours: 45 },
    { day: 'Wed', hours: 48 },
    { day: 'Thu', hours: 46 },
    { day: 'Fri', hours: 44 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Employee Management",
      description: "Comprehensive employee database with advanced search, filtering, and organizational hierarchy visualization."
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Time & Attendance",
      description: "Automated time tracking, leave management, and shift scheduling with real-time notifications."
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Payroll Processing",
      description: "Integrated payroll system with tax calculations, direct deposits, and comprehensive reporting."
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Performance Analytics",
      description: "Data-driven insights with customizable KPIs, performance reviews, and goal tracking."
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Document Management",
      description: "Centralized document storage with version control, e-signatures, and compliance tracking."
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control and audit logs."
    }
  ];

  const stats = [
    { label: "Active Users", value: "50,000+", icon: <Users className="h-4 w-4" /> },
    { label: "Countries", value: "150+", icon: <Globe className="h-4 w-4" /> },
    { label: "Uptime SLA", value: "99.9%", icon: <Target className="h-4 w-4" /> },
    { label: "Enterprises", value: "2,500+", icon: <Building2 className="h-4 w-4" /> },
  ];

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <nav className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-all ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
          <img src={logo} alt="WorkForce 360 Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold">WorkForce 360</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Sign Up</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1
            className="text-5xl font-bold tracking-tight sm:text-6xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
            style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}
          >
            Complete HR Management Solution
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}
          >
            Streamline your workforce with an all‑in‑one HR platform for hiring, attendance,
            payroll, performance, and analytics—built to scale securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              size="lg"
              className="gap-2 bg-white text-slate-900 hover:bg-white/90 shadow-md"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => navigate('/login')}
            >
              Schedule Demo
            </Button>
          </div>

          {/* Hero Illustration */}
          <div className="pt-10">
            <img
              src="/landing-illustration.svg"
              alt="Platform overview illustration"
              className="mx-auto w-full max-w-5xl rounded-lg border"
              loading="eager"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
            {stats.map((stat, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2 text-muted-foreground">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-center">{stat.value}</div>
                  <div className="text-sm text-muted-foreground text-center">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Data-Driven Insights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time analytics and reporting to make informed decisions about your workforce
            </p>
          </div>

          <Tabs defaultValue="productivity" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="productivity">Productivity Trends</TabsTrigger>
              <TabsTrigger value="department">Department Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="productivity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Efficiency & Satisfaction</CardTitle>
                  <CardDescription>6-month performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="satisfaction" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="department" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workforce Distribution</CardTitle>
                  <CardDescription>Employee count by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Attendance Hours</CardTitle>
                  <CardDescription>Average hours logged per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Comprehensive Feature Set</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your workforce efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Why Organizations Choose WorkForce 360</h2>
              <p className="text-muted-foreground text-lg">
                Built for scalability, security, and efficiency. Our platform adapts to your organization's unique needs.
              </p>
              <div className="space-y-3">
                {[
                  "Reduce administrative overhead by 40%",
                  "Improve employee engagement and retention",
                  "Ensure compliance with automated tracking",
                  "Scale seamlessly as your organization grows",
                  "Mobile-first architecture for remote teams",
                  "Integration with existing enterprise systems"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Real-Time Analytics
                  </CardTitle>
                  <CardDescription>
                    Monitor workforce metrics and make data-driven decisions instantly
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Enterprise Security
                  </CardTitle>
                  <CardDescription>
                    SOC 2 Type II certified with end-to-end encryption and compliance
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Automated Workflows
                  </CardTitle>
                  <CardDescription>
                    Streamline processes with intelligent automation and notifications
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl mb-3">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of organizations transforming their HR operations with WorkForce 360
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <Button size="lg">Sign Up - Free 14-Day Trial</Button>
            <Button size="lg" variant="outline">Already Registered? Login</Button>
          </CardContent>
          <CardContent className="text-center text-sm text-muted-foreground">
            No credit card required • Cancel anytime • 24/7 support included
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="font-semibold">WorkForce 360</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 WorkForce 360. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}