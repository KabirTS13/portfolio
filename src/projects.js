import React, { useState } from 'react';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUpload, faPlus, faArrowLeft, faArrowRight, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';

function Project() {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const [projects] = useCollectionData(q, { idField: 'id' });

    const [linkInput, setLinkInput] = useState('');
    const [titleInput, setTitleInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [editing, setEditing] = useState(false); 
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0); 

    const addProject = async () => {
        if (!linkInput.trim() || !titleInput.trim() || !imageFile) return;

        const storageRef = ref(storage, `projectImages/${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(projectsRef, {
            link: linkInput,
            text: titleInput,
            description: descriptionInput,
            imageUrl: imageUrl,
            createdAt: new Date()
        });

        const projectId = docRef.id;

        await updateDoc(doc(projectsRef, projectId), { id: projectId });

        setLinkInput('');
        setTitleInput('');
        setDescriptionInput('');
        setImageFile(null);
        setEditing(false); 
    }

    const deleteProject = async (id) => {
        await deleteDoc(doc(db, 'projects', id))
    }

    const handleNextProject = () => {
        setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % projects.length); 
    }

    const handlePreviousProject = () => {
        setCurrentProjectIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length); 
    }

    return (
        <div className="flex flex-col items-center  h-128 w-2.5/5 bg-gray-700 p-6 m-10 rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-y-auto">
            <div className="flex items-center"> 
                <h1 className="text-4xl font-bold text-white m-3 underline bg-gray-800 bg-opacity-75 p-5 rounded-lg">Projects</h1>
                <button onClick={() => setEditing(true)} className="text-gray-400 ml-0 m-3 py-2 px-3 hover:bg-gray-800 bg-opacity-75 focus:outline-none inline rounded-lg">
                    <FontAwesomeIcon icon={faEdit} className="h-6 w-6"/>
                </button>
            </div>
            
            {projects && projects.length >0 ? (
                <div key={projects[currentProjectIndex].id} className="flex flex-col items-center justify-center"> {/* Center aligning container */}
                    {!editing && (
                        <div className="flex items-center"> {/* Center aligning editing button */}
                            <a className="inline text-2xl font-semibold text-white" href={projects[currentProjectIndex].link} target="_blank" rel="noopener noreferrer">{projects[currentProjectIndex].text}</a>
                            <button onClick={() => deleteProject(projects[currentProjectIndex].id)} className="flex items-center justify-center  hover:bg-red-500 hover:text-white text-gray-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-4 h-8">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between w-full mb-4"> {/* Center aligning image and navigation buttons */}
                        <div>
                            <button onClick={handlePreviousProject} className="text-white hover:text-gray-900 mr-2 focus:outline-none">
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        </div>
                        <div>
                            <img src={projects[currentProjectIndex].imageUrl} alt="Project" className="mx-auto w-4/5 h-3/5 max-h-projects max-w-projects" />
                        </div>
                        <div>
                            <button onClick={handleNextProject} className="text-white hover:text-gray-900 ml-2 focus:outline-none">
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    </div>

                    <p className="text-white max-h-16 max-w-64 overflow-x-auto">{projects[currentProjectIndex].description}</p>

                    <div>
                        {editing && (
                            <div className="flex flex-col items-center mb-4"> 
                            <input type="text" placeholder="Enter Link..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="mr-2 mt-8 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                            <input type="text" placeholder="Enter Project Title..." value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                            <textarea placeholder="Enter Project Description..." value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                            
                            <div className="flex mb-2">
                                <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faUpload} />
                                </label>
                                <button onClick={addProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                                <button onClick={() => setEditing(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
    {!editing ? (
        <div className="flex items-center justify-center mb-4"> {/* Center aligning editing button */}
            <p className="inline text-2xl font-semibold text-white">Add Project →</p>
            <button onClick={() => setEditing(true)} className="text-gray-400 m-3 p-1 hover:bg-gray-800 bg-opacity-75 focus:outline-none inline rounded-lg">
                <FontAwesomeIcon icon={faEdit} />
            </button>
        </div>
    ) : (
        <div className="flex flex-col items-center mb-4"> 
            <input type="text" placeholder="Enter Link..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
            <input type="text" placeholder="Enter Project Title..." value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
            <textarea placeholder="Enter Project Description..." value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
            
            <div className="flex mb-2">
                <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                    <FontAwesomeIcon icon={faUpload} />
                </label>
                <button onClick={addProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                <button onClick={() => setEditing(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </div>
    )}
</>

            )}
        </div> 
    );
    
}

export default Project;

{/* {!editing ? (
                    
                ) : (
                    <>
                        <input type="text" placeholder="Enter Link..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="mr-2 px-2 py-1 border border-gray-300 rounded" />
                        <input type="text" placeholder="Enter Text..." value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="mr-2 px-2 py-1 border border-gray-300 rounded" />
                        <input type="text" placeholder="Enter Project Description..." value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mr-2 px-2 py-1 border border-gray-300 rounded" />
                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="mr-2 cursor-pointer">
                            <FontAwesomeIcon icon={faUpload} />
                        </label>
                        <button onClick={addProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button onClick={() => setEditing(false)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </>
                )}
            </div>
            <div className="relative">
                
                {projects && projects.length > 0 && (
                    <div key={projects[currentProjectIndex].id} className="text-center">
                        <a className="inline" href={projects[currentProjectIndex].link} target="_blank" rel="noopener noreferrer">{projects[currentProjectIndex].text}</a>
                        <img src={projects[currentProjectIndex].imageUrl} alt="Project" className="mx-auto w-4/5 h-3/5" />
                        <p>{projects[currentProjectIndex].description}</p>
                        <button onClick={() => deleteProject(projects[currentProjectIndex].id)} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                )}
            </div>*/}
