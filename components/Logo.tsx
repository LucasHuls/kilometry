export default function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="Kilometry" className={className} />
}
