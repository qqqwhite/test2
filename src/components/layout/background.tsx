export function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.14),transparent_36%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      {/* Subtle noise texture - dark mode only */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 dark:opacity-[0.15]" />
    </div>
  );
}

