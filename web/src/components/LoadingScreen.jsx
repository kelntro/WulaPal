const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700 mb-4"></div>
  
      {/* Text with fade animation */}
      <p className="text-green-700 text-xl font-semibold animate-pulse">
        Loading...
      </p>
    </div>
  );
  
  export default LoadingScreen;
  