import LaunchDetailClient from '@/components/LaunchDetailClient';

export default async function LaunchDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <LaunchDetailClient id={id} />;
}
