"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";

export default function CampaignsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [subject, setSubject] = useState(emailTemplates[0].subject);
  const [content, setContent] = useState(emailTemplates[0].content);
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBuilderContent, setHasBuilderContent] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId) || emailTemplates[0];
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleSend = () => {
    localStorage.setItem('template', JSON.stringify({ ...selectedTemplate, subject, content }));
    router.push(`/campaigns/preview`);
    toast({
      title: "Campaign created successfully!",
      description: "You can now preview and send your campaign.",
    });
  };
  useEffect(() => {
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
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Campaign</h1>
      {isLoading ? <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div> : (
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
              className="w-full bg-[#d86dfc] hover:bg-[#c44ee7]"
            >
              Send Campaign
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
    </div>
  );
}