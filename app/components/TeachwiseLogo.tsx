type TeachwiseLogoProps = {
  className?: string;
  idSuffix: string;
};

export default function TeachwiseLogo({ className = 'h-10 w-10', idSuffix }: TeachwiseLogoProps) {
  return (
    <img
      src="/teachwise-logo-ref.png"
      alt=""
      aria-hidden="true"
      className={`${className} block object-contain`}
      data-suffix={idSuffix}
      draggable={false}
    />
  );
}
