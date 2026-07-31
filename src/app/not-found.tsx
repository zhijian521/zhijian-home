import { NotFoundPage } from "@/components/site/not-found-page";

import PublicLayout from "./(public)/layout";

/*== 404页面 ==*/
export default function RootNotFound() {
    return (
        <PublicLayout>
            <NotFoundPage />
        </PublicLayout>
    );
}
