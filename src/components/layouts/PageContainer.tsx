import clsx from "clsx";

export default function PageContainer({ children, className }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("absolute h-full w-full overflow-y-auto overflow-x-hidden p-2 md:overflow-x-auto md:p-4", { [className]: true })}>{children}</div>
  );
}
