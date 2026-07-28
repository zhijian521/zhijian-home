import type { Metadata } from "next";

import { NAV_METADATA } from "@/features/nav/lib/metadata";
import { NavPage } from "@/features/nav/ui/nav-page";

export const metadata: Metadata = NAV_METADATA;

export default function NavigationPage() {
    return <NavPage />;
}
