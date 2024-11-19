"use client"

import dynamic from "next/dynamic";

// ダイナミックインポート
const DynamicExample = dynamic(() => import("./ExampleClient"), { ssr: false });

export default function Page() {
  return (
    <div className="flex h-full">
      <DynamicExample />
    </div>
  );
}
