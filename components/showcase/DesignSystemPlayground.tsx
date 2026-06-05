'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Badge,
  BarChart,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ChartContainer,
  Checkbox,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  LineChart,
  OverlayContent,
  OverlayDescription,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
  Pagination,
  Radio,
  Select,
  Slider,
  Switch,
  Table,
  TableContainer,
  Td,
  Text,
  Th,
} from '@/components/ui';
import { cn } from '@/lib/utils';

type Section = {
  id: string;
  group: string;
  title: string;
  description: string;
};

const sections: Section[] = [
  {
    id: 'typography',
    group: 'Typography',
    title: 'Typography',
    description: 'Headings, body text, helper text, and semantic usage.',
  },
  {
    id: 'form-controls',
    group: 'Form controls',
    title: 'Form controls',
    description: 'Inputs, selects, slider, and selection controls.',
  },
  {
    id: 'feedback-overlays',
    group: 'Feedback and overlays',
    title: 'Feedback and overlays',
    description: 'Alerts and modal examples with interaction states.',
  },
  {
    id: 'navigation',
    group: 'Navigation components',
    title: 'Navigation',
    description: 'Pagination and navigation patterns.',
  },
  {
    id: 'data-display',
    group: 'Data display',
    title: 'Data display',
    description: 'Cards, badges, tables, and layout-ready data blocks.',
  },
  {
    id: 'charts',
    group: 'Charts',
    title: 'Charts',
    description: 'Chart container and expected dashboard data shapes.',
  },
];

const selectOptions = [
  { value: '', label: 'Select a departure airport' },
  { value: 'lhr', label: 'London Heathrow (LHR)' },
  { value: 'man', label: 'Manchester (MAN)' },
  { value: 'lgw', label: 'London Gatwick with very long airport name to test truncation behaviour (LGW)' },
];

function DemoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--bg)] p-4">
      <Text size="sm" tone="muted" className="mb-3">
        {title}
      </Text>
      {children}
    </div>
  );
}

