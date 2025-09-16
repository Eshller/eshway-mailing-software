"use client";

import { Upload, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ContactList from "@/components/contacts/contact-list";
import { ContactForm } from "@/components/contacts/contact-form";
import { BulkUpload } from "@/components/contacts/bulk-upload";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

function ContactsPageContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-muted-foreground">
            Manage your email contacts and subscribers.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Upload size={20} />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <Users size={16} />
            Contact List
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <UserPlus size={16} />
            Add Contact
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Upload size={16} />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="p-6">
            <ContactList />
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="p-6">
            <ContactForm />
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="p-6">
            <BulkUpload />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContactsPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}