import "../styles/topbar.css"
import { Bell, Settings, User } from "lucide-react"
interface TopBarProps {
  title: string
}

const TopBar = ({ title }: TopBarProps) => {
  return (
    <header className="topbar">
      <h1 className="page-title">{title}</h1>
      <div className="topbar-actions">
        <button className="icon-button"><Settings/></button>
        <button className="icon-button"><Bell/></button>
        <button className="icon-button"><User/></button>
      </div>
    </header>
  )
}

export default TopBar
