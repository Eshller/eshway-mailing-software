'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Mail, RefreshCw } from 'lucide-react';

interface EmailProgressTrackerProps {
    isVisible: boolean;
    onClose: () => void;
    progress?: {
        totalEmails: number;
        processedEmails: number;
        currentBatch: number;
        totalBatches: number;
        successCount: number;
        errorCount: number;
        isComplete: boolean;
    };
}

export function EmailProgressTracker({ isVisible, onClose, progress }: EmailProgressTrackerProps) {
    if (!isVisible || !progress) return null;

    const progressPercentage = progress.totalEmails > 0
        ? Math.round((progress.processedEmails / progress.totalEmails) * 100)
        : 0;

    const isBatching = progress.totalBatches > 1;
    const isComplete = progress.isComplete;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Campaign Progress
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {progress.successCount}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Successful
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {progress.errorCount}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                            </div>
                        </div>
                    </div>

                    {/* Batch Info */}
                    {isBatching && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Batch Progress</span>
                                <span>{progress.currentBatch}/{progress.totalBatches}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {isBatching ? 'Batching Mode' : 'Parallel Mode'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {progress.totalEmails} emails
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="text-center">
                        {isComplete ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Campaign Complete!</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-blue-600">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span className="font-medium">Sending emails...</span>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="text-xs text-gray-500 text-center">
                        {isComplete ? (
                            `Campaign completed: ${progress.successCount} successful, ${progress.errorCount} failed`
                        ) : (
                            `Processing ${progress.processedEmails} of ${progress.totalEmails} emails`
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}




