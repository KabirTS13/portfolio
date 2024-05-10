import React, { useState } from 'react';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUpload, faPlus, faArrowLeft, faArrowRight, faTimes, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

function Project() {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const [projects] = useCollectionData(q, { idField: 'id' });

    const [linkInput, setLinkInput] = useState('');
    const [titleInput, setTitleInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0); 

    const [creating, setCreating] = useState(false); 

    const [editProjectId, setEditProjectId] = useState('')
    const [editProjectLink, setEditProjectLink] = useState('')
    const [editProjectTitle, setEditProjectTitle] = useState('')
    const [editProjectDescription, setEditProjectDescription] = useState('')
    const [editProjectImage, setEditProjectImage] = useState(null)

    const addProject = async () => {
        if (!linkInput.trim() || !titleInput.trim() || !imageFile) {
            alert("Please make sure to complete all of the fields and upload an image.")
            return
        };

        if (titleInput.length > 25 ) {
            alert("Enter a shorter title.")
            return
        }

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
        setCreating(false); 
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

    const editProject = async (id) => {
        setEditProjectId(id);

        const project = projects.find(project => project.id === id)
    
        // Update the state with project details
        setEditProjectLink(project.link);
        setEditProjectTitle(project.text);
        setEditProjectDescription(project.description);
        setEditProjectImage(project.imageUrl);
    }
    
  
    const saveEditProject = async (id) => {
        if (editProjectTitle.length > 25) {
            alert("Enter a shorter title.");
            return;
        }
        
        if (typeof editProjectImage === 'string') {
            await updateDoc(doc(db, 'projects', id), {
                link: editProjectLink,
                text: editProjectTitle,
                description: editProjectDescription,
                imageUrl: editProjectImage
            });
        } else {
            // Prepare storage reference and upload image
            const storageRef = ref(storage, `projectImages/${editProjectImage.name}`);
            const snapshot = await uploadBytes(storageRef, editProjectImage);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // Update project document with new image URL
            await updateDoc(doc(db, 'projects', id), {
                link: editProjectLink,
                text: editProjectTitle,
                description: editProjectDescription,
                imageUrl: imageUrl,
                createdAt: new Date()
            });
        }

        setEditProjectLink('');
        setEditProjectTitle('');
        setEditProjectDescription('');
        setEditProjectImage(null);
        setEditProjectId('');
    };
    

    return (
        <div className="flex flex-col items-center  h-128 w-2.5/5 bg-gray-700 p-6 m-10 rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-y-auto">
            
            {projects && projects.length >0 ? ( //If there are projects, the following code will run
                <>
                    {/* //The "Project" title...heading */}
                    <div className="flex items-center justify-center mb-6 bg-gray-800 bg-opacity-75 p-3 rounded-lg"> 
                        <h1 className="text-4xl font-bold text-white m-3 underline">Projects</h1>
                        <button onClick={() => setCreating(true)} className="flex items-center justify-center text-gray-400 ml-0 m-3 p-2 hover:bg-gray-800 bg-opacity-75 focus:outline-none inline rounded-lg">
                            <FontAwesomeIcon icon={faPlus} className="h-6 w-6"/>
                        </button>
                    </div>

                    {/* //The projects  */}
                    <div key={projects[currentProjectIndex].id} className="flex flex-col items-center justify-center"> {/* Center aligning container */}
                        {!creating && (
                            editProjectId === projects[currentProjectIndex].id ? (
                                <div className="flex flex-col items-center mb-4"> 

                                    {/* //Input fields  */}
                                    <input type="text" placeholder="Enter Link..." value={editProjectLink} onChange={(e) => setEditProjectLink(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                    <input type="text" placeholder="Enter Project Title..." value={editProjectTitle} onChange={(e) => setEditProjectTitle(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                    <textarea placeholder="Enter Project Description..." value={editProjectDescription} onChange={(e) => setEditProjectDescription(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
                                    <input type="file" accept="image/*" onChange={(e) => setEditProjectImage(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                                    
                                    {/* //Buttons to upload image, add project, or cancel. */}
                                    <div className="flex mb-2">
                                        <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                            <FontAwesomeIcon icon={faUpload} />
                                        </label>
                                        
                                        <button onClick={() => saveEditProject(projects[currentProjectIndex].id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                        
                                        <button onClick={() => setEditProjectId('')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                               <>
                                    {/* The title of the project...link + option to delete */}
                                    <div className="flex items-center justify-center mb-4"> {/* Center aligning creating button */}
                                        <div>
                                            <a className="inline text-2xl font-semibold text-white max-w-80" href={projects[currentProjectIndex].link} target="_blank" rel="noopener noreferrer">{projects[currentProjectIndex].text}</a>
                                        </div>
                                        <button onClick={() => editProject(projects[currentProjectIndex].id)} className="flex items-center justify-center  hover:bg-gray-500 hover:text-white text-gray-400 font-bold py-1 px-2 ml-2 rounded focus:outline-none focus:shadow-outline">
                                            <FontAwesomeIcon icon={faEdit} className="w-3 h-6"/>
                                        </button>
                                        <button onClick={() => deleteProject(projects[currentProjectIndex].id)} className="flex items-center justify-center  hover:bg-red-500 hover:text-white text-gray-400 font-bold py-1 px-2 ml-2 rounded focus:outline-none focus:shadow-outline">
                                            <FontAwesomeIcon icon={faTrash} className="w-3 h-6"/>
                                        </button>
                                    </div>  

                                    {/* The Image, as well as left/right buttons to flip between projects. */}
                                    <div className="flex items-center justify-between w-full mb-4"> 
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
                                
                                    {/* The project description  */}
                                    <p className="text-white max-w-96 ">{projects[currentProjectIndex].description}</p>
                                </>
                            )
                            
                        )}

                        {creating && (
                            <div className="flex flex-col items-center mb-4"> 

                                {/* //Input fields  */}
                                <input type="text" placeholder="Enter Link..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                <input type="text" placeholder="Enter Project Title..." value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                                <textarea placeholder="Enter Project Description..." value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                                
                                {/* //Buttons to upload image, add project, or cancel. */}
                                <div className="flex mb-2">
                                    <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                        <FontAwesomeIcon icon={faUpload} />
                                    </label>
                                    <button onClick={addProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button onClick={() => setCreating(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                
                </>
            ) : ( //If there are no projects created, the following code will run
                <> 
                    {!creating ? (
                        <>
                            {/* Title */}
                            <h1 className="text-4xl font-bold text-white m-3 underline bg-gray-800 bg-opacity-75 p-5 rounded-lg">Projects</h1>
                            
                            {/* Allow user to add first project */}
                            <div className="flex items-center justify-center mb-4"> 
                                <p className="inline text-2xl font-semibold text-white">Add your first project</p>
                                <button onClick={() => setCreating(true)} className="flex items-center justify-center text-gray-100 m-2 p-2 hover:bg-gray-800 bg-opacity-75 focus:outline-none rounded-lg">
                                    <FontAwesomeIcon icon={faPlus} className="w-5 h-5"/>
                                </button>
                            </div>
                        </>
                    ) : ( 
                        // After the user clicks on button to create first project, allow them to enter the needed information
                        <div className="flex flex-col items-center mb-4"> 
                            {/* //Title */}
                            <h1 className="text-4xl font-bold text-white m-3 underline bg-gray-800 bg-opacity-75 p-5 rounded-lg">Projects</h1>

                            {/* //Input fields  */}
                            <input type="text" placeholder="Enter Link..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                            <input type="text" placeholder="Enter Project Title..." value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded w-64" />
                            <textarea placeholder="Enter Project Description..." value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mr-2 mb-2 px-2 py-1 border border-gray-300 rounded overflow-auto overflow-y-auto h-16 max-h-96 w-64" />
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mr-2 mb-2 hidden" id="file-upload" />
                            
                            {/* //Buttons to upload image, add project, or cancel. */}
                            <div className="flex mb-2">
                                <label htmlFor="file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faUpload} />
                                </label>
                                <button onClick={addProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline">
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                                <button onClick={() => setCreating(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
