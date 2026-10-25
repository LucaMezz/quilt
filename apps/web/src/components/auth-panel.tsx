export function AuthPanel({ src }: { src: string }) {
  return (
    <div className="relative hidden bg-muted md:block">
      <img
        src={src}
        alt=""
        width={1122}
        height={1402}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
