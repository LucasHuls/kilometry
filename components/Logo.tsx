export default function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="512" height="512" rx="104" fill="#111827" />
      <rect x="150" y="140" width="46" height="232" rx="8" fill="#F9FAFB" />
      <path d="M 196 266 L 320 140 L 366 140 L 366 172 L 254 284 Z" fill="#22D3EE" />
      <path d="M 196 286 L 330 372 L 262 372 L 196 330 Z" fill="#22D3EE" />
    </svg>
  )
}
