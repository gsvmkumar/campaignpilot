import { Navbar } from "@/components/navbar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  )
}
