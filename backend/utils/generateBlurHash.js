import sharp from 'sharp';
import { encode } from 'blurhash';

export async function generateBlurHash(buffer) {
    const { data, info } = await sharp(buffer)
        .raw()
        .ensureAlpha()
        .resize(32, 32, {
            fit: 'inside',
        })
        .toBuffer({ resolveWithObject: true });

    return encode(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        4,
        4
    );
}