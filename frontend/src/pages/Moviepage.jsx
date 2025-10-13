import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Play } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

const Moviepage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: import.meta.env.VITE_TMDB_API_KEY,
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMovieData = async () => {
      try {
        const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options);
        const movieData = await movieResponse.json();
        setMovie(movieData);

        const videosResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options);
        const videosData = await videosResponse.json();

        const officialTrailer = videosData.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
        const fallbackVideo = videosData.results.find((video) => video.site === 'YouTube');

        if (officialTrailer) {
          setTrailerKey(officialTrailer.key);
        } else if (fallbackVideo) {
          setTrailerKey(fallbackVideo.key);
        }
      } catch (err) {
        console.error(err);
      }

      fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`, options)
        .then((res) => res.json())
        .then((res) => setRecommendations(res.results || []))
        .catch((err) => console.error(err));
    };

    fetchMovieData();
  }, [id]);

  if (!movie || movie.success === false) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#181818]">
        <span className="text-xl text-white">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#181818] text-white">
        {/* Backdrop and Gradient */}
        <div className="relative h-[60vh] lg:h-[80vh]">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/50 to-transparent"></div>
        </div>

        {/* Movie Info */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-8 -mt-48 px-8 lg:px-16">
          <img
            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            alt={movie.original_title}
            className="rounded-lg shadow-lg w-48 lg:w-64 h-auto hidden md:block"
          />
          <div className="flex flex-col">
            <h1 className="text-4xl lg:text-6xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4 text-gray-300">
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
              <span>{movie.release_date.split('-')[0]}</span>
              <span>{movie.runtime} mins</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="text-sm px-3 py-1 border border-gray-500 rounded-full">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Overview and Trailer Button */}
        <div className="px-8 lg:px-16 py-8">
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="mt-4 text-gray-300 max-w-3xl">{movie.overview}</p>
          <div className="flex-1">
            <h3 className="font-bold text-white text-2xl mb-2 mt-2">Tagline</h3>
            <p className="italic text-gray-400 mb-6">{movie.tagline || 'No Tagline Available For This Movie'}</p>
          </div>
          {trailerKey && (
            <button
              onClick={() => setIsPlayerOpen(true)}
              className="mt-6 flex justify-center items-center bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded transition-colors duration-300"
            >
              <Play className="mr-2 w-5 h-5 fill-current" />
              Watch Trailer
            </button>
          )}
        </div>

        {/* Details Section */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <div className="bg-[#232323] rounded-lg shadow-lg p-6">
            <ul className="text-gray-300 space-y-3">
              <li><strong>Status:</strong> <span className="ml-2">{movie.status}</span></li>
              <li><strong>Original Language:</strong> <span className="ml-2">{movie.original_language.toUpperCase()}</span></li>
              <li><strong>Budget:</strong> <span className="ml-2">{movie.budget === 0 ? 'N/A' : `$${movie.budget.toLocaleString()}`}</span></li>
              <li><strong>Revenue:</strong> <span className="ml-2">{movie.revenue === 0 ? 'N/A' : `$${movie.revenue.toLocaleString()}`}</span></li>
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-4">You Might Also Like...</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.slice(0, 10).map((rec) => (
                <div key={rec.id} className="bg-[#232323] rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition duration-300">
                  <Link to={`/movie/${rec.id}`}>
                    <img src={`https://image.tmdb.org/t/p/w500/${rec.poster_path}`} alt={rec.title} className="w-full h-auto" />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
                      <p className="text-gray-400 text-sm mb-2 font-semibold">{rec.release_date.slice(0, 4)}</p>
                      <p className="text-gray-400 text-sm">⭐ {rec.vote_average.toFixed(1)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isPlayerOpen && trailerKey && <VideoPlayer trailerKey={trailerKey} closeModal={() => setIsPlayerOpen(false)} />}
    </>
  );
};

export default Moviepage;