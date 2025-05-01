import React from "react";

const navigationItems = [
  "Server Management",
  "Agent Management",
  "Endpoint Security",
  "Network Security",
  "Threat Intelligence",
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-[140px] bg-[#1E1E1E] border-r border-[#333333] flex flex-col">
      <div className="py-6 px-4 flex flex-col items-center">
        <h1 className="text-xl font-bold">NEXUS</h1>
        <span className="text-xs text-gray-400">Server</span>
      </div>
      <div className="flex flex-col p-4 gap-2">
        {navigationItems.map((item, index) => (
          <button key={index} className="nav-button text-sm">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};