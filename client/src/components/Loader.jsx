const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}

export default Loader