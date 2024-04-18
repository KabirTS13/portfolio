import React, { useState } from 'react';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUpload, faPlus, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function Project() {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const [projects] = useCollectionData(q, { idField: 'id' });

    const [linkInput, setLinkInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [editing, setEditing] = useState(false); // State to track if editing mode is active
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0); // State to track the index of the current project

    const addProject = async () => {
        if (!linkInput.trim() || !descriptionInput.trim() || !imageFile) return;

        const storageRef = ref(storage, `projectImages/${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(projectsRef, {
            link: linkInput,
            text: descriptionInput,
            imageUrl: imageUrl,
            createdAt: new Date()
        });

        const projectId = docRef.id;

        await updateDoc(doc(projectsRef, projectId), { id: projectId });

        setLinkInput('');
        setDescriptionInput('');
        setImageFile(null);
        setEditing(false); // Exit editing mode after adding a project
    }

    const deleteProject = async (id) => {
        await deleteDoc(doc(db, 'projects', id))
    }

    const handleEdit = () => {
        setEditing(true); // Activate editing mode when edit icon is clicked
        console.log("clicked")
    }

    const handleNextProject = () => {
        setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % projects.length); // Move to the next project
    }

    const handlePreviousProject = () => {
        setCurrentProjectIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length); // Move to the previous project
    }

    return (
        <div className="flex justify-center h-96">
            <div className="w-40%">
                <div className="project-form flex items-center mb-4">
                    {!editing ? (
                        <button onClick={handleEdit} className="text-gray-600 hover:text-red-900 focus:outline-none h-52 w-52">
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                    ) : (
                        <>
                            <input type="text" placeholder="Enter Link..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="mr-2 px-2 py-1 border border-gray-300 rounded" />
                            <input type="text" placeholder="Enter Text..." value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mr-2 px-2 py-1 border border-gray-300 rounded" />
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="mr-2 cursor-pointer">
                                <FontAwesomeIcon icon={faUpload} />
                            </label>
                            <button onClick={addProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="relative w-60%">
                <div className="absolute inset-y-0 left-0 flex items-center">
                    <button onClick={handlePreviousProject} className="text-gray-600 hover:text-gray-900 mr-2 focus:outline-none">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                    <button onClick={handleNextProject} className="text-gray-600 hover:text-gray-900 ml-2 focus:outline-none">
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
                {projects && projects.length > 0 && (
                    <div key={projects[currentProjectIndex].id} className="text-center">
                        <a href={projects[currentProjectIndex].link} target="_blank" rel="noopener noreferrer">{projects[currentProjectIndex].text}</a>
                        <img src={projects[currentProjectIndex].imageUrl} alt="Project" className="mx-auto" />
                        <button onClick={() => deleteProject(projects[currentProjectIndex].id)} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Project;
