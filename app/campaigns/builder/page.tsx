"use client";

import dynamic from "next/dynamic";

const GrapesBuilder = dynamic(() => import("@/components/builder/grapes-builder"), {
    ssr: false,
    loading: () => <div className="p-6">Loading builder...</div>,
});

export default function BuilderPage() {
    return <GrapesBuilder />;
}


