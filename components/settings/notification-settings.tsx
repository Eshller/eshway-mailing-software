'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, Monitor, AlertTriangle, CheckCircle } from 'lucide-react';

interface NotificationSettingsProps {
    onChanges: (hasChanges: boolean) => void;
}

export function NotificationSettings({ onChanges }: NotificationSettingsProps) {
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        campaignAlerts: true,
        deliveryAlerts: true,
        bounceAlerts: true,
        replyAlerts: true,
        weeklyReports: true,
        monthlyReports: true,
        systemUpdates: true,
        securityAlerts: true,
        frequency: 'immediate',
        quietHours: false,
        quietStart: '22:00',
        quietEnd: '08:00',
        digestEmail: true,
        digestFrequency: 'daily'
    });

    const [originalNotifications, setOriginalNotifications] = useState(notifications);

    useEffect(() => {
        // Load notification settings (in real app, this would come from API)
        const loadNotifications = async () => {
            // Simulate API call
            const mockNotifications = {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                campaignAlerts: true,
                deliveryAlerts: true,
                bounceAlerts: true,
                replyAlerts: true,
                weeklyReports: true,
                monthlyReports: true,
                systemUpdates: true,
                securityAlerts: true,
                frequency: 'immediate',
                quietHours: false,
                quietStart: '22:00',
                quietEnd: '08:00',
                digestEmail: true,
                digestFrequency: 'daily'
            };
            setNotifications(mockNotifications);
            setOriginalNotifications(mockNotifications);
        };
        loadNotifications();
    }, []);

    const handleToggle = (field: string, value: boolean) => {
        setNotifications(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const handleSelect = (field: string, value: string) => {
        setNotifications(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const isChanged = JSON.stringify(notifications) !== JSON.stringify(originalNotifications);

    return (
        <div className="space-y-6">
            {/* Notification Channels */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Channels
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <div>
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                </div>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={notifications.emailNotifications}
                                onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Monitor className="h-5 w-5 text-green-600" />
                                <div>
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                                </div>
                            </div>
                            <Switch
                                id="push-notifications"
                                checked={notifications.pushNotifications}
                                onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-purple-600" />
                                <div>
                                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                                </div>
                            </div>
                            <Switch
                                id="sms-notifications"
                                checked={notifications.smsNotifications}
                                onCheckedChange={(checked) => handleToggle('smsNotifications', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Campaign Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Campaign Notifications
                    </CardTitle>
                    <CardDescription>
                        Configure notifications for your email campaigns
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="campaign-alerts">Campaign Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when campaigns are sent</p>
                            </div>
                            <Switch
                                id="campaign-alerts"
                                checked={notifications.campaignAlerts}
                                onCheckedChange={(checked) => handleToggle('campaignAlerts', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="delivery-alerts">Delivery Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified about delivery issues</p>
                            </div>
                            <Switch
                                id="delivery-alerts"
                                checked={notifications.deliveryAlerts}
                                onCheckedChange={(checked) => handleToggle('deliveryAlerts', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="bounce-alerts">Bounce Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified about bounced emails</p>
                            </div>
                            <Switch
                                id="bounce-alerts"
                                checked={notifications.bounceAlerts}
                                onCheckedChange={(checked) => handleToggle('bounceAlerts', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="reply-alerts">Reply Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when recipients reply</p>
                            </div>
                            <Switch
                                id="reply-alerts"
                                checked={notifications.replyAlerts}
                                onCheckedChange={(checked) => handleToggle('replyAlerts', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Reports & Updates
                    </CardTitle>
                    <CardDescription>
                        Manage your report and update notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                                <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                            </div>
                            <Switch
                                id="weekly-reports"
                                checked={notifications.weeklyReports}
                                onCheckedChange={(checked) => handleToggle('weeklyReports', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="monthly-reports">Monthly Reports</Label>
                                <p className="text-sm text-muted-foreground">Receive monthly performance reports</p>
                            </div>
                            <Switch
                                id="monthly-reports"
                                checked={notifications.monthlyReports}
                                onCheckedChange={(checked) => handleToggle('monthlyReports', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="system-updates">System Updates</Label>
                                <p className="text-sm text-muted-foreground">Get notified about system updates</p>
                            </div>
                            <Switch
                                id="system-updates"
                                checked={notifications.systemUpdates}
                                onCheckedChange={(checked) => handleToggle('systemUpdates', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="security-alerts">Security Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified about security issues</p>
                            </div>
                            <Switch
                                id="security-alerts"
                                checked={notifications.securityAlerts}
                                onCheckedChange={(checked) => handleToggle('securityAlerts', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Configure when and how often you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Notification Frequency</Label>
                            <Select
                                value={notifications.frequency}
                                onValueChange={(value) => handleSelect('frequency', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                                    <SelectItem value="daily">Daily Digest</SelectItem>
                                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="digest-frequency">Digest Frequency</Label>
                            <Select
                                value={notifications.digestFrequency}
                                onValueChange={(value) => handleSelect('digestFrequency', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="quiet-hours">Quiet Hours</Label>
                                <p className="text-sm text-muted-foreground">Pause notifications during specific hours</p>
                            </div>
                            <Switch
                                id="quiet-hours"
                                checked={notifications.quietHours}
                                onCheckedChange={(checked) => handleToggle('quietHours', checked)}
                            />
                        </div>

                        {notifications.quietHours && (
                            <div className="grid grid-cols-2 gap-4 pl-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quiet-start">Start Time</Label>
                                    <input
                                        id="quiet-start"
                                        type="time"
                                        value={notifications.quietStart}
                                        onChange={(e) => handleSelect('quietStart', e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quiet-end">End Time</Label>
                                    <input
                                        id="quiet-end"
                                        type="time"
                                        value={notifications.quietEnd}
                                        onChange={(e) => handleSelect('quietEnd', e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

