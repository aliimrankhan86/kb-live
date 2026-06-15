import { RequestDetail } from '@/components/request/RequestDetail';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { isBookingFlowEnabled } from '@/lib/config';
import { JsonLdScript, breadcrumbJsonLd } from '@/lib/seo/json-ld';

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Requests' },
    { label: `#${id.slice(0, 8)}` },
  ];

  const breadcrumbSchema = breadcrumbJsonLd(
    breadcrumbItems.map((item) => ({
      name: item.label,
      path: item.href,
    }))
  );

  return (
    <>
      <main className="min-h-screen bg-[var(--background)]">
        <JsonLdScript data={breadcrumbSchema} />
        <div className="w-full max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <RequestDetail id={id} bookingEnabled={isBookingFlowEnabled()} />
      </main>
    </>
  );
}
