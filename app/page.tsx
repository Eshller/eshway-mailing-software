"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="flex items-center space-x-3">
            <Mail size={40} className="text-[#d86dfc]" />
            <h1 className="text-4xl font-bold text-gray-900">Eshway Mailer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl">
            Streamline your email marketing campaigns with our powerful mailing tool.
            Manage contacts and send beautiful email templates with ease.
          </p>
          <div className="flex gap-4">
            <Link href="/contacts">
              <Button
                size="lg"
                className="bg-[#d86dfc] hover:bg-[#c44ee7] text-white"
              >
                Manage Contacts
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                size="lg"
                variant="outline"
                className="border-[#d86dfc] text-[#d86dfc] hover:bg-[#d86dfc] hover:text-white"
              >
                Create Campaign
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Contact Management</h3>
              <p className="text-gray-600">
                Add and manage contacts individually or in bulk through CSV uploads.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Email Templates</h3>
              <p className="text-gray-600">
                Choose from professionally designed email templates for your campaigns.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Campaign Analytics</h3>
              <p className="text-gray-600">
                Track the performance of your email campaigns with detailed analytics.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}