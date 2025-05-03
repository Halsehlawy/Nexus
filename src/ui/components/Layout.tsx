import type { ReactNode } from "react"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"
import "../styles/global.css"

interface LayoutProps {
  children: ReactNode
  title: string
}

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar title={title} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}

export default Layout
