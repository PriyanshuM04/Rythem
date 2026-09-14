export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full bg-[#757575] text-white placeholder:text-gray-300/60 rounded-md px-4 py-1.5 text-left font-['Aleo'] flex items-center outline-none focus:ring-2 focus:ring-accent transition ${className}`}
      {...props}
    />
  );
}
