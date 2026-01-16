
import UserProfileClient from './UserProfileClient';

export async function generateStaticParams() {
    return [];
}

export default function UserProfilePage() {
    return <UserProfileClient />;
}
