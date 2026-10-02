import type { Metadata } from "next";
import { AboutContent } from "@/components/domain/public/about-content";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <AboutContent />
    </div>
  );
}
