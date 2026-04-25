import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** Pixel width of the image (default: 120) */
  width?: number;
  /** Pixel height of the image (default: 40) */
  height?: number;
  /** Extra Tailwind classes on the wrapping <Link> */
  className?: string;
}

export default function Logo({ width = 120, height = 40, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg ${className}`}
      aria-label="VisionDX — go to home page"
    >
      <Image
        src="/image/logo.png"
        alt="VisionDX logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </Link>
  );
}
