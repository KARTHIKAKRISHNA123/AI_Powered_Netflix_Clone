import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';

// A skeleton component to show while images are loading
const MovieCardSkeleton = () => (
    <div className='bg-[#1a1a1a] rounded-md animate-pulse aspect-[2/3]' />
);

const RecommendedMovies = ({movieTitles}) => {
    const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: import.meta.env.VITE_TMDB_API_KEY
  }
};



  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

    const fetchMovie = async(title) => {
        const encodedTitle = encodeURIComponent(title);
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodedTitle}&include_adult=false&language=en-US&page=1`;

        try {
            const res = await fetch(url, options);
            const data = await res.json();
            return data.results?.[0] || null;
        } catch (error) {

            console.log("Error fetching movie: ", error);
            return null;

            
        }
    };

    useEffect(() => {
        const loadMovies = async() => {
            setLoading(true);
            const results = await Promise.all(movieTitles.map((title) => fetchMovie(title)));
            setMovies(results.filter(Boolean));
            setLoading(false);

            
        };

        if (movieTitles.length) {
            loadMovies();
        }
    }, [movieTitles]);

    if (loading) {
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            {Array.from({ length: 10 }).map((_, index) => (
                <MovieCardSkeleton key={index} />
            ))}
        </div>
    );
}

    console.log(movies);

  return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            {movies.map((movie) => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className='relative rounded-lg overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-red-800/40'>
                    {/* Movie Poster */}
                    <img
                        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                        alt={movie.title}
                        className='w-full h-full object-cover'
                    />
                    {/* Hover Overlay with Title */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                       <div>
                        <h3 className='text-white text-base font-bold drop-shadow-lg'>
                            {movie.title}
                        </h3>
                        <div>
                        {movie.release_date && (
                                <p className='text-gray-400 text-sm mt-1'>
                                    {movie.release_date.slice(0, 4)}
                                </p>
                            )}
                            </div>
                            </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default RecommendedMovies;