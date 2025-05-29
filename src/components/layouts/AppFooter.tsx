import { Mail } from "lucide-react";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-[#2a4d59] py-2 text-white">
      <div className="px-4">
        <div className="flex flex-wrap items-center justify-end text-sm">
          <p className="text-gray-300">© {currentYear} ATM Insights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
