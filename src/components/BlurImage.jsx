import { Blurhash } from 'react-blurhash';
import { useState } from 'react';

function BlurImage({
    src,
    blurHash,
    alt,
    className,
}) {
    const [loaded, setLoaded] =
        useState(false);

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {!loaded && blurHash && (
                <Blurhash
                    hash={blurHash}
                    width="100%"
                    height="100%"
                />
            )}

            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() =>
                    setLoaded(true)
                }
                style={{
                    opacity: loaded ? 1 : 0,
                    transition:
                        'opacity .3s ease',
                }}
            />
        </div>
    );
}

export default BlurImage;