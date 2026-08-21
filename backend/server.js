import express from "express";
import cors from "cors";
import multer from 'multer';
import path from 'path';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase.js';
import { createContactRequest, createProduct, createSliderContent, createUser, deleteContactRequestById, deleteProductById, deleteSliderContentById, deleteUserById, findUserByCredentials, getAllContactRequests, getAllProducts, getAllSliderContent, getAllUsers, getContactInfo, getProductById, updateProductById, updateSliderContentById, upsertContactInfo } from './db.js';

function getStorageFileName(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, extension).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `catalogue-images/${safeBaseName || 'product-image'}-${uniqueSuffix}${extension}`;
}

async function uploadFileToFirebaseStorage(file) {
    const fileName = getStorageFileName(file);
    const fileRef = ref(storage, fileName);
    await uploadBytes(fileRef, file.buffer, {
        contentType: file.mimetype,
    });

    const url = await getDownloadURL(fileRef);
    return { filePath: fileName, url };
}

function getStoragePathFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const marker = '/o/';
        const markerIndex = parsedUrl.pathname.indexOf(marker);

        if (markerIndex === -1) {
            return null;
        }

        const encodedPath = parsedUrl.pathname.slice(markerIndex + marker.length);
        return decodeURIComponent(encodedPath);
    } catch {
        return null;
    }
}

async function deleteImageByUrl(imageUrl) {
    const storagePath = getStoragePathFromUrl(imageUrl);

    if (!storagePath) {
        return;
    }

    await deleteObject(ref(storage, storagePath));
}


const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

app.get("/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/users", async (req, res) => {
    try {
        const user = await createUser(req.body ?? {});
        res.status(201).json({ user });
    } catch (err) {
        if (err.code === 'DUPLICATE_USERNAME') {
            return res.status(409).json({ error: err.message });
        }

        res.status(400).json({ error: err.message });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const wasDeleted = await deleteUserById(req.params.id);

        if (!wasDeleted) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/contact-info', async (_req, res) => {
    try {
        const contactInfo = await getContactInfo();
        res.json({ contactInfo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/slider-content', async (_req, res) => {
    try {
        const sliderContent = await getAllSliderContent();
        res.json(sliderContent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/contact-requests', async (_req, res) => {
    try {
        const contactRequests = await getAllContactRequests();
        res.json(contactRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/contact-requests', async (req, res) => {
    try {
        const contactRequest = await createContactRequest(req.body ?? {});
        res.status(201).json({ contactRequest });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/contact-requests/:id', async (req, res) => {
    try {
        const wasDeleted = await deleteContactRequestById(req.params.id);

        if (!wasDeleted) {
            return res.status(404).json({ error: 'Contact request not found.' });
        }

        res.json({ success: true });
    } catch (err) {
        if (err.message === 'Invalid contact request id.') {
            return res.status(400).json({ error: err.message });
        }

        res.status(400).json({ error: err.message });
    }
});

app.post('/slider-content', async (req, res) => {
    try {
        const sliderContent = await createSliderContent(req.body ?? {});
        res.status(201).json({ sliderContent });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/slider-content/:id', async (req, res) => {
    try {
        const sliderContent = await updateSliderContentById(req.params.id, req.body ?? {});

        if (!sliderContent) {
            return res.status(404).json({ error: 'Slider content not found.' });
        }

        res.json({ sliderContent });
    } catch (err) {
        if (err.message === 'Invalid slider content id.') {
            return res.status(400).json({ error: err.message });
        }

        res.status(400).json({ error: err.message });
    }
});

app.delete('/slider-content/:id', async (req, res) => {
    try {
        const wasDeleted = await deleteSliderContentById(req.params.id);

        if (!wasDeleted) {
            return res.status(404).json({ error: 'Slider content not found.' });
        }

        res.json({ success: true });
    } catch (err) {
        if (err.message === 'Invalid slider content id.') {
            return res.status(400).json({ error: err.message });
        }

        res.status(400).json({ error: err.message });
    }
});

app.post('/contact-info', async (req, res) => {
    try {
        const contactInfo = await upsertContactInfo(req.body ?? {});
        res.json({ contactInfo });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        const user = await findUserByCredentials(username, password);

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/products', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
]), async (req, res) => {
    let uploadedImages = [];

    try {
        const imageOne = req.files?.image1?.[0];
        const imageTwo = req.files?.image2?.[0];
        const imageThree = req.files?.image3?.[0];

        if (!imageOne || !imageTwo || !imageThree) {
            return res.status(400).json({ error: 'All three product images are required.' });
        }

        uploadedImages = await Promise.all([
            uploadFileToFirebaseStorage(imageOne),
            uploadFileToFirebaseStorage(imageTwo),
            uploadFileToFirebaseStorage(imageThree),
        ]);

        const imageUrls = uploadedImages.map((item) => item.url);

        const product = await createProduct({
            ...req.body,
            imageUrls,
        });

        res.status(201).json({ product });
    } catch (err) {
        await Promise.allSettled(uploadedImages.map((item) => deleteObject(ref(storage, item.filePath))));

        if (err.code === 'DUPLICATE_PRODUCT_ID') {
            return res.status(409).json({ error: err.message });
        }

        res.status(400).json({ error: err.message });
    }
});

app.get('/products', async (_req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/products/:id', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
]), async (req, res) => {
    let uploadedImages = [];

    try {
        const existingProduct = await getProductById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const imageOne = req.files?.image1?.[0];
        const imageTwo = req.files?.image2?.[0];
        const imageThree = req.files?.image3?.[0];
        if ((imageOne && !imageTwo) || (!imageOne && imageTwo) || (imageOne && !imageThree) || (!imageOne && imageThree)) {
            return res.status(400).json({ error: 'Upload All product images or keep the existing ones.' });
        }

        const imageUrls = imageOne && imageTwo && imageThree
            ? (uploadedImages = await Promise.all([
                uploadFileToFirebaseStorage(imageOne),
                uploadFileToFirebaseStorage(imageTwo),
                uploadFileToFirebaseStorage(imageThree),
            ])).map((item) => item.url)
            : existingProduct.imageUrls || [];

        const product = await updateProductById(req.params.id, {
            ...req.body,
            imageUrls,
        });

        if (imageOne && imageTwo && imageThree && existingProduct.imageUrls) {
            await Promise.allSettled((existingProduct.imageUrls || []).map((imageUrl) => deleteImageByUrl(imageUrl)));
        }

        res.json({ product });
    } catch (err) {
        await Promise.allSettled(uploadedImages.map((item) => deleteObject(ref(storage, item.filePath))));

        if (err.code === 'DUPLICATE_PRODUCT_ID') {
            return res.status(409).json({ error: err.message });
        }

        res.status(400).json({ error: err.message });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const existingProduct = await getProductById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const wasDeleted = await deleteProductById(req.params.id);

        if (!wasDeleted) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        await Promise.allSettled((existingProduct.imageUrls || []).map((imageUrl) => deleteImageByUrl(imageUrl)));

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(3000,"0.0.0.0" ,() => {
    console.log("Server running on http://localhost:3000");
});

