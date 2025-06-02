function FullScreenSpinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="
          fixed inset-0 z-50 
          flex items-center justify-center 
          bg-transparent
        "
    >
      <span className="sr-only">Carregando...</span>
      <div
        className="
            animate-spin 
            rounded-full border-4 border-t-transparent 
            w-8 h-8 2xl:w-12 2xl:h-12 
            border-current
          "
      />
    </div>
  );
}

export default FullScreenSpinner;
