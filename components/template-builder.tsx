'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VariableHelper } from '@/components/ui/variable-helper';
import { toast } from '@/hooks/use-toast';
import { X, Save, Eye } from 'lucide-react';

interface TemplateBuilderProps {
    onSave: (template: { name: string; subject: string; content: string }) => void;
    onClose: () => void;
}

export function TemplateBuilder({ onSave, onClose }: TemplateBuilderProps) {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || !subject.trim() || !content.trim()) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, subject, content }),
            });

            if (response.ok) {
                const template = await response.json();
                onSave(template);
                toast({
                    title: "Template saved",
                    description: "Your template has been saved successfully.",
                });
                onClose();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save template');
            }
        } catch (error) {
            toast({
                title: "Error saving template",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatContent = (text: string) => {
        return text
            .replace(/\n/g, '<br>') // Convert line breaks to HTML breaks
            .replace(/\r\n/g, '<br>') // Convert Windows line breaks
            .replace(/\r/g, '<br>'); // Convert Mac line breaks
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Create Email Template</CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {showPreview ? 'Edit' : 'Preview'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {showPreview ? (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Preview</Label>
                                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold">{subject || 'Email Subject'}</h3>
                                    </div>
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{
                                        __html: content ? formatContent(content) : '<p class="text-gray-500">Email content will appear here...</p>'
                                    }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="template-name">Template Name</Label>
                                <Input
                                    id="template-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Welcome Email, Newsletter, etc."
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="template-subject">Subject Line</Label>
                                <Input
                                    id="template-subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Welcome to our newsletter!"
                                    className="mt-1"
                                />
                            </div>

                            <VariableHelper
                                content={content}
                                onContentChange={setContent}
                                placeholder="Write your email content here..."
                                showPreview={true}
                                showVariableButtons={true}
                                showAutoComplete={true}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Saving...' : 'Save Template'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
