export const splitCubemap = (img: HTMLImageElement): Promise<string[]> => {
    return new Promise((resolve) => {
        const faceWidth = img.width / 4;
        const faceHeight = img.height / 3;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const faces = [];

        // Right face
        canvas.width = faceWidth;
        canvas.height = faceHeight;
        ctx.drawImage(img, faceWidth * 3, faceHeight, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        faces.push(canvas.toDataURL());

        // Left face
        ctx.drawImage(img, faceWidth, faceHeight, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        faces.push(canvas.toDataURL());

        // Top face
        ctx.drawImage(img, 0, 0, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        faces.push(canvas.toDataURL());

        // Bottom face
        ctx.drawImage(img, 0, faceHeight * 2, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        faces.push(canvas.toDataURL());

        // Front face
        ctx.drawImage(img, faceWidth * 2, faceHeight, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        faces.push(canvas.toDataURL());

        // Back face
        ctx.drawImage(img, 0, faceHeight, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        faces.push(canvas.toDataURL());

        resolve(faces);
    });
};
