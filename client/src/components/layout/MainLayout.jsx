import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { FlickeringFooter } from './FlickeringFooter'
import OnboardingWizard from '@/components/shared/OnboardingWizard'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <FlickeringFooter />
      <OnboardingWizard />
    </div>
  )
}

export default MainLayout