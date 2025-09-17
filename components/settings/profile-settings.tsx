'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, MapPin, Phone, Camera } from 'lucide-react';

interface ProfileSettingsProps {
    onChanges: (hasChanges: boolean) => void;
}

export function ProfileSettings({ onChanges }: ProfileSettingsProps) {
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        jobTitle: '',
        location: '',
        phone: '',
        bio: '',
        avatar: '',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        language: 'en'
    });

    const [originalProfile, setOriginalProfile] = useState(profile);

    useEffect(() => {
        // Load profile data (in real app, this would come from API)
        const loadProfile = async () => {
            // Simulate API call
            const mockProfile = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                company: 'Acme Corp',
                jobTitle: 'Email Marketing Manager',
                location: 'San Francisco, CA',
                phone: '+1 (555) 123-4567',
                bio: 'Passionate about email marketing and customer engagement.',
                avatar: '',
                timezone: 'America/Los_Angeles',
                dateFormat: 'MM/DD/YYYY',
                language: 'en'
            };
            setProfile(mockProfile);
            setOriginalProfile(mockProfile);
        };
        loadProfile();
    }, []);

    const handleChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        onChanges(true);
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleChange('avatar', e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);

    return (
        <div className="space-y-6">
            {/* Profile Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your personal information and profile details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                                <AvatarFallback className="text-lg">
                                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                                <div className="bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90">
                                    <Camera className="h-3 w-3" />
                                </div>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{profile.firstName} {profile.lastName}</h3>
                            <p className="text-muted-foreground">{profile.jobTitle}</p>
                            <Badge variant="outline" className="mt-1">
                                {profile.company}
                            </Badge>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={profile.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={profile.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={profile.company}
                                onChange={(e) => handleChange('company', e.target.value)}
                                placeholder="Enter your company name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                value={profile.jobTitle}
                                onChange={(e) => handleChange('jobTitle', e.target.value)}
                                placeholder="Enter your job title"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={profile.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="Enter your location"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={profile.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Enter your phone number"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                            id="bio"
                            value={profile.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            placeholder="Tell us about yourself"
                            className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Configure your personal preferences and display settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <select
                                id="timezone"
                                value={profile.timezone}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time</option>
                                <option value="America/Chicago">Central Time</option>
                                <option value="America/Denver">Mountain Time</option>
                                <option value="America/Los_Angeles">Pacific Time</option>
                                <option value="Europe/London">London</option>
                                <option value="Europe/Paris">Paris</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <select
                                id="dateFormat"
                                value={profile.dateFormat}
                                onChange={(e) => handleChange('dateFormat', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <select
                                id="language"
                                value={profile.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                                <option value="pt">Portuguese</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

