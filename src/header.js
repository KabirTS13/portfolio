import React, { useState, useEffect } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import SignOut from './signout.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function Header() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    useEffect(() => {
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
        // Clear the file input field
        e.target.value = null;
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

                // Hide the upload button
                setSelectedImage(null);
            })
            .catch((error) => {
                console.error('Error uploading header image:', error);
            });
    };



    return (
        <header className="h-96 relative bg-cover bg-center flex items-center justify-center text-white">
            {uploadedImageUrl && (
                <img
                    src={uploadedImageUrl}
                    alt="Header background"
                    className="absolute inset-0 object-cover w-full h-full"
                />
            )}

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 p-4 rounded-md">
                    <h1 className="text-8xl font-bold text-white p-4 font-mono">Kabir Sharma</h1>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-4 flex items-center w-full">
                <div className="flex items-center justify-center">
                    <div>
                        <label htmlFor="fileInput">
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="opacity-0 absolute"
                                style={{ width: '50px', height: '50px' }}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white cursor-pointer hover:text-gray-300 transition duration-300 mr-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1.5 2a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5V5zM12 9a2 2 0 110 4 2 2 0 010-4zM4 14.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                            </svg>
                        </label>
                    </div>

                    {selectedImage && (
                        <>
                            <button onClick={uploadHeaderImage} className="p-2 bg-white rounded-full hover:bg-gray-100 transition duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 cursor-pointer hover:text-gray-900 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button onClick={() => setSelectedImage(null)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition duration-300 ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 cursor-pointer hover:text-gray-900 transition duration-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 3.293a1 1 0 010 1.414L6.414 15.121a1 1 0 01-1.414-1.414L15.293 3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M3.293 3.293a1 1 0 011.414 0L15.121 13.586a1 1 0 01-1.414 1.414L3.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </>
                    )}

                    <div className="absolute right-10 m-4">
                        <SignOut />
                    </div>
                </div>
                
            </div>
        </header>
    );
}

export default Header;
