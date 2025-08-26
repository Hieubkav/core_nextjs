import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/constants";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {APP_CONFIG.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {APP_CONFIG.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Modern Tech Stack
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with the latest technologies for optimal performance and developer experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                Next.js 15
              </CardTitle>
              <CardDescription>
                Latest Next.js with App Router and Turbopack for blazing fast development
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                TypeScript
              </CardTitle>
              <CardDescription>
                Full TypeScript support with strict type checking and IntelliSense
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                Tailwind CSS 4
              </CardTitle>
              <CardDescription>
                Latest Tailwind CSS with CSS variables and modern features
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                shadcn/ui
              </CardTitle>
              <CardDescription>
                Beautiful, accessible components built with Radix UI and Tailwind CSS
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                MongoDB
              </CardTitle>
              <CardDescription>
                MongoDB Atlas integration with Mongoose for robust data management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                Cloudinary
              </CardTitle>
              <CardDescription>
                Image and video management with automatic optimization and transformations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Clone this template and start building your next project with confidence
          </p>
          <Button size="lg" className="text-lg px-8">
            Start Building Now
          </Button>
        </div>
      </section>
    </div>
  );
}
