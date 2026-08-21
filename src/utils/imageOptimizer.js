export const optimizeImage = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const MAX_SIZE = 1920;

      let width = img.width;
      let height = img.height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(
          MAX_SIZE / width,
          MAX_SIZE / height
        );

        width *= ratio;
        height *= ratio;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;

      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            const sizeKB = blob.size / 1024;

            if (sizeKB > 400 && quality > 0.55) {
              quality -= 0.05;
              compress();
              return;
            }

            resolve(
              new File(
                [blob],
                file.name.replace(/\.\w+$/, ".webp"),
                {
                  type: "image/webp",
                }
              )
            );
          },
          "image/webp",
          quality
        );
      };

      compress();
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};