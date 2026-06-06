import { RequestDetail } from '@/components/request/RequestDetail';
import { Header } from '@/components/layout/Header';
import { Breadcrumb, buildBreadcrumbJsonLd } from '@/components/ui/Breadcrumb';

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Requests' },
    { label: `#${id.slice(0, 8)}` },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
        />
        <div className="w-full max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <RequestDetail id={id} />
      </main>
    </>
  );
}