export function DesignSystemPlayground() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [search, setSearch] = useState('');
  const [singleSlider, setSingleSlider] = useState<number[]>([45]);
  const [rangeSlider, setRangeSlider] = useState<number[]>([25, 75]);
  const [smallPage, setSmallPage] = useState(2);
  const [largePage, setLargePage] = useState(14);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0.2, 0.5, 0.8],
      }
    );

    for (const section of sections) {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sections;
    return sections.filter((section) => {
      return (
        section.title.toLowerCase().includes(query) ||
        section.group.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const lineChartPoints = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 11 },
    { label: 'Fri', value: 19 },
    { label: 'Sat', value: 23 },
    { label: 'Sun', value: 17 },
  ];

  const barChartPoints = [
    { label: 'M', value: 32 },
    { label: 'T', value: 48 },
    { label: 'W', value: 26 },
    { label: 'T', value: 42 },
    { label: 'F', value: 60 },
    { label: 'S', value: 38 },
    { label: 'S', value: 30 },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4">
            <Heading as={1} size="lg">
              Component Playground
            </Heading>
            <Text size="sm" tone="muted" className="mt-2">
              Browse states and copy patterns that are safe to reuse across features.
            </Text>

            <label htmlFor="component-search" className="sr-only">
              Search components
            </label>
            <input
              id="component-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search components"
              className="mt-4 min-h-11 w-full rounded-md border border-[var(--borderSubtle)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
            />

            <div className="mt-4 lg:hidden">
              <label htmlFor="component-jump" className="mb-1 block text-xs text-[var(--textMuted)]">
                Components
              </label>
              <select
                id="component-jump"
                className="min-h-11 w-full rounded-md border border-[var(--borderSubtle)] bg-[var(--bg)] px-3 text-sm text-[var(--text)]"
                value={activeSection}
                onChange={(event) => {
                  const id = event.target.value;
                  setActiveSection(id);
                  const target = document.getElementById(id);
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {filteredSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.group} - {section.title}
                  </option>
                ))}
              </select>
            </div>

            <nav aria-label="Design system sections" className="mt-4 hidden max-h-[65vh] overflow-auto pr-1 lg:block">
              <ul className="space-y-1">
                {filteredSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={cn(
                        'block rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]',
                        activeSection === section.id
                          ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                          : 'border-transparent text-[var(--textMuted)] hover:border-[var(--borderSubtle)] hover:text-[var(--text)]'
                      )}
                    >
                      <span className="block text-xs uppercase tracking-wide text-[var(--textMuted)]">
                        {section.group}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <section className="space-y-6">
          <article id="typography" className="scroll-mt-24 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 sm:p-6">
            <Heading as={2} size="base">
              Typography
            </Heading>
            <Text size="sm" tone="muted" className="mt-2">
              Includes heading scale, body/helper/error text, and semantic text tags.
            </Text>
            <div className="mt-4 grid gap-4">
              <DemoBlock title="Heading scale">
                <div className="space-y-2">
                  <Heading as={1} size="display">Heading display (H1)</Heading>
                  <Heading as={2} size="2xl">Heading 2xl (H2)</Heading>
                  <Heading as={3} size="xl">Heading xl (H3)</Heading>
                  <Heading as={4} size="lg">Heading lg (H4)</Heading>
                  <Heading as={5} size="base">Heading base (H5)</Heading>
                  <Heading as={6} size="sm">Heading sm (H6)</Heading>
                </div>
              </DemoBlock>

              <DemoBlock title="Text variants">
                <div className="space-y-2">
                  <Text size="base">Body text default for feature content.</Text>
                  <Text size="sm" tone="muted">Helper text for guidance and metadata.</Text>
                  <Text size="sm" tone="danger">Error text for inline validation.</Text>
                  <Text as="label" size="sm">Label semantic mapping (label element).</Text>
                  <Text as="small" size="xs" tone="muted">Small semantic mapping for captions.</Text>
                </div>
              </DemoBlock>
            </div>
          </article>

          <article id="form-controls" className="scroll-mt-24 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 sm:p-6">
            <Heading as={2} size="base">Form controls</Heading>
            <Text size="sm" tone="muted" className="mt-2">
              Covers default, focus-style, error, disabled, loading, and 44px tap-target guidance.
            </Text>
            <div className="mt-4 grid gap-4">
              <DemoBlock title="Buttons: variants, sizes, loading and disabled">
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button className="ring-2 ring-[var(--focusRing)] ring-offset-2 ring-offset-[var(--bg)]">Focus sample</Button>
                </div>
              </DemoBlock>

              <DemoBlock title="Input examples">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Company name" placeholder="Al-Hidayah Travel" helperText="As shown on company registration." />
                  <Input label="Email" type="email" placeholder="ops@example.com" errorMessage="Enter a valid business email address." />
                  <Input label="Contact phone" defaultValue="+44 20 7123 4567" disabled helperText="Disabled state" />
                  <div className="space-y-1.5">
                    <Text as="label" size="sm">Price per person</Text>
                    <div className="flex min-h-11 overflow-hidden rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)]">
                      <span className="flex items-center border-r border-[var(--borderSubtle)] px-3 text-[var(--textMuted)]">GBP</span>
                      <input className="w-full bg-transparent px-3 text-sm text-[var(--text)] outline-none" defaultValue="1299" />
                    </div>
                    <Text size="xs" tone="muted">Prefix/suffix slot style</Text>
                  </div>
                </div>
              </DemoBlock>

              <DemoBlock title="Select examples with chevron and truncation">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select label="Departure airport" options={selectOptions} helperText="Select preferred airport." />
                  <Select label="Status" options={selectOptions} errorMessage="Please choose one option." />
                  <Select label="Disabled select" options={selectOptions} disabled helperText="Disabled state" />
                  <Select label="Long labels" options={selectOptions} defaultValue="lgw" helperText="Long option text truncates in field." />
                </div>
              </DemoBlock>

              <DemoBlock title="Slider examples">
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Text size="sm">Single value</Text>
                      <Badge>{singleSlider[0]}%</Badge>
                    </div>
                    <Slider value={singleSlider} onValueChange={setSingleSlider} min={0} max={100} step={1} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Text size="sm">Range value (supported)</Text>
                      <Badge>{rangeSlider[0]} - {rangeSlider[1]}</Badge>
                    </div>
                    <Slider value={rangeSlider} onValueChange={setRangeSlider} min={0} max={100} step={1} />
                  </div>
                  <div>
                    <Text size="sm" className="mb-2">Disabled slider</Text>
                    <Slider defaultValue={[35]} disabled min={0} max={100} />
                  </div>
                </div>
              </DemoBlock>

              <DemoBlock title="Checkbox, radio, and switch">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Checkbox label="Include visa" defaultChecked helperText="Included in package" />
                    <Checkbox label="Include ziyarat" />
                  </div>
                  <div className="space-y-2">
                    <Radio name="flight" label="Direct flight" defaultChecked />
                    <Radio name="flight" label="One stop" />
                  </div>
                  <div className="space-y-2">
                    <Switch label="Show verified operators only" defaultChecked />
                    <Switch label="Include sold-out packages" disabled />
                  </div>
                </div>
              </DemoBlock>

              <Text size="xs" tone="muted">Mobile note: all interactive controls keep ~44px minimum height to support 320px touch usage.</Text>
            </div>
          </article>

          <article id="feedback-overlays" className="scroll-mt-24 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 sm:p-6">
            <Heading as={2} size="base">Feedback and overlays</Heading>
            <Text size="sm" tone="muted" className="mt-2">Canonical alert + dialog states including long-content mobile scroll handling.</Text>
            <div className="mt-4 grid gap-4">
              <DemoBlock title="Alert variants">
                <div className="space-y-2">
                  <Alert variant="info">Info: Search filters updated.</Alert>
                  <Alert variant="success">Success: Package saved to shortlist.</Alert>
                  <Alert variant="warning">Warning: Pricing may change during peak season.</Alert>
                  <Alert variant="error">Error: Unable to submit. Please retry.</Alert>
                </div>
              </DemoBlock>

              <DemoBlock title="Dialog examples">
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" data-testid="showcase-modal-basic">Open basic modal</Button>
                    </DialogTrigger>
                    <OverlayContent>
                      <OverlayHeader>
                        <OverlayTitle>Basic modal</OverlayTitle>
                        <OverlayDescription>Use for focused, short interactions.</OverlayDescription>
                      </OverlayHeader>
                      <Text size="sm" tone="muted">This panel uses shared border, radius, close affordance, and focus behavior.</Text>
                    </OverlayContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary">Open long-content modal</Button>
                    </DialogTrigger>
                    <OverlayContent>
                      <OverlayHeader>
                        <OverlayTitle>Long-content modal</OverlayTitle>
                        <OverlayDescription>Content scrolls inside the panel; close remains visible.</OverlayDescription>
                      </OverlayHeader>
                      <div className="space-y-3">
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <Text key={idx} size="sm" tone="muted">
                            Section {idx + 1}: This demonstrates overflow content in a constrained mobile-safe dialog.
                          </Text>
                        ))}
                      </div>
                    </OverlayContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="danger">Open destructive confirm</Button>
                    </DialogTrigger>
                    <OverlayContent>
                      <OverlayHeader>
                        <OverlayTitle>Remove package?</OverlayTitle>
                        <OverlayDescription>This action cannot be undone.</OverlayDescription>
                      </OverlayHeader>
                      <OverlayFooter>
                        <Button variant="secondary">Cancel</Button>
                        <Button variant="danger">Delete package</Button>
                      </OverlayFooter>
                    </OverlayContent>
                  </Dialog>
                </div>
              </DemoBlock>
            </div>
          </article>

          <article id="navigation" className="scroll-mt-24 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 sm:p-6">
            <Heading as={2} size="base">Navigation</Heading>
            <Text size="sm" tone="muted" className="mt-2">Pagination with previous/next, numbered pages, ellipsis, and disabled states.</Text>
            <div className="mt-4 grid gap-4">
              <DemoBlock title="Small page set (1-5)">
                <Pagination currentPage={smallPage} totalPages={5} onPageChange={setSmallPage} />
              </DemoBlock>
              <DemoBlock title="Large page set (1-50, with ellipsis)">
                <Pagination currentPage={largePage} totalPages={50} onPageChange={setLargePage} />
              </DemoBlock>
              <DemoBlock title="Disabled state">
                <Pagination currentPage={1} totalPages={8} disabled />
              </DemoBlock>
            </div>
          </article>

          <article id="data-display" className="scroll-mt-24 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 sm:p-6">
            <Heading as={2} size="base">Data display</Heading>
            <Text size="sm" tone="muted" className="mt-2">Standardized cards, badges, and table patterns compatible with compare-style data.</Text>
            <div className="mt-4 grid gap-4">
              <DemoBlock title="Card + badge">
                <Card>
                  <CardHeader>
                    <div>
                      <Text size="sm" tone="muted">Operator</Text>
                      <Heading as={3} size="base">Al-Hidayah Travel</Heading>
                    </div>
                    <Badge variant="success">Verified</Badge>
                  </CardHeader>
                  <CardBody>
                    <Text size="sm" tone="muted">ATOL: 11234 • Serving UK pilgrims since 2012.</Text>
                    <Text size="sm">8-night Umrah package from GBP 1,299</Text>
                  </CardBody>
                  <CardFooter>
                    <Badge variant="info">Flights included</Badge>
                    <Badge variant="warning">Ramadan 2026</Badge>
                  </CardFooter>
                </Card>
              </DemoBlock>

              <DemoBlock title="Comparison-style table">
                <TableContainer>
                  <Table data-testid="design-system-table-example">
                    <thead>
                      <tr>
                        <Th>Feature</Th>
                        <Th>Package A</Th>
                        <Th>Package B</Th>
                        <Th>Package C</Th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <Td>Price</Td>
                        <Td>GBP 1,299</Td>
                        <Td>GBP 1,499</Td>
                        <Td>GBP 1,199</Td>
                      </tr>
                      <tr>
                        <Td>Hotel Makkah</Td>
                        <Td>Swissotel (180m)</Td>
                        <Td>Hilton Suites (220m)</Td>
                        <Td>Not provided</Td>
                      </tr>
                      <tr>
                        <Td>Flights</Td>
                        <Td>Direct</Td>
                        <Td>One stop</Td>
                        <Td>Direct</Td>
                      </tr>
                    </tbody>
                  </Table>
                </TableContainer>
              </DemoBlock>
            </div>
          </article>

          <article id="charts" className="scroll-mt-24 rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 sm:p-6">
            <Heading as={2} size="base">Charts</Heading>
            <Text size="sm" tone="muted" className="mt-2">Lightweight chart primitives for partner dashboards without external chart dependency.</Text>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <Text size="sm" tone="muted">Active leads</Text>
                  <Heading as={3} size="lg">42</Heading>
                </Card>
                <Card>
                  <Text size="sm" tone="muted">Offers sent</Text>
                  <Heading as={3} size="lg">19</Heading>
                </Card>
                <Card>
                  <Text size="sm" tone="muted">Conversion rate</Text>
                  <Heading as={3} size="lg">14%</Heading>
                </Card>
              </div>

              <ChartContainer title="Enquiries trend" subtitle="Line chart">
                <LineChart points={lineChartPoints} />
              </ChartContainer>

              <ChartContainer title="Leads by day" subtitle="Bar chart">
                <BarChart points={barChartPoints} />
              </ChartContainer>

              <Text size="xs" tone="muted">
                Data shape: {`[{ label: string; value: number }]`}.
              </Text>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
