"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        // ✅ Define separate classNames for each type
        classNames: {
          success: "!bg-green-500 text-white font-medium border-none shadow-lg",
          info: "!bg-blue-500 text-white font-medium border-none shadow-lg",
          warning:
            "!bg-yellow-500 text-black font-medium border-none shadow-lg",
          error: "!bg-red-500 text-white font-medium border-none shadow-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
