"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailTemplates } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Contact } from "@prisma/client";
import { Loader2, Plus, List } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CampaignsList } from "@/components/campaigns/campaigns-list";

function CampaignsPageContent() {
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [subject, setSubject] = useState(emailTemplates[0].subject);
  const [content, setContent] = useState(emailTemplates[0].content);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBuilderContent, setHasBuilderContent] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId) || emailTemplates[0];
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleCreateNew = () => {
    // Clear any existing template data
    localStorage.removeItem('template');
    setViewMode('create');
    // Reset to default template
    setSelectedTemplate(emailTemplates[0]);
    setSubject(emailTemplates[0].subject);
    setContent(emailTemplates[0].content);
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Create campaign in database
      const campaignResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: subject, // Use subject as campaign name
          subject,
          content,
        }),
      });

      if (campaignResponse.ok) {
        localStorage.setItem('template', JSON.stringify({ ...selectedTemplate, subject, content }));
        router.push(`/campaigns/preview`);
        toast({
          title: "Campaign created successfully!",
          description: "You can now preview and send your campaign.",
        });
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      toast({
        title: "Error creating campaign",
        description: "Please try again.",
        variant: "destructive",
      });
      console.error("Error creating campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Check URL parameters for mode
    const mode = searchParams.get('mode');
    if (mode === 'create') {
      setViewMode('create');
    }

    // Load template data from localStorage if editing
    try {
      const templateData = localStorage.getItem('template');
      if (templateData) {
        const parsed = JSON.parse(templateData);
        if (parsed.subject && parsed.content) {
          setSubject(parsed.subject);
          setContent(parsed.content);
          setSelectedTemplate({
            id: parsed.id || 'custom',
            name: parsed.name || 'Custom Template',
            subject: parsed.subject,
            content: parsed.content
          });
        }
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }

    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/contacts");
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        toast({
          title: "Error fetching contacts",
          description: "Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();

    // Load builder content if exists
    try {
      const saved = localStorage.getItem("builtTemplateHtml");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.inline) {
          setContent(parsed.inline);
          setHasBuilderContent(true);
        }
      }
    } catch (_) { }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'list' ? 'Campaigns' : 'Create Campaign'}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'list'
              ? 'Manage your email campaigns'
              : 'Design and send your email campaigns to your contacts.'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            View Campaigns
          </Button>
          <Button
            variant={viewMode === 'create' ? 'default' : 'outline'}
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <CampaignsList />
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Email Template</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="secondary"
                          onClick={() => router.push("/campaigns/builder")}
                        >
                          Open Template Builder
                        </Button>
                        {hasBuilderContent && (
                          <span className="text-xs text-gray-500">Loaded from builder</span>
                        )}
                      </div>
                      <Select
                        value={selectedTemplate.id}
                        onValueChange={handleTemplateChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Subject Line</Label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Email Content</Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[300px]"
                      />
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-full bg-[#d86dfc] hover:bg-[#c44ee7]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    "Send Campaign"
                  )}
                </Button>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Preview</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500">Subject</Label>
                      <p className="font-medium">{subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Content</Label>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                      {/* <div className="prose max-w-none">
                  {content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div> */}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Campaign Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>Send To</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Contacts</SelectItem>
                          {contacts.reduce((uniqueTags: string[], contact) => {
                            const contactTags = contact.tags as string;
                            contactTags?.split(',').forEach((tag: string) => {
                              const trimmedTag = tag.trim();
                              if (trimmedTag && !uniqueTags.includes(trimmedTag)) {
                                uniqueTags.push(trimmedTag);
                              }
                            });
                            return uniqueTags;
                          }, []).map((tag: string) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Schedule</Label>
                      <Select defaultValue="now">
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Send Now</SelectItem>
                          <SelectItem value="later">Schedule for Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CampaignsPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}