export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen px-4 py-8 md:px-6"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(77,208,196,0.16), transparent 26%), radial-gradient(circle at 82% 18%, rgba(124,183,255,0.12), transparent 22%), linear-gradient(180deg, #07111f, #091522)',
      }}
    >
      {children}
    </div>
  );
}

