'use client';

import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Mail,
    Key,
    Server,
    Shield,
    TestTube,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Copy,
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react';

interface EmailSettingsProps {
    onChanges: (hasChanges: boolean) => void;
}

export interface EmailSettingsRef {
    save: () => Promise<boolean>;
}

export const EmailSettings = forwardRef<EmailSettingsRef, EmailSettingsProps>(function EmailSettings({ onChanges }, ref) {
    const [emailSettings, setEmailSettings] = useState({
        provider: 'aws-ses',
        smtpHost: '',
        smtpPort: '587',
        smtpUsername: '',
        smtpPassword: '',
        smtpSecure: true,
        fromName: '',
        fromEmail: '',
        replyToEmail: '',
        awsAccessKeyId: '',
        awsSecretAccessKey: '',
        awsRegion: 'ap-south-1', // Fixed to match database default
        sendgridApiKey: '',
        mailgunApiKey: '',
        mailgunDomain: '',
        trackingEnabled: true,
        openTracking: true,
        clickTracking: true,
        unsubscribeTracking: true,
        bounceHandling: true,
        complaintHandling: true,
        rateLimit: '1000',
        dailyLimit: '10000',
        monthlyLimit: '300000'
    });

    const [originalSettings, setOriginalSettings] = useState(emailSettings);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [testResults, setTestResults] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [testEmailAddress, setTestEmailAddress] = useState('');

    useEffect(() => {
        // Load email settings from API
        const loadSettings = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/settings/email?t=${Date.now()}`);

                if (response.ok) {
                    const settings = await response.json();

                    // Ensure all values are properly converted to prevent null/undefined issues
                    const sanitizedSettings = {
                        provider: settings.provider || 'aws-ses',
                        smtpHost: settings.smtpHost || '',
                        smtpPort: settings.smtpPort || '587',
                        smtpUsername: settings.smtpUsername || '',
                        smtpPassword: settings.smtpPassword || '',
                        smtpSecure: Boolean(settings.smtpSecure),
                        fromName: settings.fromName || '',
                        fromEmail: settings.fromEmail || '',
                        replyToEmail: settings.replyToEmail || '',
                        awsAccessKeyId: settings.awsAccessKeyId || '',
                        awsSecretAccessKey: settings.awsSecretAccessKey || '',
                        awsRegion: settings.awsRegion || 'ap-south-1',
                        sendgridApiKey: settings.sendgridApiKey || '',
                        mailgunApiKey: settings.mailgunApiKey || '',
                        mailgunDomain: settings.mailgunDomain || '',
                        trackingEnabled: Boolean(settings.trackingEnabled),
                        openTracking: Boolean(settings.openTracking),
                        clickTracking: Boolean(settings.clickTracking),
                        unsubscribeTracking: Boolean(settings.unsubscribeTracking),
                        bounceHandling: Boolean(settings.bounceHandling),
                        complaintHandling: Boolean(settings.complaintHandling),
                        rateLimit: settings.rateLimit || '1000',
                        dailyLimit: settings.dailyLimit || '10000',
                        monthlyLimit: settings.monthlyLimit || '300000'
                    };

                    setEmailSettings(sanitizedSettings);
                    setOriginalSettings(sanitizedSettings);
                } else {
                    console.error('Failed to load email settings, status:', response.status);
                }
            } catch (error) {
                console.error('Error loading email settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setEmailSettings(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const testConnection = async (type: string) => {
        setTestResults(prev => ({ ...prev, [type]: 'testing' }));

        try {
            const response = await fetch('/api/settings/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: emailSettings.provider,
                    testType: 'connection'
                })
            });

            const result = await response.json();

            if (result.success) {
                setTestResults(prev => ({ ...prev, [type]: 'success' }));
            } else {
                setTestResults(prev => ({ ...prev, [type]: 'error' }));
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            setTestResults(prev => ({ ...prev, [type]: 'error' }));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const saveSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/settings/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailSettings)
            });

            if (response.ok) {
                const result = await response.json();

                // Reload data from database to ensure we have the latest values
                const reloadResponse = await fetch(`/api/settings/email?t=${Date.now()}`);
                if (reloadResponse.ok) {
                    const freshSettings = await reloadResponse.json();
                    const sanitizedSettings = {
                        provider: freshSettings.provider || 'aws-ses',
                        smtpHost: freshSettings.smtpHost || '',
                        smtpPort: freshSettings.smtpPort || '587',
                        smtpUsername: freshSettings.smtpUsername || '',
                        smtpPassword: freshSettings.smtpPassword || '',
                        smtpSecure: Boolean(freshSettings.smtpSecure),
                        fromName: freshSettings.fromName || '',
                        fromEmail: freshSettings.fromEmail || '',
                        replyToEmail: freshSettings.replyToEmail || '',
                        awsAccessKeyId: freshSettings.awsAccessKeyId || '',
                        awsSecretAccessKey: freshSettings.awsSecretAccessKey || '',
                        awsRegion: freshSettings.awsRegion || 'ap-south-1',
                        sendgridApiKey: freshSettings.sendgridApiKey || '',
                        mailgunApiKey: freshSettings.mailgunApiKey || '',
                        mailgunDomain: freshSettings.mailgunDomain || '',
                        trackingEnabled: Boolean(freshSettings.trackingEnabled),
                        openTracking: Boolean(freshSettings.openTracking),
                        clickTracking: Boolean(freshSettings.clickTracking),
                        unsubscribeTracking: Boolean(freshSettings.unsubscribeTracking),
                        bounceHandling: Boolean(freshSettings.bounceHandling),
                        complaintHandling: Boolean(freshSettings.complaintHandling),
                        rateLimit: freshSettings.rateLimit || '1000',
                        dailyLimit: freshSettings.dailyLimit || '10000',
                        monthlyLimit: freshSettings.monthlyLimit || '300000'
                    };

                    setEmailSettings(sanitizedSettings);
                    setOriginalSettings(sanitizedSettings);
                }

                onChanges(false);
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving email settings:', error);
            throw error;
        }
    }, [emailSettings, onChanges]);

    // Expose save function to parent component via ref
    useImperativeHandle(ref, () => ({
        save: saveSettings
    }), [saveSettings]);


    const testEmailSend = async () => {
        if (!testEmailAddress.trim()) {
            alert('Please enter a test email address');
            return;
        }

        setTestResults(prev => ({ ...prev, send: 'testing' }));

        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testEmail: testEmailAddress.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                setTestResults(prev => ({ ...prev, send: 'success' }));
                alert(`Test email sent successfully to ${testEmailAddress}!`);
            } else {
                setTestResults(prev => ({ ...prev, send: 'error' }));
                alert(`Failed to send test email: ${result.error}`);
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            setTestResults(prev => ({ ...prev, send: 'error' }));
            alert('Failed to send test email');
        }
    };


    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center p-8">
                    <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading email settings...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Email Provider Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Provider
                    </CardTitle>
                    <CardDescription>
                        Choose your email service provider
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="provider">Email Provider</Label>
                        <Select
                            value={emailSettings.provider}
                            onValueChange={(value) => handleChange('provider', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aws-ses">AWS SES</SelectItem>
                                <SelectItem value="smtp">SMTP</SelectItem>
                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                <SelectItem value="mailgun">Mailgun</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {emailSettings.provider === 'aws-ses' && (
                        <div className="space-y-4">
                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    AWS SES is recommended for production use. High deliverability and cost-effective.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="aws-access-key">AWS Access Key ID</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="aws-access-key"
                                            value={emailSettings.awsAccessKeyId}
                                            onChange={(e) => handleChange('awsAccessKeyId', e.target.value)}
                                            placeholder="AKIA..."
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(emailSettings.awsAccessKeyId)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="aws-secret-key">AWS Secret Access Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="aws-secret-key"
                                            type={showPasswords.awsSecret ? 'text' : 'password'}
                                            value={emailSettings.awsSecretAccessKey}
                                            onChange={(e) => handleChange('awsSecretAccessKey', e.target.value)}
                                            placeholder="Your secret key"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => togglePasswordVisibility('awsSecret')}
                                        >
                                            {showPasswords.awsSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="aws-region">AWS Region</Label>
                                <Select
                                    value={emailSettings.awsRegion}
                                    onValueChange={(value) => handleChange('awsRegion', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                                        <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                                        <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => testConnection('aws')}
                                    disabled={testResults.aws === 'testing'}
                                    variant="outline"
                                >
                                    {testResults.aws === 'testing' ? (
                                        <TestTube className="h-4 w-4 mr-2 animate-spin" />
                                    ) : testResults.aws === 'success' ? (
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    ) : testResults.aws === 'error' ? (
                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                    ) : (
                                        <TestTube className="h-4 w-4 mr-2" />
                                    )}
                                    {testResults.aws === 'testing' ? 'Testing...' : 'Test Connection'}
                                </Button>
                                {testResults.aws === 'success' && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        Connection Successful
                                    </Badge>
                                )}
                                {testResults.aws === 'error' && (
                                    <Badge variant="outline" className="text-red-600 border-red-600">
                                        Connection Failed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {emailSettings.provider === 'sendgrid' && (
                        <div className="space-y-4">
                            <Alert>
                                <Mail className="h-4 w-4" />
                                <AlertDescription>
                                    SendGrid provides reliable email delivery with advanced analytics.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="sendgrid-api-key"
                                        type={showPasswords.sendgridApiKey ? 'text' : 'password'}
                                        value={emailSettings.sendgridApiKey}
                                        onChange={(e) => handleChange('sendgridApiKey', e.target.value)}
                                        placeholder="SG..."
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePasswordVisibility('sendgridApiKey')}
                                    >
                                        {showPasswords.sendgridApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => testConnection('sendgrid')}
                                    disabled={testResults.sendgrid === 'testing'}
                                    variant="outline"
                                >
                                    {testResults.sendgrid === 'testing' ? (
                                        <TestTube className="h-4 w-4 mr-2 animate-spin" />
                                    ) : testResults.sendgrid === 'success' ? (
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    ) : testResults.sendgrid === 'error' ? (
                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                    ) : (
                                        <TestTube className="h-4 w-4 mr-2" />
                                    )}
                                    {testResults.sendgrid === 'testing' ? 'Testing...' : 'Test Connection'}
                                </Button>
                                {testResults.sendgrid === 'success' && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        Connection Successful
                                    </Badge>
                                )}
                                {testResults.sendgrid === 'error' && (
                                    <Badge variant="outline" className="text-red-600 border-red-600">
                                        Connection Failed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {emailSettings.provider === 'mailgun' && (
                        <div className="space-y-4">
                            <Alert>
                                <Mail className="h-4 w-4" />
                                <AlertDescription>
                                    Mailgun offers powerful email APIs for developers.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mailgun-api-key">Mailgun API Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="mailgun-api-key"
                                            type={showPasswords.mailgunApiKey ? 'text' : 'password'}
                                            value={emailSettings.mailgunApiKey}
                                            onChange={(e) => handleChange('mailgunApiKey', e.target.value)}
                                            placeholder="key-..."
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => togglePasswordVisibility('mailgunApiKey')}
                                        >
                                            {showPasswords.mailgunApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mailgun-domain">Mailgun Domain</Label>
                                    <Input
                                        id="mailgun-domain"
                                        value={emailSettings.mailgunDomain}
                                        onChange={(e) => handleChange('mailgunDomain', e.target.value)}
                                        placeholder="mg.yourcompany.com"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => testConnection('mailgun')}
                                    disabled={testResults.mailgun === 'testing'}
                                    variant="outline"
                                >
                                    {testResults.mailgun === 'testing' ? (
                                        <TestTube className="h-4 w-4 mr-2 animate-spin" />
                                    ) : testResults.mailgun === 'success' ? (
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    ) : testResults.mailgun === 'error' ? (
                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                    ) : (
                                        <TestTube className="h-4 w-4 mr-2" />
                                    )}
                                    {testResults.mailgun === 'testing' ? 'Testing...' : 'Test Connection'}
                                </Button>
                                {testResults.mailgun === 'success' && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        Connection Successful
                                    </Badge>
                                )}
                                {testResults.mailgun === 'error' && (
                                    <Badge variant="outline" className="text-red-600 border-red-600">
                                        Connection Failed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {emailSettings.provider === 'smtp' && (
                        <div className="space-y-4">
                            <Alert>
                                <Server className="h-4 w-4" />
                                <AlertDescription>
                                    Configure SMTP settings for your email server.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-host">SMTP Host</Label>
                                    <Input
                                        id="smtp-host"
                                        value={emailSettings.smtpHost}
                                        onChange={(e) => handleChange('smtpHost', e.target.value)}
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-port">SMTP Port</Label>
                                    <Input
                                        id="smtp-port"
                                        value={emailSettings.smtpPort}
                                        onChange={(e) => handleChange('smtpPort', e.target.value)}
                                        placeholder="587"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-username">Username</Label>
                                    <Input
                                        id="smtp-username"
                                        value={emailSettings.smtpUsername}
                                        onChange={(e) => handleChange('smtpUsername', e.target.value)}
                                        placeholder="your-email@gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-password">Password</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="smtp-password"
                                            type={showPasswords.smtpPassword ? 'text' : 'password'}
                                            value={emailSettings.smtpPassword}
                                            onChange={(e) => handleChange('smtpPassword', e.target.value)}
                                            placeholder="Your password"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => togglePasswordVisibility('smtpPassword')}
                                        >
                                            {showPasswords.smtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="smtp-secure"
                                    checked={emailSettings.smtpSecure}
                                    onCheckedChange={(checked) => handleChange('smtpSecure', checked)}
                                />
                                <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Email Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                        Configure your email sending settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from-name">From Name</Label>
                            <Input
                                id="from-name"
                                value={emailSettings.fromName}
                                onChange={(e) => handleChange('fromName', e.target.value)}
                                placeholder="Your Company Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from-email">From Email</Label>
                            <Input
                                id="from-email"
                                type="email"
                                value={emailSettings.fromEmail}
                                onChange={(e) => handleChange('fromEmail', e.target.value)}
                                placeholder="noreply@yourcompany.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reply-to-email">Reply-To Email</Label>
                        <Input
                            id="reply-to-email"
                            type="email"
                            value={emailSettings.replyToEmail}
                            onChange={(e) => handleChange('replyToEmail', e.target.value)}
                            placeholder="support@yourcompany.com"
                        />
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="test-email">Test Email Address</Label>
                            <Input
                                id="test-email"
                                type="email"
                                value={testEmailAddress}
                                onChange={(e) => setTestEmailAddress(e.target.value)}
                                placeholder="test@example.com"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={testEmailSend} disabled={testResults.send === 'testing' || !testEmailAddress.trim()}>
                                {testResults.send === 'testing' ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : testResults.send === 'success' ? (
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                ) : testResults.send === 'error' ? (
                                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                )}
                                {testResults.send === 'testing' ? 'Sending...' : 'Send Test Email'}
                            </Button>
                            {testResults.send === 'success' && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    Test Email Sent
                                </Badge>
                            )}
                            {testResults.send === 'error' && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                    Test Failed
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tracking Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Tracking</CardTitle>
                    <CardDescription>
                        Configure email tracking and analytics
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="tracking-enabled">Enable Tracking</Label>
                                <p className="text-sm text-muted-foreground">Enable email tracking features</p>
                            </div>
                            <Switch
                                id="tracking-enabled"
                                checked={emailSettings.trackingEnabled}
                                onCheckedChange={(checked) => handleChange('trackingEnabled', checked)}
                            />
                        </div>

                        {emailSettings.trackingEnabled && (
                            <div className="space-y-4 pl-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="open-tracking">Open Tracking</Label>
                                        <p className="text-sm text-muted-foreground">Track when emails are opened</p>
                                    </div>
                                    <Switch
                                        id="open-tracking"
                                        checked={emailSettings.openTracking}
                                        onCheckedChange={(checked) => handleChange('openTracking', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="click-tracking">Click Tracking</Label>
                                        <p className="text-sm text-muted-foreground">Track when links are clicked</p>
                                    </div>
                                    <Switch
                                        id="click-tracking"
                                        checked={emailSettings.clickTracking}
                                        onCheckedChange={(checked) => handleChange('clickTracking', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="unsubscribe-tracking">Unsubscribe Tracking</Label>
                                        <p className="text-sm text-muted-foreground">Track unsubscribe requests</p>
                                    </div>
                                    <Switch
                                        id="unsubscribe-tracking"
                                        checked={emailSettings.unsubscribeTracking}
                                        onCheckedChange={(checked) => handleChange('unsubscribeTracking', checked)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
                <CardHeader>
                    <CardTitle>Rate Limits</CardTitle>
                    <CardDescription>
                        Configure sending limits to prevent abuse
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate-limit">Per Minute Limit</Label>
                            <Input
                                id="rate-limit"
                                type="number"
                                value={emailSettings.rateLimit}
                                onChange={(e) => handleChange('rateLimit', e.target.value)}
                                placeholder="1000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="daily-limit">Daily Limit</Label>
                            <Input
                                id="daily-limit"
                                type="number"
                                value={emailSettings.dailyLimit}
                                onChange={(e) => handleChange('dailyLimit', e.target.value)}
                                placeholder="10000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monthly-limit">Monthly Limit</Label>
                            <Input
                                id="monthly-limit"
                                type="number"
                                value={emailSettings.monthlyLimit}
                                onChange={(e) => handleChange('monthlyLimit', e.target.value)}
                                placeholder="300000"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});
