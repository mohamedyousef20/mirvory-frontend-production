import React, { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  priority?: boolean
}

export function SafeImage({ 
  src, 
  alt, 
  width = 100, 
  height = 100, 
  className = '', 
  fallback = '/images/placeholder.jpg',
  priority = false 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={priority}
      unoptimized={true}
    />
  )
}
