import Logo from "./Logo";

export default function AuthCard({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-sm bg-surface rounded-card p-10 flex flex-col items-center">
        <Logo />
        {title && (
          <h1 className="font-serif text-[32px] font-bold text-white -mt-3 mb-6 text-center">
            {title}
          </h1>
        )}
        <div className="w-full flex flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}