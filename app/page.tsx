'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

SwiperCore.use([Navigation, Pagination, Autoplay]);

const images = [
    '/images/Chat-bot-bro.png',
    '/images/Chat-bot-cuate.png',
    '/images/Chat-bot-pana.png',
];
export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-black  neo-brutalism bg-primary ">
                    Peliah&apos;s AI Chat Assistant
                </h1>
                <p className="text-xl  mt-4">
                    Your intelligent companion for seamless conversations, translations, and summaries.
                </p>
            </header>

            <div className="w-full max-w-2xl mb-8 neo-brutalism-bg p-4 rounded-lg">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    autoplay={{ delay: 3000 }}
                    loop
                >
                    {images.map((src, index) => (
                        <SwiperSlide key={index}>
                            <div className="relative w-full h-64 md:h-96">
                                <Image
                                    src={src}
                                    alt={`Chat Illustration ${index + 1}`}
                                    layout="fill"
                                    objectFit="contain"
                                    className="rounded-lg"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="mt-8">
                <Link href="/chat">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="neo-brutalism bg-secondary text-white text-2xl font-bold py-4 px-8 rounded-lg hover:bg-secondary/90 transition-all"
                    >
                        Start Chatting
                    </motion.button>
                </Link>
            </div>

            <footer className="mt-12 text-center text-primary-foreground">
                <p className="text-sm">
                    Powered by Chrome AI APIs | Built with Next.js
                </p>
            </footer>
        </div>
    );
}