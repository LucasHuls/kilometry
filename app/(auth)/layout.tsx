import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  )
}
