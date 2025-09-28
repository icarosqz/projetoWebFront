
import { useState, useEffect, useMemo } from 'react';

export default function ProductImageGallery({ images = [] }) {
    const [currentImage, setCurrentImage] = useState('');
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const fullUrlImages = useMemo(() => {
        if (!images || images.length === 0) return [];
        return images.map(img => ({
            ...img,
            url_imagem: img.url_imagem.startsWith('/static') 
                ? `${baseUrl}${img.url_imagem}` 
                : img.url_imagem
        }));
    }, [images, baseUrl]);

    useEffect(() => {
      if (fullUrlImages.length > 0) {
        setCurrentImage(fullUrlImages[0].url_imagem);
      } else {
        setCurrentImage('/img/placeholder.png'); 
      }
    }, [fullUrlImages]);

    return (
        <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
                {fullUrlImages.map((image) => (
                    <button
                        key={image.id}
                        onClick={() => setCurrentImage(image.url_imagem)}
                        className={`aspect-square h-20 w-20 cursor-pointer overflow-hidden rounded-md border-2 p-1 transition-all ${
                            currentImage === image.url_imagem ? 'border-primary shadow-sm' : 'border-transparent'
                        }`}
                    >
                        <img
                            src={image.url_imagem}
                            alt={`Thumbnail ${image.id}`}
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Imagem Principal */}
            <div className="flex-1 overflow-hidden rounded-lg border bg-secondary/10">
                <div className="aspect-square relative h-full w-full">
                    <img
                        src={currentImage}
                        alt="Imagem principal do produto"
                        className="absolute inset-0 h-full w-full object-cover p-4"
                    />
                </div>
            </div>
        </div>
    );
}