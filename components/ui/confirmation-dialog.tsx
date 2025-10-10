"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { X } from "lucide-react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (dontAskAgain?: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    showDontAskAgain?: boolean;
    dontAskAgainKey?: string;
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    showDontAskAgain = false,
    dontAskAgainKey = "dontAskAgain",
}: ConfirmationDialogProps) {
    const [dontAskAgain, setDontAskAgain] = useState(false);

    // Check if user previously selected "don't ask again"
    useEffect(() => {
        if (showDontAskAgain && dontAskAgainKey && isOpen) {
            const saved = localStorage.getItem(dontAskAgainKey);
            if (saved === "true") {
                // Auto-confirm if user previously checked "don't ask again"
                onConfirm(true);
                return;
            }
        }
    }, [isOpen, showDontAskAgain, dontAskAgainKey]); // Removed onConfirm from dependencies to prevent infinite loop

    const handleConfirm = () => {
        if (showDontAskAgain && dontAskAgain && dontAskAgainKey) {
            localStorage.setItem(dontAskAgainKey, "true");
        }
        onConfirm(dontAskAgain);
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">{description}</p>

                    {showDontAskAgain && (
                        <div className="mb-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dontAskAgain}
                                    onChange={(e) => setDontAskAgain(e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">
                                    Don&apos;t ask me again
                                </span>
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}




