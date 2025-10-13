import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const VideoPlayer = ({ trailerKey, closeModal }) => {

  // This effect adds keyboard support, allowing the user to close the modal with the "Escape" key.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    // Add event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component unmounts to prevent memory leaks
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal]);

  return (
    // ARIA attributes are used for accessibility, helping screen readers.
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={closeModal} // Closes modal if the semi-transparent backdrop is clicked
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-black w-full max-w-4xl aspect-video rounded-lg shadow-lg"
        // This stops the modal from closing if you click inside the video player itself.
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={closeModal}
          className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5 z-10 hover:bg-red-700 transition-colors"
          aria-label="Close video player"
        >
          <X size={24} />
        </button>

        <iframe
          className="w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
          title="Movie Trailer Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;