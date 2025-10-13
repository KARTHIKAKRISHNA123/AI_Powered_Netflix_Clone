import React, { useEffect, useState } from 'react';
import CardImg from '../assets/cardimg.jpg';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router';  

const CardList = ({title, category}) => {


  const [data, setData] = React.useState([]);
  const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYmYyYmE3MDRjOWU1Mjc0Yjk2ZTVlYzIzMWIwYTA5ZCIsIm5iZiI6MTc1OTU4OTc0NS43NzMsInN1YiI6IjY4ZTEzNTcxMWU3ZjcyMDFiMjljYTNkNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.LuNYbGoOh-ZN2o-0tCZxKdU3xWWWU_-r_IJmbsoaOrw'
  }
};

useEffect(() => { fetch(`https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`, options)
  .then(res => res.json())
  .then(res => setData(res.results))
  .catch(err => console.error(err));
  

  console.log(title, category);}, []);



  return (
    // Add w-full here to constrain the container's width
    <div className='text-white md:px-4 w-full'>
      <h2 className='pt-10 pb-5 text-lg font-medium'>{title}</h2>
      <Swiper
        modules={[Navigation, A11y]}
        slidesPerView={"auto"}
        spaceBetween={10}
        observer={true}
        observeParents={true}
        navigation
        className='mySwiper red-navigation'
      >
        {data.map((item, index) => (
          <SwiperSlide key={index} className="max-w-72">
            <Link to={`/movie/${item.id}`} >
            <img src={`https://image.tmdb.org/t/p/w500/${item.backdrop_path}`} alt="A very good movie" className='h-44 w-full object-center object-cover' />
            <p className='text-center pt-2'>{item.original_title}</p>
            </Link>

          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default CardList;