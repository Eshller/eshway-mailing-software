'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    User,
    Mail,
    Building,
    Tag,
    Phone,
    Eye,
    CheckCircle,
    AlertCircle,
    Copy,
    ChevronDown
} from 'lucide-react';

interface VariableHelperProps {
    content: string;
    onContentChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    showPreview?: boolean;
    showVariableButtons?: boolean;
    showAutoComplete?: boolean;
}

// Available variables with their display info
const AVAILABLE_VARIABLES = [
    {
        key: '[Recipient Name]',
        label: 'Recipient Name',
        description: 'Full name of the recipient',
        icon: User,
        sample: 'John Doe'
    },
    {
        key: '[Name]',
        label: 'Name',
        description: 'Full name of the recipient (same as Recipient Name)',
        icon: User,
        sample: 'John Doe'
    },
    {
        key: '[First Name]',
        label: 'First Name',
        description: 'First name only',
        icon: User,
        sample: 'John'
    },
    {
        key: '[Last Name]',
        label: 'Last Name',
        description: 'Last name only',
        icon: User,
        sample: 'Doe'
    },
    {
        key: '[Email]',
        label: 'Email',
        description: 'Recipient email address',
        icon: Mail,
        sample: 'john@example.com'
    },
    {
        key: '[Company]',
        label: 'Company',
        description: 'Company name',
        icon: Building,
        sample: 'Acme Corp'
    },
    {
        key: '[Phone]',
        label: 'Phone',
        description: 'Phone number',
        icon: Phone,
        sample: '+1 (555) 123-4567'
    },
    {
        key: '[Tags]',
        label: 'Tags',
        description: 'Comma-separated tags',
        icon: Tag,
        sample: 'VIP, Premium'
    }
];

export function VariableHelper({
    content,
    onContentChange,
    placeholder = "Write your email content here...",
    className = "",
    showPreview = true,
    showVariableButtons = true,
    showAutoComplete = true
}: VariableHelperProps) {
    const [showPreviewPanel, setShowPreviewPanel] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [suggestions, setSuggestions] = useState<typeof AVAILABLE_VARIABLES>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [invalidVariables, setInvalidVariables] = useState<string[]>([]);

    // Sample data for preview
    const sampleData = {
        '[Recipient Name]': 'John Doe',
        '[Name]': 'John Doe',
        '[First Name]': 'John',
        '[Last Name]': 'Doe',
        '[Email]': 'john@example.com',
        '[Company]': 'Acme Corp',
        '[Phone]': '+1 (555) 123-4567',
        '[Tags]': 'VIP, Premium'
    };

    // Insert variable at cursor position
    const insertVariable = (variable: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + variable + content.substring(end);

        onContentChange(newContent);

        // Set cursor position after the inserted variable
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
    };

    // Handle textarea changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        onContentChange(newContent);
        setCursorPosition(e.target.selectionStart);

        // Auto-complete logic
        if (showAutoComplete) {
            const textBeforeCursor = newContent.substring(0, e.target.selectionStart);
            const lastBracket = textBeforeCursor.lastIndexOf('[');

            if (lastBracket !== -1 && !textBeforeCursor.substring(lastBracket).includes(']')) {
                const searchTerm = textBeforeCursor.substring(lastBracket + 1).toLowerCase();
                const filtered = AVAILABLE_VARIABLES.filter(v =>
                    v.key.toLowerCase().includes(searchTerm)
                );
                setSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
            } else {
                setShowSuggestions(false);
            }
        }
    };

    // Handle key events for auto-complete
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Generate preview content
    const generatePreview = () => {
        let preview = content;
        Object.entries(sampleData).forEach(([variable, value]) => {
            preview = preview.replace(new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        });
        return preview;
    };

    // Validate variables in content
    const validateVariables = () => {
        const variablePattern = /\[([^\]]+)\]/g;
        const matches = content.match(variablePattern) || [];
        const invalid = matches.filter(match =>
            !AVAILABLE_VARIABLES.some(v => v.key === match)
        );
        setInvalidVariables(invalid);
    };

    // Copy variable to clipboard
    const copyVariable = (variable: string) => {
        navigator.clipboard.writeText(variable);
    };

    useEffect(() => {
        validateVariables();
    }, [content]);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Variable Buttons */}
            {showVariableButtons && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Insert Variables
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {AVAILABLE_VARIABLES.map((variable) => {
                                const Icon = variable.icon;
                                return (
                                    <Button
                                        key={variable.key}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertVariable(variable.key)}
                                        className="flex items-center gap-2 text-xs h-auto py-2 px-3"
                                        title={variable.description}
                                    >
                                        <Icon className="h-3 w-3" />
                                        <span className="truncate">{variable.label}</span>
                                    </Button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Click any button to insert the variable at your cursor position
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Content Editor */}
            <div className="relative">
                <Label htmlFor="email-content">Email Content</Label>
                <Textarea
                    ref={textareaRef}
                    id="email-content"
                    value={content}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="min-h-[300px] font-mono text-sm"
                />

                {/* Auto-complete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        {suggestions.map((variable) => {
                            const Icon = variable.icon;
                            return (
                                <button
                                    key={variable.key}
                                    onClick={() => {
                                        insertVariable(variable.key);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                                >
                                    <Icon className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <div className="font-medium">{variable.key}</div>
                                        <div className="text-xs text-gray-500">{variable.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Variable Validation */}
            {invalidVariables.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Invalid Variables Found:</span>
                        </div>
                        <div className="mt-2 space-y-1">
                            {invalidVariables.map((variable, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <Badge variant="destructive" className="text-xs">
                                        {variable}
                                    </Badge>
                                    <span className="text-red-600">
                                        This variable is not recognized. Please check spelling.
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview Panel */}
            {showPreview && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Preview
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                            >
                                {showPreviewPanel ? 'Hide' : 'Show'} Preview
                                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showPreviewPanel ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    {showPreviewPanel && (
                        <CardContent className="pt-0">
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Sample Preview:</div>
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {generatePreview()}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    This preview shows how your email will look with sample data.
                                    Variables will be replaced with actual recipient data when sent.
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Click variable buttons to insert them at your cursor position</li>
                    <li>Start typing <code className="bg-gray-100 px-1 rounded">[</code> to see auto-complete suggestions</li>
                    <li>Use <kbd className="bg-gray-100 px-1 rounded text-xs">Escape</kbd> to close suggestions</li>
                    <li>All variables are case-sensitive and must be spelled exactly</li>
                </ul>
            </div>
        </div>
    );
}
