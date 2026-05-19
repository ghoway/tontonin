// Custom layout for watch pages - no global Header/Footer
// This overrides the root layout for /watch/* routes to provide immersive video experience

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Just render children directly without Header/Footer wrapper
  // The watch pages have their own custom headers built-in
  return <>{children}</>;
}
