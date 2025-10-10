'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Palette,
    Moon,
    Sun,
    Monitor,
    Eye,
    Type,
    Layout,
    Grid3X3,
    List,
    Sidebar,
    Maximize
} from 'lucide-react';

interface AppearanceSettingsProps {
    onChanges: (hasChanges: boolean) => void;
}

export function AppearanceSettings({ onChanges }: AppearanceSettingsProps) {
    const [appearance, setAppearance] = useState({
        theme: 'system',
        colorScheme: 'blue',
        fontSize: 'medium',
        density: 'comfortable',
        sidebarCollapsed: false,
        showSidebar: true,
        showBreadcrumbs: true,
        showTooltips: true,
        animations: true,
        reducedMotion: false,
        highContrast: false,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        numberFormat: 'US',
        currency: 'USD'
    });

    const [originalAppearance, setOriginalAppearance] = useState(appearance);

    useEffect(() => {
        // Load appearance settings (in real app, this would come from API)
        const loadAppearance = async () => {
            const mockAppearance = {
                theme: 'system',
                colorScheme: 'blue',
                fontSize: 'medium',
                density: 'comfortable',
                sidebarCollapsed: false,
                showSidebar: true,
                showBreadcrumbs: true,
                showTooltips: true,
                animations: true,
                reducedMotion: false,
                highContrast: false,
                language: 'en',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                numberFormat: 'US',
                currency: 'USD'
            };
            setAppearance(mockAppearance);
            setOriginalAppearance(mockAppearance);
        };
        loadAppearance();
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setAppearance(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const isChanged = JSON.stringify(appearance) !== JSON.stringify(originalAppearance);

    const colorSchemes = [
        { value: 'blue', label: 'Blue', preview: 'bg-blue-500' },
        { value: 'green', label: 'Green', preview: 'bg-green-500' },
        { value: 'purple', label: 'Purple', preview: 'bg-purple-500' },
        { value: 'red', label: 'Red', preview: 'bg-red-500' },
        { value: 'orange', label: 'Orange', preview: 'bg-orange-500' },
        { value: 'gray', label: 'Gray', preview: 'bg-gray-500' }
    ];

    return (
        <div className="space-y-6">
            {/* Theme Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme & Colors
                    </CardTitle>
                    <CardDescription>
                        Customize the appearance of your interface
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                                value={appearance.theme}
                                onValueChange={(value) => handleChange('theme', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            Light
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            Dark
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4" />
                                            System
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Color Scheme</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {colorSchemes.map((scheme) => (
                                    <button
                                        key={scheme.value}
                                        onClick={() => handleChange('colorScheme', scheme.value)}
                                        className={`p-3 rounded-lg border-2 transition-all ${appearance.colorScheme === scheme.value
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full ${scheme.preview}`} />
                                            <span className="text-sm font-medium">{scheme.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Display Settings
                    </CardTitle>
                    <CardDescription>
                        Configure how content is displayed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="font-size">Font Size</Label>
                            <Select
                                value={appearance.fontSize}
                                onValueChange={(value) => handleChange('fontSize', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                    <SelectItem value="extra-large">Extra Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="density">Density</Label>
                            <Select
                                value={appearance.density}
                                onValueChange={(value) => handleChange('density', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="compact">Compact</SelectItem>
                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                    <SelectItem value="spacious">Spacious</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="animations">Animations</Label>
                                <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                            </div>
                            <Switch
                                id="animations"
                                checked={appearance.animations}
                                onCheckedChange={(checked) => handleChange('animations', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                                <p className="text-sm text-muted-foreground">Minimize motion for accessibility</p>
                            </div>
                            <Switch
                                id="reduced-motion"
                                checked={appearance.reducedMotion}
                                onCheckedChange={(checked) => handleChange('reducedMotion', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="high-contrast">High Contrast</Label>
                                <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                            </div>
                            <Switch
                                id="high-contrast"
                                checked={appearance.highContrast}
                                onCheckedChange={(checked) => handleChange('highContrast', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Layout Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        Layout & Navigation
                    </CardTitle>
                    <CardDescription>
                        Customize the layout and navigation elements
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="show-sidebar">Show Sidebar</Label>
                                <p className="text-sm text-muted-foreground">Display the navigation sidebar</p>
                            </div>
                            <Switch
                                id="show-sidebar"
                                checked={appearance.showSidebar}
                                onCheckedChange={(checked) => handleChange('showSidebar', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                                <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
                            </div>
                            <Switch
                                id="sidebar-collapsed"
                                checked={appearance.sidebarCollapsed}
                                onCheckedChange={(checked) => handleChange('sidebarCollapsed', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="show-breadcrumbs">Show Breadcrumbs</Label>
                                <p className="text-sm text-muted-foreground">Display navigation breadcrumbs</p>
                            </div>
                            <Switch
                                id="show-breadcrumbs"
                                checked={appearance.showBreadcrumbs}
                                onCheckedChange={(checked) => handleChange('showBreadcrumbs', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="show-tooltips">Show Tooltips</Label>
                                <p className="text-sm text-muted-foreground">Display helpful tooltips on hover</p>
                            </div>
                            <Switch
                                id="show-tooltips"
                                checked={appearance.showTooltips}
                                onCheckedChange={(checked) => handleChange('showTooltips', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Regional Settings
                    </CardTitle>
                    <CardDescription>
                        Configure language and regional formatting
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={appearance.language}
                                onValueChange={(value) => handleChange('language', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="it">Italian</SelectItem>
                                    <SelectItem value="pt">Portuguese</SelectItem>
                                    <SelectItem value="ja">Japanese</SelectItem>
                                    <SelectItem value="ko">Korean</SelectItem>
                                    <SelectItem value="zh">Chinese</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={appearance.currency}
                                onValueChange={(value) => handleChange('currency', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date-format">Date Format</Label>
                            <Select
                                value={appearance.dateFormat}
                                onValueChange={(value) => handleChange('dateFormat', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time-format">Time Format</Label>
                            <Select
                                value={appearance.timeFormat}
                                onValueChange={(value) => handleChange('timeFormat', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                                    <SelectItem value="24h">24-hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="number-format">Number Format</Label>
                        <Select
                            value={appearance.numberFormat}
                            onValueChange={(value) => handleChange('numberFormat', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="US">US (1,234.56)</SelectItem>
                                <SelectItem value="EU">EU (1.234,56)</SelectItem>
                                <SelectItem value="IN">India (1,23,456.78)</SelectItem>
                                <SelectItem value="CH">Switzerland (1&apos;234.56)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                        See how your settings will look
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Sample Content</h3>
                            <p className="text-muted-foreground">
                                This is how your text will appear with the current settings.
                            </p>
                            <div className="flex gap-2">
                                <Badge variant="outline">Sample Badge</Badge>
                                <Badge variant="secondary">Another Badge</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Date: {new Date().toLocaleDateString()} |
                                Time: {new Date().toLocaleTimeString()} |
                                Number: 1,234.56
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

