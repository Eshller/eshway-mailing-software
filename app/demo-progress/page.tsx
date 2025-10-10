'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailProgressTracker } from '@/components/campaigns/email-progress-tracker';
import { BatchProgress } from '@/lib/email-service';

export default function DemoProgressPage() {
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState<BatchProgress | null>(null);

    const simulateProgress = () => {
        setShowProgress(true);
        setProgress({
            totalEmails: 1000,
            processedEmails: 0,
            currentBatch: 0,
            totalBatches: 20,
            successCount: 0,
            errorCount: 0,
            isComplete: false
        });

        // Simulate progress updates
        let currentProgress = 0;
        let successCount = 0;
        let errorCount = 0;
        let currentBatch = 0;

        const interval = setInterval(() => {
            currentProgress += 25; // Process 25 emails per update
            successCount += 23; // 23 successful, 2 failed
            errorCount += 2;
            currentBatch = Math.floor(currentProgress / 50); // 50 emails per batch

            setProgress({
                totalEmails: 1000,
                processedEmails: Math.min(currentProgress, 1000),
                currentBatch: Math.min(currentBatch, 20),
                totalBatches: 20,
                successCount,
                errorCount,
                isComplete: currentProgress >= 1000
            });

            if (currentProgress >= 1000) {
                clearInterval(interval);
                setTimeout(() => {
                    setShowProgress(false);
                }, 2000); // Show completion for 2 seconds
            }
        }, 500); // Update every 500ms
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Email Progress Tracker Demo</h1>

            <div className="space-y-4">
                <p className="text-gray-600">
                    This demo shows how the email progress tracker works. Click the button below to simulate sending 1,000 emails with progress tracking.
                </p>

                <Button onClick={simulateProgress} disabled={showProgress}>
                    {showProgress ? 'Sending Emails...' : 'Simulate Sending 1,000 Emails'}
                </Button>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Real-time progress updates</li>
                        <li>Batch processing visualization</li>
                        <li>Success/failure statistics</li>
                        <li>Progress percentage</li>
                        <li>Automatic completion handling</li>
                    </ul>
                </div>
            </div>

            <EmailProgressTracker
                isVisible={showProgress}
                onClose={() => setShowProgress(false)}
                progress={progress || undefined}
            />
        </div>
    );
}




