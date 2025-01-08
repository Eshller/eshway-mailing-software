import { ArrowRight, Mail, Users, BarChart3, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import { Cover } from '@/components/ui/cover';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557264337-e8a93017fe92?auto=format&fit=crop&q=80')] opacity-5 bg-center bg-cover" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center mb-6">
              <img src="/1bg.png" alt="" className="h-24 w-24" />
              {/* <Mail className="h-12 w-12 text-[#d86dfc]" /> */}
              <span className="ml-3 text-3xl font-bold text-black">
                MAIL<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d86dfc] to-purple-600">WAY</span>
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Transform Your Email Marketing
              <span className="block text-[#d86dfc]"><Cover>With Powerful Automation</Cover></span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Streamline your email campaigns, engage your audience, and drive results with our intuitive email marketing platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contacts">
                <Button size="lg" className="bg-[#d86dfc] hover:bg-[#c44ee7] text-white">
                  Manage Contacts
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button size="lg" variant="outline" className="border-[#d86dfc] text-[#d86dfc] hover:bg-[#d86dfc] hover:text-white">
                  Create Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
        Build amazing websites <br /> at <Cover>warp speed</Cover>
      </h1> */}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Powerful Features for Modern Email Marketing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to create, manage, and optimize your email campaigns
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#d86dfc] transition-colors duration-300">
              <Users className="h-6 w-6 text-[#d86dfc] group-hover:text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Contact Management</h3>
            <p className="text-gray-600">
              Efficiently organize and segment your contacts for targeted campaigns
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#d86dfc] transition-colors duration-300">
              <Sparkles className="h-6 w-6 text-[#d86dfc] group-hover:text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Templates</h3>
            <p className="text-gray-600">
              Beautiful, responsive templates that look great on any device
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#d86dfc] transition-colors duration-300">
              <BarChart3 className="h-6 w-6 text-[#d86dfc] group-hover:text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Campaign Analytics</h3>
            <p className="text-gray-600">
              Detailed insights and metrics to measure campaign performance
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#d86dfc] to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Transform Your Email Marketing?
          </h2>
          <Button size="lg" variant="secondary" className="bg-white text-[#d86dfc] hover:bg-gray-100">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-[#d86dfc]" />
            <span className="ml-2 text-xl font-semibold text-[#d86dfc]">
              Eshway Mailer
            </span>
          </div>
          <p>© 2024 Eshway Mailer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}