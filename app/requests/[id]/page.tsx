import { RequestDetail } from '@/components/request/RequestDetail';
import { Header } from '@/components/layout/Header';

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <RequestDetail id={id} />
      </main>
    </>
  );
}
