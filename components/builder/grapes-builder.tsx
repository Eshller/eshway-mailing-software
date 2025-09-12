"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function GrapesBuilder() {
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            const [{ default: grapesjs }, newsletterPreset] = await Promise.all([
                import("grapesjs"),
                import("grapesjs-preset-newsletter").catch(() => ({ default: undefined })),
            ]);

            if (!isMounted || !containerRef.current) return;

            const editor = grapesjs.init({
                container: containerRef.current,
                height: "calc(100vh - 140px)",
                width: "auto",
                fromElement: false,
                storageManager: {
                    type: "local",
                    autosave: false,
                    autoload: true,
                    stepsBeforeSave: 1,
                    options: {
                        local: { key: "mailway-gjs-email" },
                    },
                },
                plugins: [newsletterPreset?.default ? newsletterPreset.default : undefined].filter(
                    Boolean
                ) as any,
            });

            // Load previously saved HTML/CSS if present
            const saved = localStorage.getItem("builtTemplateHtml");
            if (saved) {
                try {
                    const { html, css } = JSON.parse(saved);
                    if (html) editor.setComponents(html);
                    if (css) editor.setStyle(css);
                } catch (_) {
                    // ignore parse errors
                }
            }

            editorRef.current = editor;
            setIsReady(true);
        };

        init();

        return () => {
            isMounted = false;
            // GrapesJS does not expose a public destroy in older versions; guard accordingly
            try {
                editorRef.current?.destroy?.();
            } catch (_) {
                // ignore
            }
            editorRef.current = null;
        };
    }, []);

    const handleSave = () => {
        const editor = editorRef.current;
        if (!editor) return;
        const html = editor.getHtml();
        const css = editor.getCss();
        const inline = `<style>${css}</style>${html}`;
        localStorage.setItem(
            "builtTemplateHtml",
            JSON.stringify({ html, css, inline })
        );
    };

    const handleUseInCampaign = () => {
        // Ensure latest save
        handleSave();
        router.push("/campaigns");
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Email Template Builder</h1>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleSave} disabled={!isReady}>
                        Save
                    </Button>
                    <Button onClick={handleUseInCampaign} className="bg-[#d86dfc] hover:bg-[#c44ee7]" disabled={!isReady}>
                        Use in Campaign
                    </Button>
                </div>
            </div>
            <Card className="p-0 overflow-hidden">
                <div ref={containerRef} />
            </Card>
        </div>
    );
}


