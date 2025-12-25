'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageSlider({ images: propImages }) {
    const [images, setImages] = useState(propImages || [
        'http://localhost:5000/uploads/slider%20(1).png',
        'http://localhost:5000/uploads/slider%20(2).png',
        'http://localhost:5000/uploads/slider%20(3).png'
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000); // 4 Seconds
        return () => clearInterval(timer);
    }, [images]);

    return (
        <div className="w-full mb-2">
            {/* Edge-to-Edge Container (Zero Padding) */}
            <div className="relative w-full aspect-[16/7] md:aspect-[21/9] bg-slate-800">
                <AnimatePresence mode='wait'>
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt={`Slide ${currentIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.src = "https://via.placeholder.com/800x300?text=Zizo10+Premium";
                            e.target.style.display = 'block';
                        }}
                    />
                </AnimatePresence>

                {/* Dots Overlay */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
