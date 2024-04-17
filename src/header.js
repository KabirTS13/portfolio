import React, { useState, useEffect } from 'react';
import { storage, db } from './firebase'; // Import the storage and db modules
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

function Header() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    useEffect(() => {
        // Check if the image URL is stored in Firestore on component mount
        const fetchImageFromFirestore = async () => {
            const docRef = doc(db, 'headerImages', 'uploadedImage');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUploadedImageUrl(docSnap.data().imageUrl);
            }
        };

        fetchImageFromFirestore();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
        
        
    };

    const uploadHeaderImage = () => {
        if (!selectedImage) return;
    
        const storageRef = ref(storage, `headerImages/${selectedImage.name}`);
    
        uploadBytes(storageRef, selectedImage)
            .then(async (snapshot) => {
                console.log('Header image uploaded successfully!');
                const imageUrl = await getDownloadURL(snapshot.ref);
                setUploadedImageUrl(imageUrl);
    
                // Store the image URL in Firestore
                const docRef = doc(db, 'headerImages', 'uploadedImage');
                await setDoc(docRef, { imageUrl });
    
                // Reset the selectedImage state to allow uploading a new image
            })
            .catch((error) => {
                console.error('Error uploading header image:', error);
            })
    };

    return (
        <header className="w-full h-20vh relative">
            {uploadedImageUrl && (
                <img
                    src={uploadedImageUrl}
                    alt="Header background"
                   
                />
            )}

            {uploadedImageUrl && (
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    
                />
            )}

            {uploadedImageUrl && (
                <button onClick={uploadHeaderImage} className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded">
                    Upload Image
                </button>
            )}
        </header>
    );
}

export default Header;