'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Shield,
    Key,
    Smartphone,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Lock,
    Unlock,
    Download,
    Trash2
} from 'lucide-react';

interface SecuritySettingsProps {
    onChanges: (hasChanges: boolean) => void;
}

export function SecuritySettings({ onChanges }: SecuritySettingsProps) {
    const [security, setSecurity] = useState({
        twoFactorEnabled: false,
        backupCodes: [],
        passwordLastChanged: '2024-01-15',
        loginNotifications: true,
        suspiciousActivityAlerts: true,
        sessionTimeout: '30',
        requirePasswordChange: false,
        passwordExpiry: '90',
        apiKeyEnabled: false,
        apiKey: '',
        apiKeyLastUsed: '',
        loginAttempts: 0,
        lastLogin: '2024-01-20T10:30:00Z',
        lastLoginIP: '192.168.1.100',
        activeSessions: 2
    });

    const [originalSecurity, setOriginalSecurity] = useState(security);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Load security settings (in real app, this would come from API)
        const loadSecurity = async () => {
            const mockSecurity = {
                twoFactorEnabled: false,
                backupCodes: ['12345678', '87654321', '11223344', '44332211', '55667788'],
                passwordLastChanged: '2024-01-15',
                loginNotifications: true,
                suspiciousActivityAlerts: true,
                sessionTimeout: '30',
                requirePasswordChange: false,
                passwordExpiry: '90',
                apiKeyEnabled: false,
                apiKey: 'sk-1234567890abcdef',
                apiKeyLastUsed: '2024-01-20T09:15:00Z',
                loginAttempts: 0,
                lastLogin: '2024-01-20T10:30:00Z',
                lastLoginIP: '192.168.1.100',
                activeSessions: 2
            };
            setSecurity(mockSecurity);
            setOriginalSecurity(mockSecurity);
        };
        loadSecurity();
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setSecurity(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const generateBackupCodes = () => {
        const codes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        handleChange('backupCodes', codes);
    };

    const generateApiKey = () => {
        const key = 'sk-' + Math.random().toString(36).substring(2, 18);
        handleChange('apiKey', key);
    };

    const revokeApiKey = () => {
        handleChange('apiKey', '');
        handleChange('apiKeyEnabled', false);
    };

    const isChanged = JSON.stringify(security) !== JSON.stringify(originalSecurity);

    return (
        <div className="space-y-6">
            {/* Password Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Password Security
                    </CardTitle>
                    <CardDescription>
                        Manage your password and authentication settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Password Last Changed</Label>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(security.passwordLastChanged).toLocaleDateString()}
                                </p>
                            </div>
                            <Badge variant="outline">
                                {Math.floor((Date.now() - new Date(security.passwordLastChanged).getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="current-password"
                                        type={showPasswords.currentPassword ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePasswordVisibility('currentPassword')}
                                    >
                                        {showPasswords.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="new-password"
                                        type={showPasswords.newPassword ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePasswordVisibility('newPassword')}
                                    >
                                        {showPasswords.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="confirm-password"
                                        type={showPasswords.confirmPassword ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                    >
                                        {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button>Update Password</Button>
                            <Button variant="outline">Cancel</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>2FA Status</Label>
                            <p className="text-sm text-muted-foreground">
                                {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {security.twoFactorEnabled ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Enabled
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Disabled
                                </Badge>
                            )}
                            <Switch
                                checked={security.twoFactorEnabled}
                                onCheckedChange={(checked) => handleChange('twoFactorEnabled', checked)}
                            />
                        </div>
                    </div>

                    {security.twoFactorEnabled && (
                        <div className="space-y-4">
                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    Two-factor authentication is enabled. Use your authenticator app to generate codes.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label>Backup Codes</Label>
                                <p className="text-sm text-muted-foreground">
                                    Save these codes in a safe place. You can use them to access your account if you lose your device.
                                </p>
                                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                                    {security.backupCodes.map((code, index) => (
                                        <div key={index} className="font-mono text-sm">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={generateBackupCodes}>
                                        Generate New Codes
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Session Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Session Management
                    </CardTitle>
                    <CardDescription>
                        Control your active sessions and security settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Active Sessions</Label>
                                <p className="text-sm text-muted-foreground">
                                    {security.activeSessions} active session(s)
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                View All Sessions
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Last Login</Label>
                            <div className="text-sm text-muted-foreground">
                                <p>{new Date(security.lastLogin).toLocaleString()}</p>
                                <p>IP Address: {security.lastLoginIP}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="session-timeout">Session Timeout</Label>
                            <select
                                id="session-timeout"
                                value={security.sessionTimeout}
                                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                                <option value="480">8 hours</option>
                                <option value="1440">24 hours</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="login-notifications">Login Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when someone logs into your account
                                </p>
                            </div>
                            <Switch
                                id="login-notifications"
                                checked={security.loginNotifications}
                                onCheckedChange={(checked) => handleChange('loginNotifications', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="suspicious-activity">Suspicious Activity Alerts</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get alerted about unusual login attempts
                                </p>
                            </div>
                            <Switch
                                id="suspicious-activity"
                                checked={security.suspiciousActivityAlerts}
                                onCheckedChange={(checked) => handleChange('suspiciousActivityAlerts', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Access */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Access
                    </CardTitle>
                    <CardDescription>
                        Manage your API keys and access tokens
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>API Key Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    {security.apiKeyEnabled ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {security.apiKeyEnabled ? (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Inactive
                                    </Badge>
                                )}
                                <Switch
                                    checked={security.apiKeyEnabled}
                                    onCheckedChange={(checked) => handleChange('apiKeyEnabled', checked)}
                                />
                            </div>
                        </div>

                        {security.apiKey && (
                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={security.apiKey}
                                        readOnly
                                        className="font-mono"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(security.apiKey)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                                {security.apiKeyLastUsed && (
                                    <p className="text-sm text-muted-foreground">
                                        Last used: {new Date(security.apiKeyLastUsed).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            {security.apiKey ? (
                                <Button variant="outline" onClick={revokeApiKey}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Revoke Key
                                </Button>
                            ) : (
                                <Button onClick={generateApiKey}>
                                    <Key className="h-4 w-4 mr-2" />
                                    Generate New Key
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Security Recommendations
                    </CardTitle>
                    <CardDescription>
                        Follow these recommendations to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <p className="font-medium">Strong Password</p>
                                <p className="text-sm text-muted-foreground">
                                    Use a unique, complex password with at least 12 characters
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                                <p className="font-medium">Enable Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <p className="font-medium">Regular Security Updates</p>
                                <p className="text-sm text-muted-foreground">
                                    Keep your devices and apps updated
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                                <p className="font-medium">Monitor Login Activity</p>
                                <p className="text-sm text-muted-foreground">
                                    Review your login history regularly
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

