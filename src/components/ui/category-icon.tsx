import React from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  // @ts-expect-error Lucide dynamic icon indexing
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
}

