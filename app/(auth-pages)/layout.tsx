export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl flex flex-col gap-12 items-center justify-center">{children}</div>
  );
}
