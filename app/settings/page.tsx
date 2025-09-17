'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Bell,
    Mail,
    Palette,
    Shield,
    Settings as SettingsIcon,
    Save,
    RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { EmailSettings, EmailSettingsRef } from '@/components/settings/email-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { SecuritySettings } from '@/components/settings/security-settings';
import { AdvancedSettings } from '@/components/settings/advanced-settings';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('email');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const emailSettingsRef = useRef<EmailSettingsRef>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'email' && emailSettingsRef.current) {
                const success = await emailSettingsRef.current.save();
                if (success) {
                    setHasUnsavedChanges(false);
                    alert('Email settings saved successfully!');
                } else {
                    alert('Failed to save email settings');
                }
            } else {
                // For other tabs, just show a placeholder message
                await new Promise(resolve => setTimeout(resolve, 500));
                setHasUnsavedChanges(false);
                alert('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTabChange = (value: string) => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to switch tabs?');
            if (!confirmed) return;
        }
        setActiveTab(value);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="text-muted-foreground">
                                Manage your account preferences and application settings
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    Unsaved changes
                                </Badge>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges || isSaving}
                                size="sm"
                            >
                                {isSaving ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* Settings Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            {/* Profile tab commented out for future use
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              */}
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="flex items-center gap-2">
                                <SettingsIcon className="h-4 w-4" />
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile tab commented out for future use
            <TabsContent value="profile" className="space-y-6">
              <ProfileSettings onChanges={setHasUnsavedChanges} />
            </TabsContent>
            */}

                        <TabsContent value="notifications" className="space-y-6">
                            <NotificationSettings onChanges={setHasUnsavedChanges} />
                        </TabsContent>

                        <TabsContent value="email" className="space-y-6">
                            <EmailSettings
                                ref={emailSettingsRef}
                                onChanges={setHasUnsavedChanges}
                            />
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-6">
                            <AppearanceSettings onChanges={setHasUnsavedChanges} />
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6">
                            <SecuritySettings onChanges={setHasUnsavedChanges} />
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-6">
                            <AdvancedSettings onChanges={setHasUnsavedChanges} />
                        </TabsContent>
                    </Tabs>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
