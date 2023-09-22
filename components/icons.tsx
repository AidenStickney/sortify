export const AscIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" className="inline-block ml-2 text-primary">
      <path d="M3 13l5-8 5 8H3z" />
  </svg>
);

export const DescIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" className="inline-block ml-2 text-primary">
      <path d="M13 3l-5 8-5-8h10z" />
  </svg>
);

export const PlaySVG = () => (
  <svg width="24" height="24" fill="currentColor" color="white">
      <path d="M8 5v14l11-7z"></path>
  </svg>
);

export const PauseSVG = () => (
  <svg width="24" height="24" fill="currentColor" color="white">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
  </svg>
);

export const ScrollToBottom = () => (
  <div className="fixed bottom-0 right-0 mb-4 mr-4">
    <a href="#bottom" className="text-2xl">&#8595;</a>
  </div>      
);