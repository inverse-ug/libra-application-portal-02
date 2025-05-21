import Image from "next/image";
import libra_logo from "@/assets/logo.png";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image src={libra_logo} alt="Libra Logo" width={40} height={40} />
    </div>
  );
}
