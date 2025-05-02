import React from "react";

interface IconSVGProps {
  svg: string;
  className?: string;
}

export const IconSVG: React.FC<IconSVGProps> = ({ svg, className = "" }) => {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};