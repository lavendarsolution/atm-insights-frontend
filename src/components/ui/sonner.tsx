import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme={"light"} className="toaster group" {...props} richColors />;
};

export { Toaster };
