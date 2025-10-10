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
import { VariableHelper } from "@/components/ui/variable-helper";
import { emailTemplates } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Contact } from "@prisma/client";
import { Loader2, Plus, List, FileText } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { TemplateBuilder } from "@/components/template-builder";

// Utility function to convert text content to HTML with proper line breaks
const formatTextToHtml = (text: string): string => {
  return text
    .replace(/\n/g, '<br>') // Convert line breaks to HTML breaks
    .replace(/\r\n/g, '<br>') // Convert Windows line breaks
    .replace(/\r/g, '<br>'); // Convert Mac line breaks
};

function CampaignsPageContent() {
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [subject, setSubject] = useState(emailTemplates[0].subject);
  const [content, setContent] = useState(emailTemplates[0].content);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [allTemplates, setAllTemplates] = useState(emailTemplates);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBuilderContent, setHasBuilderContent] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  const handleTemplateChange = (templateId: string) => {
    const template = allTemplates.find((t) => t.id === templateId) || allTemplates[0];
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleTemplateSaved = (newTemplate: any) => {
    // Add the new template to the list
    const templateWithId = {
      ...newTemplate,
      id: newTemplate.id || `custom-${Date.now()}`,
    };

    setCustomTemplates(prev => [...prev, templateWithId]);
    setAllTemplates(prev => [...prev, templateWithId]);

    // Auto-select the new template
    setSelectedTemplate(templateWithId);
    setSubject(templateWithId.subject);
    setContent(templateWithId.content);
  };

  const fetchCustomTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const templates = await response.json();
        setCustomTemplates(templates);
        const allTemplatesList = [...emailTemplates, ...templates];
        setAllTemplates(allTemplatesList);

        // After templates are loaded, restore template if editing
        if (editingCampaign && editingCampaign.templateId) {
          const originalTemplate = allTemplatesList.find(t => t.id === editingCampaign.templateId);
          if (originalTemplate) {
            setSelectedTemplate(originalTemplate);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching custom templates:', error);
    }
  };

  const handleCreateNew = () => {
    // Clear any existing template data
    localStorage.removeItem('template');
    setViewMode('create');
    // Reset to default template
    setSelectedTemplate(emailTemplates[0]);
    setSubject(emailTemplates[0].subject);
    setContent(emailTemplates[0].content);
    // Clear editing state
    setEditingCampaign(null);
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      let campaignResponse;

      if (editingCampaign) {
        // Update existing campaign
        campaignResponse = await fetch(`/api/campaigns/${editingCampaign.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: subject, // Use subject as campaign name
            subject,
            content,
            templateId: selectedTemplate.id,
            templateName: selectedTemplate.name,
          }),
        });
      } else {
        // Create new campaign
        campaignResponse = await fetch('/api/campaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: subject, // Use subject as campaign name
            subject,
            content,
            templateId: selectedTemplate.id,
            templateName: selectedTemplate.name,
          }),
        });
      }

      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        localStorage.setItem('template', JSON.stringify({
          ...selectedTemplate,
          subject,
          content,
          campaignId: campaignData.id || editingCampaign?.id
        }));
        router.push(`/campaigns/preview`);
        toast({
          title: editingCampaign ? "Campaign updated successfully!" : "Campaign created successfully!",
          description: "You can now preview and send your campaign.",
        });
      } else {
        const errorData = await campaignResponse.json();
        if (campaignResponse.status === 404) {
          // Campaign not found, clear editing state and create new
          setEditingCampaign(null);
          toast({
            title: "Campaign not found",
            description: "The campaign you're trying to edit no longer exists. Creating a new campaign instead.",
            variant: "destructive",
          });
          // Retry as new campaign
          const newCampaignResponse = await fetch('/api/campaigns', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: subject,
              subject,
              content,
              templateId: selectedTemplate.id,
              templateName: selectedTemplate.name,
            }),
          });

          if (newCampaignResponse.ok) {
            const newCampaignData = await newCampaignResponse.json();
            localStorage.setItem('template', JSON.stringify({
              ...selectedTemplate,
              subject,
              content,
              campaignId: newCampaignData.id
            }));
            router.push(`/campaigns/preview`);
            toast({
              title: "Campaign created successfully!",
              description: "You can now preview and send your campaign.",
            });
          } else {
            throw new Error('Failed to create new campaign');
          }
        } else {
          throw new Error(errorData.error || (editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign'));
        }
      }
    } catch (error) {
      toast({
        title: editingCampaign ? "Error updating campaign" : "Error creating campaign",
        description: "Please try again.",
        variant: "destructive",
      });
      console.error(editingCampaign ? "Error updating campaign:" : "Error creating campaign:", error);
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

          // Check if this is an existing campaign being edited
          if (parsed.id && parsed.name && parsed.id !== 'custom') {
            setEditingCampaign({
              id: parsed.id,
              name: parsed.name,
              subject: parsed.subject,
              content: parsed.content,
              templateId: parsed.templateId,
              templateName: parsed.templateName
            });

            // Store template info for later restoration when allTemplates is loaded
            if (parsed.templateId) {
              // We'll restore the template in a separate useEffect when allTemplates is ready
            }
          }
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
    fetchCustomTemplates();

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
                      <div className="flex items-center gap-2 my-2">
                        <Button
                          variant="secondary"
                          onClick={() => setShowTemplateBuilder(true)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Template
                        </Button>
                        <Button
                          variant="outline"
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
                          {customTemplates.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                                Custom Templates
                              </div>
                              {customTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                                Default Templates
                              </div>
                            </>
                          )}
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

                    <VariableHelper
                      content={content}
                      onContentChange={setContent}
                      placeholder="Write your email content here..."
                      showPreview={false}
                      showVariableButtons={true}
                      showAutoComplete={true}
                    />
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
                      {editingCampaign ? "Updating Campaign..." : "Creating Campaign..."}
                    </>
                  ) : (
                    editingCampaign ? "Update Campaign" : "Send Campaign"
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
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatTextToHtml(content) }} />
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
                    {/* Email Statistics */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Email Delivery Status</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 font-medium">
                            {contacts.filter(c => c.email && c.emailValidated).length}
                          </span>
                          <span className="text-gray-600"> valid emails</span>
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">
                            {contacts.filter(c => !c.email || !c.emailValidated).length}
                          </span>
                          <span className="text-gray-600"> invalid/missing emails</span>
                        </div>
                      </div>
                      {contacts.filter(c => !c.email || !c.emailValidated).length > 0 && (
                        <div className="mt-2 text-sm text-amber-700">
                          ⚠️ {contacts.filter(c => !c.email || !c.emailValidated).length} contacts will be excluded from this campaign
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Send To</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Valid Contacts ({contacts.filter(c => c.email && c.emailValidated).length})
                          </SelectItem>
                          {contacts.reduce((uniqueTags: string[], contact) => {
                            const contactTags = contact.tags as string;
                            contactTags?.split(',').forEach((tag: string) => {
                              const trimmedTag = tag.trim();
                              if (trimmedTag && !uniqueTags.includes(trimmedTag)) {
                                uniqueTags.push(trimmedTag);
                              }
                            });
                            return uniqueTags;
                          }, []).map((tag: string) => {
                            const validContactsInTag = contacts.filter(c =>
                              c.tags?.includes(tag) && c.email && c.emailValidated
                            ).length;
                            return (
                              <SelectItem key={tag} value={tag}>
                                {tag} ({validContactsInTag} valid emails)
                              </SelectItem>
                            );
                          })}
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

      {showTemplateBuilder && (
        <TemplateBuilder
          onSave={handleTemplateSaved}
          onClose={() => setShowTemplateBuilder(false)}
        />
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