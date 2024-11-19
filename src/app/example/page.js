"use client"

import dynamic from "next/dynamic";

// ダイナミックインポート
const DynamicPage = dynamic(() => import("./clientComponent"), { ssr: false });

export default function Page() {
  return (
    <div className="flex h-full">
      <DynamicPage />
    </div>
  );
}
