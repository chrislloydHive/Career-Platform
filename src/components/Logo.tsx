import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function Logo({ size = 'md', className = '', linkToHome = true }: LogoProps) {
  const logoText = (
    <span className={`font-semibold tracking-tight text-blue-600 ${sizeClasses[size]} ${className}`}>
      MyNextRole
    </span>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {logoText}
      </Link>
    );
  }

  return logoText;
}
