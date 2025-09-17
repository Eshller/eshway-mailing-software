'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Settings as SettingsIcon,
    Database,
    Zap,
    Shield,
    Download,
    Upload,
    Trash2,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    BarChart3,
    Globe,
    Server,
    Cpu
} from 'lucide-react';

interface AdvancedSettingsProps {
    onChanges: (hasChanges: boolean) => void;
}

export function AdvancedSettings({ onChanges }: AdvancedSettingsProps) {
    const [advanced, setAdvanced] = useState({
        debugMode: false,
        analyticsEnabled: true,
        errorReporting: true,
        performanceMonitoring: true,
        dataRetention: '365',
        autoBackup: true,
        backupFrequency: 'daily',
        compressionEnabled: true,
        cacheEnabled: true,
        cacheTTL: '3600',
        rateLimiting: true,
        maxRequests: '1000',
        timeout: '30',
        retryAttempts: '3',
        webhookEnabled: false,
        webhookUrl: '',
        webhookSecret: '',
        apiVersion: 'v1',
        corsEnabled: true,
        allowedOrigins: '',
        sslRequired: true,
        maintenanceMode: false,
        featureFlags: {
            newDashboard: true,
            advancedAnalytics: false,
            aiInsights: false,
            customTemplates: true,
            bulkOperations: true
        }
    });

    const [originalAdvanced, setOriginalAdvanced] = useState(advanced);
    const [systemInfo, setSystemInfo] = useState({
        version: '1.0.0',
        uptime: '15 days, 3 hours',
        memoryUsage: '45%',
        diskUsage: '23%',
        cpuUsage: '12%',
        lastBackup: '2024-01-20T02:00:00Z',
        totalEmails: 12543,
        totalContacts: 8921,
        totalCampaigns: 156
    });

    useEffect(() => {
        // Load advanced settings (in real app, this would come from API)
        const loadAdvanced = async () => {
            const mockAdvanced = {
                debugMode: false,
                analyticsEnabled: true,
                errorReporting: true,
                performanceMonitoring: true,
                dataRetention: '365',
                autoBackup: true,
                backupFrequency: 'daily',
                compressionEnabled: true,
                cacheEnabled: true,
                cacheTTL: '3600',
                rateLimiting: true,
                maxRequests: '1000',
                timeout: '30',
                retryAttempts: '3',
                webhookEnabled: false,
                webhookUrl: '',
                webhookSecret: '',
                apiVersion: 'v1',
                corsEnabled: true,
                allowedOrigins: '',
                sslRequired: true,
                maintenanceMode: false,
                featureFlags: {
                    newDashboard: true,
                    advancedAnalytics: false,
                    aiInsights: false,
                    customTemplates: true,
                    bulkOperations: true
                }
            };
            setAdvanced(mockAdvanced);
            setOriginalAdvanced(mockAdvanced);
        };
        loadAdvanced();
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setAdvanced(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const handleFeatureFlagChange = (flag: string, value: boolean) => {
        setAdvanced(prev => ({
            ...prev,
            featureFlags: { ...prev.featureFlags, [flag]: value }
        }));
        onChanges(true);
    };

    const exportData = () => {
        // Simulate data export
        const data = {
            contacts: systemInfo.totalContacts,
            campaigns: systemInfo.totalCampaigns,
            emails: systemInfo.totalEmails,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailway-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearCache = () => {
        // Simulate cache clear
        alert('Cache cleared successfully');
    };

    const resetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            setAdvanced(originalAdvanced);
            onChanges(false);
        }
    };

    const isChanged = JSON.stringify(advanced) !== JSON.stringify(originalAdvanced);

    return (
        <div className="space-y-6">
            {/* System Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Information
                    </CardTitle>
                    <CardDescription>
                        Current system status and performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">CPU Usage</span>
                            </div>
                            <div className="text-2xl font-bold">{systemInfo.cpuUsage}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Memory Usage</span>
                            </div>
                            <div className="text-2xl font-bold">{systemInfo.memoryUsage}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Disk Usage</span>
                            </div>
                            <div className="text-2xl font-bold">{systemInfo.diskUsage}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium">Uptime</span>
                            </div>
                            <div className="text-sm font-bold">{systemInfo.uptime}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Debug & Monitoring */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Debug & Monitoring
                    </CardTitle>
                    <CardDescription>
                        Configure debugging and monitoring settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="debug-mode">Debug Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable detailed logging and debugging information
                                </p>
                            </div>
                            <Switch
                                id="debug-mode"
                                checked={advanced.debugMode}
                                onCheckedChange={(checked) => handleChange('debugMode', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="analytics-enabled">Analytics</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable usage analytics and performance tracking
                                </p>
                            </div>
                            <Switch
                                id="analytics-enabled"
                                checked={advanced.analyticsEnabled}
                                onCheckedChange={(checked) => handleChange('analyticsEnabled', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="error-reporting">Error Reporting</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically report errors for debugging
                                </p>
                            </div>
                            <Switch
                                id="error-reporting"
                                checked={advanced.errorReporting}
                                onCheckedChange={(checked) => handleChange('errorReporting', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="performance-monitoring">Performance Monitoring</Label>
                                <p className="text-sm text-muted-foreground">
                                    Monitor application performance and bottlenecks
                                </p>
                            </div>
                            <Switch
                                id="performance-monitoring"
                                checked={advanced.performanceMonitoring}
                                onCheckedChange={(checked) => handleChange('performanceMonitoring', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Data Management
                    </CardTitle>
                    <CardDescription>
                        Configure data retention and backup settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="data-retention">Data Retention (Days)</Label>
                            <Select
                                value={advanced.dataRetention}
                                onValueChange={(value) => handleChange('dataRetention', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                    <SelectItem value="180">180 days</SelectItem>
                                    <SelectItem value="365">1 year</SelectItem>
                                    <SelectItem value="730">2 years</SelectItem>
                                    <SelectItem value="0">Forever</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="auto-backup">Automatic Backup</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically backup your data
                                </p>
                            </div>
                            <Switch
                                id="auto-backup"
                                checked={advanced.autoBackup}
                                onCheckedChange={(checked) => handleChange('autoBackup', checked)}
                            />
                        </div>

                        {advanced.autoBackup && (
                            <div className="space-y-2">
                                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                                <Select
                                    value={advanced.backupFrequency}
                                    onValueChange={(value) => handleChange('backupFrequency', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Last Backup</Label>
                            <p className="text-sm text-muted-foreground">
                                {new Date(systemInfo.lastBackup).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={exportData}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Data
                            </Button>
                            <Button variant="outline" onClick={clearCache}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Clear Cache
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Performance Settings
                    </CardTitle>
                    <CardDescription>
                        Optimize application performance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="compression-enabled">Compression</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable data compression to reduce bandwidth usage
                                </p>
                            </div>
                            <Switch
                                id="compression-enabled"
                                checked={advanced.compressionEnabled}
                                onCheckedChange={(checked) => handleChange('compressionEnabled', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="cache-enabled">Caching</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable caching to improve response times
                                </p>
                            </div>
                            <Switch
                                id="cache-enabled"
                                checked={advanced.cacheEnabled}
                                onCheckedChange={(checked) => handleChange('cacheEnabled', checked)}
                            />
                        </div>

                        {advanced.cacheEnabled && (
                            <div className="space-y-2">
                                <Label htmlFor="cache-ttl">Cache TTL (Seconds)</Label>
                                <Input
                                    id="cache-ttl"
                                    type="number"
                                    value={advanced.cacheTTL}
                                    onChange={(e) => handleChange('cacheTTL', e.target.value)}
                                    placeholder="3600"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="max-requests">Max Requests/Min</Label>
                                <Input
                                    id="max-requests"
                                    type="number"
                                    value={advanced.maxRequests}
                                    onChange={(e) => handleChange('maxRequests', e.target.value)}
                                    placeholder="1000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timeout">Timeout (Seconds)</Label>
                                <Input
                                    id="timeout"
                                    type="number"
                                    value={advanced.timeout}
                                    onChange={(e) => handleChange('timeout', e.target.value)}
                                    placeholder="30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                                <Input
                                    id="retry-attempts"
                                    type="number"
                                    value={advanced.retryAttempts}
                                    onChange={(e) => handleChange('retryAttempts', e.target.value)}
                                    placeholder="3"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Flags */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        Feature Flags
                    </CardTitle>
                    <CardDescription>
                        Enable or disable experimental features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="new-dashboard">New Dashboard</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable the redesigned dashboard interface
                                </p>
                            </div>
                            <Switch
                                id="new-dashboard"
                                checked={advanced.featureFlags.newDashboard}
                                onCheckedChange={(checked) => handleFeatureFlagChange('newDashboard', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="advanced-analytics">Advanced Analytics</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable advanced analytics and reporting features
                                </p>
                            </div>
                            <Switch
                                id="advanced-analytics"
                                checked={advanced.featureFlags.advancedAnalytics}
                                onCheckedChange={(checked) => handleFeatureFlagChange('advancedAnalytics', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="ai-insights">AI Insights</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable AI-powered insights and recommendations
                                </p>
                            </div>
                            <Switch
                                id="ai-insights"
                                checked={advanced.featureFlags.aiInsights}
                                onCheckedChange={(checked) => handleFeatureFlagChange('aiInsights', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="custom-templates">Custom Templates</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow creation of custom email templates
                                </p>
                            </div>
                            <Switch
                                id="custom-templates"
                                checked={advanced.featureFlags.customTemplates}
                                onCheckedChange={(checked) => handleFeatureFlagChange('customTemplates', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="bulk-operations">Bulk Operations</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable bulk operations for contacts and campaigns
                                </p>
                            </div>
                            <Switch
                                id="bulk-operations"
                                checked={advanced.featureFlags.bulkOperations}
                                onCheckedChange={(checked) => handleFeatureFlagChange('bulkOperations', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible and destructive actions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            These actions are permanent and cannot be undone. Please proceed with caution.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Reset All Settings</Label>
                                <p className="text-sm text-muted-foreground">
                                    Reset all settings to their default values
                                </p>
                            </div>
                            <Button variant="destructive" onClick={resetSettings}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset Settings
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Clear All Data</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete all contacts, campaigns, and email data
                                </p>
                            </div>
                            <Button variant="destructive" disabled>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All Data
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

