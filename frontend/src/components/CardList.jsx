import React, { useEffect, useState } from "react";
import CardImg from "../assets/cardimg.jpg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router";

const CardList = ({ title, category }) => {
  const [data, setData] = React.useState([]);
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: import.meta.env.VITE_TMDB_API_KEY,
    },
  };

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`,
      options
    )
      .then((res) => res.json())
      .then((res) => setData(res.results))
      .catch((err) => console.error(err));

    console.log(title, category);
  }, []);

  return (
    // Add w-full here to constrain the container's width
    <div className="text-white md:px-4 w-full">
      <h2 className="pt-10 pb-5 text-lg font-medium">{title}</h2>

      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={15} // Increased spacing a bit for a better look
        navigation
        className="mySwiper red-navigation"
        // This is the key part for responsiveness
        breakpoints={{
          // when window width is >= 320px
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          // when window width is >= 640px
          640: {
            slidesPerView: 3,
          },
          // when window width is >= 768px
          768: {
            slidesPerView: 4,
          },
          // when window width is >= 1024px
          1024: {
            slidesPerView: 5,
          },
          // when window width is >= 1280px
          1280: {
            slidesPerView: 6,
          },
        }}
      >
        {data.map((item, index) => (
          // No more width classes needed here! Swiper handles it.
          <SwiperSlide key={index}>
            <Link
              to={`/movie/${item.id}`}
              className="block rounded-lg overflow-hidden bg-[#232323] hover:scale-105 transform transition duration-300 h-full"
            >
              <div className="aspect-video">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.backdrop_path}`}
                  alt={item.original_title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center p-2 truncate font-semibold">
                {item.original_title}
              </p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardList;
