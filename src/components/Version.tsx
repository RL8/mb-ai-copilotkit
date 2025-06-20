export function Version() {
  // This will be replaced at build time with the actual deployment date
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString();
  const deploymentId = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local';
  
  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border">
      <div className="flex flex-col items-end">
        <div>v{deploymentId}</div>
        <div>{new Date(buildDate).toLocaleString()}</div>
      </div>
    </div>
  );
} 