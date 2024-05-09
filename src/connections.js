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

    const connectionsIntroRef = collection(db, "connectionsIntro")
    const qIntro = query(connectionsIntroRef, orderBy('createdAt', 'desc'));
    const [connectionIntro] = useCollectionData(qIntro, {idField: 'id'});

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
        if (editLinkTitle.length > 10 ) {
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


    const addIntro = async() => {
        if (!description.trim() || !imageFile) {
            alert("Please make sure to complete all of the fields and upload an image.")
            return;
        };

        const storageRef = ref(storage, `connectionImages/${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(connectionsIntroRef, {
            description: description,
            imageUrl: imageUrl,
            createdAt: new Date()
        });

        const introId = docRef.id;

        await updateDoc(doc(connectionsIntroRef, introId), { id: introId });

        setDescription('');
        setImageFile(null);
        setCreatingIntro(false);
    };
    
    const editIntro = async (id) => {
        setEditingIntro(id);

        const intro = connectionIntro.find(intro => intro.id === id)
    
        // Update the state with project details
        setEditImageFile(intro.imageUrl);
        setEditDescription(intro.description);
    };
    
    const saveEditIntro = async (id) => {

        if (typeof editImageFile === 'string') {
            await updateDoc(doc(db, 'connectionsIntro', id), {
                description: editDescription,
                imageUrl: editImageFile,
                createdAt: new Date()
            });
        } else {
            console.log(editImageFile, id)
            // Prepare storage reference and upload image
            const storageRef = ref(storage, `connectionImages/${editImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, editImageFile);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // Update project document with new image URL
            await updateDoc(doc(db, 'connectionsIntro', id), {
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
        <div className="flex flex-col items-center justify-center h-80 w-2.5/5 bg-gray-800 m-10 rounded-lg shadow-md hover:shadow-lg transition duration-300  mr-10">
            {connectionIntro && connectionIntro.length >0 ? ( //If there is the introduction part created
                <>
                    {editingIntro === connectionIntro[0].id ? ( //If the user is editing the intro
                        <div className="flex flex-col items-center mb-4"> 
                             <h1 className="text-2xl font-bold text-white m-3 underline">Edit Bio:</h1>
                            {/* //Input fields  */}
                            <textarea placeholder="Enter your bio..." value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
                            <input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                            
                            {/* //Buttons to upload image, add project, or cancel. */}
                            <div className="flex mb-2">
                                <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faUpload} />
                                </label>
                                <button onClick={ () => saveEditIntro(connectionIntro[0].id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button onClick={() => setEditingIntro('')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        </div>
                    ) : ( //If the user is not editing the intro
                        <div className="flex justify-between">
                            <div className=" flex flex-col items-center"> {/* Introduction part of the code */}
                                <img src={connectionIntro[0].imageUrl} alt="Project" className="mx-auto max-w-56 max-h-44 mt-4"/>
                                <div className=" max-w-56 max-h-19 overflow-y-auto m-2 break-words">
                                    <p className="text-white text-center text-sm">{connectionIntro[0].description}</p>
                                </div>
                                <button onClick={() => editIntro(connectionIntro[0].id)} className="flex items-center justify-center  hover:bg-gray-500 hover:text-white text-gray-400 font-bold py-1 px-2 ml-2 rounded focus:outline-none focus:shadow-outline text-xs">
                                    Edit Bio
                                </button>
                            </div>
                            <div >
                                { connections && connections.length >0 ? ( // If there are connections created
                                    !creating ? ( //If the user is not creating a connection
                                        editLinkId === connections[currentIndex].id ? ( //If the user is editing a link/connection
                                            <div className="flex flex-col items-center mb-4"> 
                                                <h1 className="text-2xl font-bold text-white m-3 underline">Edit Link:</h1>
                                                {/* //Input fields  */} 
                                                <input type="text" placeholder="Enter Link..." value={editLink} onChange={(e) => setEditLink(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                                <input type="text" placeholder="Enter Link..." value={editLinkTitle} onChange={(e) => setEditLinkTitle(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                                <input type="file" accept="image/*" onChange={(e) => setEditLinkImage(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                                                
                                                {/* //Buttons to upload image, add project, or cancel. */}
                                                <div className="flex mb-2">
                                                    <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                                        <FontAwesomeIcon icon={faUpload} />
                                                    </label>
                                                    <button onClick={ () => saveEditLinks(connections[0].id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                    <button onClick={() => setEditLinkId('')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : ( //If the user is not editing a link

                                        connections.length === 1 ? (
                                            <div className="ml-12">
                                                <div className="flex flex-col items-center">
                                                <div className="flex items-center justify-center mb-0 bg-gray-800 bg-opacity-75 p-3 rounded-lg pt-0"> 
                                                    <h1 className="text-2xl font-bold text-white m-3 underline">Connections</h1>
                                                    <button onClick={() => setCreating(true)} className="flex items-center justify-center text-gray-400 ml-0 m-3 p-2 hover:bg-gray-900 bg-opacity-75 focus:outline-none rounded-lg">
                                                        <FontAwesomeIcon icon={faPlus} className="h-6 w-6"/>
                                                    </button>
                                                </div>
                                                
                                                <div className="flex flex-col items-center">
                                                    <img className="h-36 w-36 m-auto rounded-full" src={connections[currentIndex].imageUrl} />
                                                    <div className="mt-2 mb-2">
                                                        <a className="inline text-xl font-semibold text-white hover:text-gray-400" href={connections[currentIndex].link} target="_blank" rel="noopener noreferrer">{connections[currentIndex].title}</a>
                                                    </div>
                                                    <div className="flex items-center justify-center mb-4"> {/* Center aligning creating button */}
                                                        <button onClick={() => editLinks(connections[currentIndex].id)} className="flex items-center justify-center  hover:bg-gray-500 hover:text-white text-gray-400 font-bold py-1 px-1 ml-1 rounded focus:outline-none focus:shadow-outline">
                                                            <FontAwesomeIcon icon={faEdit} className="w-3 h-4"/>
                                                        </button>
                                                        <button onClick={() => deleteLink(connections[currentIndex].id)} className="flex items-center justify-center  hover:bg-red-500 hover:text-white text-gray-400 font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline">
                                                            <FontAwesomeIcon icon={faTrash} className="w-3 h-4"/>
                                                        </button>
                                                    </div>  
                                                </div>
                                            </div>
                                            </div>
                                        ) : (
                                            connections.length === 2 ? (
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="flex items-center justify-center mb-0 bg-gray-800 bg-opacity-75 p-3 rounded-lg pt-0"> {/* "Connections" heading */}
                                                        <h1 className="text-2xl font-bold text-white m-3 underline">Connections</h1>
                                                        <button onClick={() => setCreating(true)} className="flex items-center justify-center text-gray-400 ml-0 m-3 p-2 hover:bg-gray-900 bg-opacity-75 focus:outline-none rounded-lg">
                                                            <FontAwesomeIcon icon={faPlus} className="h-6 w-6"/>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        {/* First conneciton */}
                                                        <div className="ml-6"> {/* Outer container...just to give some margin left from the bio part */}
                                                            <div className="flex flex-col items-center"> {/* Outer container to center align all of the items */}
                                                                <img className="h-36 w-36 m-auto rounded-full" src={connections[currentIndex+1].imageUrl} />
                                                                <div className="mt-2 mb-2">
                                                                    <a className="inline text-xl font-semibold text-white hover:text-gray-400" href={connections[currentIndex+1].link} target="_blank" rel="noopener noreferrer">{connections[currentIndex].title}</a>
                                                                </div>
                                                                <div className="flex items-center justify-center mb-4"> {/* Center aligning creating button */}
                                                                    <button onClick={() => editLinks(connections[currentIndex+1].id)} className="flex items-center justify-center  hover:bg-gray-500 hover:text-white text-gray-400 font-bold py-1 px-1 ml-1 rounded focus:outline-none focus:shadow-outline">
                                                                        <FontAwesomeIcon icon={faEdit} className="w-3 h-4"/>
                                                                    </button>
                                                                    <button onClick={() => deleteLink(connections[currentIndex+1].id)} className="flex items-center justify-center  hover:bg-red-500 hover:text-white text-gray-400 font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline">
                                                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-4"/>
                                                                    </button>
                                                                </div>  
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Second Conneciton */}
                                                        <div className="ml-6"> {/* Outer container...just to give some margin left from the first connections */}
                                                            <div className="flex flex-col items-center"> {/* Outer container to center align all of the items */}
                                                                <img className="h-36 w-36 m-auto rounded-full" src={connections[currentIndex].imageUrl} />
                                                                <div className="mt-2 mb-2">
                                                                    <a className="inline text-xl font-semibold text-white hover:text-gray-400" href={connections[currentIndex].link} target="_blank" rel="noopener noreferrer">{connections[currentIndex].title}</a>
                                                                </div>
                                                                <div className="flex items-center justify-center mb-4"> {/* Center aligning creating button */}
                                                                    <button onClick={() => editLinks(connections[currentIndex].id)} className="flex items-center justify-center  hover:bg-gray-500 hover:text-white text-gray-400 font-bold py-1 px-1 ml-1 rounded focus:outline-none focus:shadow-outline">
                                                                        <FontAwesomeIcon icon={faEdit} className="w-3 h-4"/>
                                                                    </button>
                                                                    <button onClick={() => deleteLink(connections[currentIndex].id)} className="flex items-center justify-center  hover:bg-red-500 hover:text-white text-gray-400 font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline">
                                                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-4"/>
                                                                    </button>
                                                                </div>  
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                            <div className="flex items-center justify-center mb-0 bg-gray-800 bg-opacity-75 p-3 rounded-lg pt-0"> 
                                                <h1 className="text-2xl font-bold text-white m-3 underline">Connections</h1>
                                                <button onClick={() => setCreating(true)} className="flex items-center justify-center text-gray-400 ml-0 m-3 p-2 hover:bg-gray-900 bg-opacity-75 focus:outline-none rounded-lg">
                                                    <FontAwesomeIcon icon={faPlus} className="h-6 w-6"/>
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-col items-center mb-4">
                                                <img className="h-24 w-24 m-auto" src={connections[currentIndex].imageUrl} />
                                                <div>
                                                    <a className="inline text-xs font-semibold text-white" href={connections[currentIndex].link} target="_blank" rel="noopener noreferrer">{connections[currentIndex].title}</a>
                                                </div>
                                                <div className="flex items-center justify-center mb-4"> {/* Center aligning creating button */}
                                                    <button onClick={() => editLinks(connections[currentIndex].id)} className="flex items-center justify-center  hover:bg-gray-500 hover:text-white text-gray-400 font-bold py-1 px-1 ml-1 rounded focus:outline-none focus:shadow-outline">
                                                        <FontAwesomeIcon icon={faEdit} className="w-3 h-4"/>
                                                    </button>
                                                    <button onClick={() => deleteLink(connections[currentIndex].id)} className="flex items-center justify-center  hover:bg-red-500 hover:text-white text-gray-400 font-bold py-1 px-1 rounded focus:outline-none focus:shadow-outline">
                                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-4"/>
                                                    </button>
                                                </div>  
                                            </div>
                                        </div>
                                            )
                                        )
                                        )
                                    ) : ( //If the user is creating a connection 
                                        <div className="flex flex-col items-center mb-4"> 
                                            
                                            <h1 className="text-2xl font-bold text-white m-3 underline">Create Connection:</h1>
                                            {/* //Input fields  */}
                                            <input type="text" placeholder="Enter Link..." value={link} onChange={(e) => setLink(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                            <input type="text" placeholder="Enter Link..." value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                            <input type="file" accept="image/*" onChange={(e) => setLinkImage(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                                            
                                            {/* //Buttons to upload image, add project, or cancel. */}
                                            <div className="flex mb-2">
                                                <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                                    <FontAwesomeIcon icon={faUpload} />
                                                </label>
                                                <button onClick={addLink} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                                <button onClick={() => setCreating(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : ( //If there are no connections created
                                    !creating ? ( // The user is not creating it's first connection
                                        <>
                                            
                                            {/* Allow user to add first project */}
                                            <div className="flex items-center justify-center mb-4"> 
                                                <p className="inline text-2xl font-semibold text-white">Add your first connection</p>
                                                <button onClick={() => setCreating(true)} className="flex items-center justify-center text-gray-100 m-2 p-2 hover:bg-gray-800 bg-opacity-75 focus:outline-none rounded-lg">
                                                    <FontAwesomeIcon icon={faPlus} className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </>
                                    ) : ( //They are creating
                                        <div className="flex flex-col items-center mb-4"> 
                                                
                                            <h1 className="text-2xl font-bold text-white m-3 underline">Create Connection:</h1>
                                            {/* //Input fields  */}
                                            <input type="text" placeholder="Enter Link..." value={link} onChange={(e) => setLink(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                            <input type="text" placeholder="Enter Link..." value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                            <input type="file" accept="image/*" onChange={(e) => setLinkImage(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                                            
                                            {/* //Buttons to upload image, add project, or cancel. */}
                                            <div className="flex mb-2">
                                                <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                                    <FontAwesomeIcon icon={faUpload} />
                                                </label>
                                                <button onClick={addLink} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                                <button onClick={() => setCreating(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}

                                
                            </div>
                        </div>
                        
                    )}
                </>
            ) : ( //If there isn't an introduction part created
                <>
                    {!creatingIntro ? ( //Code to tell the user to create an introduction and enter a link
                        <>
                            <div className="flex items-center justify-center mb-4"> 
                                <p className="inline text-xl font-semibold text-white">Add a bit about yourself and upload your image!</p>
                                <button onClick={() => setCreatingIntro(true)} className="flex items-center justify-center text-gray-100 m-2 p-2 hover:bg-gray-900 bg-opacity-75 focus:outline-none rounded-lg">
                                    <FontAwesomeIcon icon={faPlus} className="w-5 h-5"/>
                                </button>
                            </div>
                            
                            
                        </>
                    ) : ( //Allow user to enter their introduction and their first connection
                        <>
                            <div className="flex flex-col items-center mb-4"> 

                                {/* //Input fields  */}
                                <textarea placeholder="Enter your bio..." value={description} onChange={(e) => setDescription(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                                
                                {/* //Buttons to upload image, add project, or cancel. */}
                                <div className="flex mb-2">
                                    <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                        <FontAwesomeIcon icon={faUpload} />
                                    </label>
                                    <button onClick={addIntro} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button onClick={() => setCreatingIntro(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Connections;