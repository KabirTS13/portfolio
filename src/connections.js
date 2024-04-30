import React, { useState } from 'react';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUpload, faPlus, faArrowLeft, faArrowRight, faTimes, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';


function Connections () {
    const connectionsRef = collection(db, "connections")
    const q = query(connectionsRef, orderBy('createdAt', 'desc'));
    const [connections] = useCollectionData(q, {idField: 'id'});

    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editDescription, setEditDescription] = useState('');

    const [editingIntro, setEditingIntro] = useState('');

    const [link, setLink] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [linkImage, setLinkImage] = useState('');
    const [editLink, setEditLink] = useState('');
    const [editLinkTitle, setEditLinkTitle] = useState('');
    const [editLinkImage, setEditLinkImage] = useState(null);
    
    const [editLinkId, setEditLinkId] = useState('')

    const [creating, setCreating] = useState(false);
    const [creatingIntro, setCreatingIntro] = useState(false); //Will only be used once in the beginning
    const [currentIndex, setCurrentIndex] = useState(0); 


    const addLink = async() => {
        if (!link.trim() || !linkTitle.trim() || !linkImage) {
            alert("Please make sure to complete all of the fields and upload an image.")
            return;
        };

        if (linkTitle.length > 15 ) {
            alert("Enter a shorter title.")
            return;
        }

        const storageRef = ref(storage, `connectionImages/${linkImage.name}`);
        const snapshot = await uploadBytes(storageRef, linkImage);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(connectionsRef, {
            link: link,
            title: linkTitle,
            imageUrl: imageUrl,
            createdAt: new Date()
        });

        const linkId = docRef.id;

        await updateDoc(doc(connectionsRef, linkId), { id: linkId });

        setLink('');
        setLinkTitle('');
        setLinkImage(null);
        setCreating(false);
    };

    const editLinks = async (id) => {
        setEditLinkId(id);

        const connection = connections.find(connection => connection.id === id)
    
        // Update the state with project details
        setEditLink(connection.link);
        setEditLinkTitle(connection.title);
        setEditLinkImage(connection.imageUrl);
    };
    
    const saveEditLinks = async (id) => {
        if (setEditLinkTitle.length > 15 ) {
            alert("Enter a shorter title.")
            return;
        }

        if (typeof editLinkImage === 'string') {
            await updateDoc(doc(db, 'connections', id), {
                link: editLink,
                title: editLinkTitle,
                imageUrl: editLinkImage,
                createdAt: new Date()
            });
        } else {
            // Prepare storage reference and upload image
            const storageRef = ref(storage, `connectionImages/${editLinkImage.name}`);
            const snapshot = await uploadBytes(storageRef, editLinkImage);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // Update project document with new image URL
            await updateDoc(doc(db, 'connections', id), {
                link: editLink,
                title: editLinkTitle,
                imageUrl: imageUrl,
                createdAt: new Date()
            });
        }

        setEditLink('');
        setEditLinkTitle('');
        setEditLinkImage(null);
        setEditLinkId('');
    };


    const addDescription = async() => {
        if (!description.trim() || !imageFile) {
            alert("Please make sure to complete all of the fields and upload an image.")
            return;
        };

        const storageRef = ref(storage, `connectionImages/${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(connectionsRef, {
            description: description,
            imageUrl: imageUrl,
            createdAt: new Date()
        });

        const introId = docRef.id;

        await updateDoc(doc(connectionsRef, introId), { id: introId });

        setDescription('');
        setImageFile(null);
        setCreatingIntro(false);
    };
    
    const editIntro = async (id) => {
        setEditingIntro(id);

        const intro = connections.find(intro => intro.id === id)
    
        // Update the state with project details
        setEditImageFile(intro.url);
        setEditDescription(intro.description);
    };
    
    const saveEditIntro = async (id) => {

        if (typeof editImageFile === 'string') {
            await updateDoc(doc(db, 'connections', id), {
                description: editDescription,
                imageUrl: editImageFile,
                createdAt: new Date()
            });
        } else {
            // Prepare storage reference and upload image
            const storageRef = ref(storage, `connectionImages/${editImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, editImageFile);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // Update project document with new image URL
            await updateDoc(doc(db, 'connections', id), {
                description: editDescription,
                imageUrl: imageUrl,
                createdAt: new Date()
            });
        }

        setEditImageFile(null);
        setEditDescription('');
        setEditingIntro('');
    };


    const deleteLink = async (id) => {
        await deleteDoc(doc(db, 'connections', id))
    };

    const handleNextLink = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % connections.length); 
    };

    const handlePreviousLink = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + connections.length) % connections.length); 
    };

    return (
        <div className="flex flex-col items-center justify-center h-80 w-2.5/5 bg-gray-800 p-6 m-10 rounded-lg shadow-md hover:shadow-lg transition duration-300  mr-10">

        </div>
    )
}

export default Connections;