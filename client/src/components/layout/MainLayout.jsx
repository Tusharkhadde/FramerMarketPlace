import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { FlickeringFooter } from './FlickeringFooter'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-foreground">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <FlickeringFooter />
    </div>
  )
}

export default MainLayout