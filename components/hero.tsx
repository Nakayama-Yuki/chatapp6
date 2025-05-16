export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="text-3xl lg:text-4xl leading-tight! mx-auto max-w-xl text-center font-bold">
        Supabase + Next.js Chat App
      </h1>
      <div className="w-full p-px bg-linear-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
