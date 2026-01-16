
import UserProfileClient from './UserProfileClient';

export async function generateStaticParams() {
    return [];
}

export const dynamicParams = false; // Required for static export with empty params

export default function UserProfilePage() {
    return <UserProfileClient />;
}
