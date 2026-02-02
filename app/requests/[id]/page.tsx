import { RequestDetail } from '@/components/request/RequestDetail';

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-[#0B0B0B]">
      <RequestDetail id={id} />
    </main>
  );
}
