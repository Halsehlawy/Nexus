import React from "react";
import { IconSVG } from "./IconSVG";

interface StatCardProps {
  icon: string;
  count: string | number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, count, label }) => {
  return (
    <div className="bg-[#2A2A2A] p-6 flex flex-col items-center justify-center">
      <IconSVG svg={icon} className="mb-4" />
      <div className="text-center">
        <div className="text-2xl font-bold mb-1">{count}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
};