
import UserProfileClient from './UserProfileClient';
import { Suspense } from 'react';

export const dynamic = 'force-static';

export default function UserProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserProfileClient />
        </Suspense>
    );
}
