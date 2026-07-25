import { ICONS } from '@/lib/data';

// Renders a 24×24 stroke icon from the ICONS path map. A value starting with
// '<' is raw inner SVG; otherwise it's a single path `d`.
export default function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const raw = ICONS[name] || '';
  const inner = raw.indexOf('<') >= 0 ? raw : `<path d="${raw}"/>`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
