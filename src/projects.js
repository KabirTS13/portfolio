import React, { useState, useEffect } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function Project() {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        link: '',
        text: '',
        image: null,
        imageUrl: ''
    });

    useEffect(() => {
        const fetchProjectsFromFirestore = async () => {
            const projectCollection = collection(db, 'projects');
            const projectsSnapshot = await getDocs(projectCollection);
            const projectsData = projectsSnapshot.docs.map(doc => doc.data());
            setProjects(projectsData);
        };

        fetchProjectsFromFirestore();
    }, []);

    const handleLinkChange = (e) => {
        setNewProject({ ...newProject, link: e.target.value });
    };

    const handleTextChange = (e) => {
        setNewProject({ ...newProject, text: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewProject({ ...newProject, image: file });
    };

    const handleAddProject = async () => {
        try {
            
            const docRef = await addDoc(collection(db, 'projects'), {
                link: newProject.link,
                text: newProject.text,
                imageUrl: newProject.imageUrl
            });
            const todoId = docRef.id;
            await updateDoc(doc(collection(db, 'projects'), todoId), { id: todoId });
            
            console.log('Document written with ID: ', docRef.id);
            setProjects([...projects, newProject]);
            setNewProject({
                link: '',
                text: '',
                image: null,
                imageUrl: ''
            });
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };

    const handleUploadImage = async () => {
        if (!newProject.image) return;

        const storageRef = ref(storage, `projectImages/${newProject.image.name}`);

        try {
            const snapshot = await uploadBytes(storageRef, newProject.image);
            const imageUrl = await getDownloadURL(snapshot.ref);
            console.log("uploaded")

            setNewProject({ ...newProject, imageUrl });
        } catch (error) {
            console.error('Error uploading project image:', error);
        }
    };

    const deleteTodo = async (id) => {
        await deleteDoc(doc(db, 'projects', id))
      }

    return (
        <div className="project-container">
            <div className="project-form">
                <input type="text" placeholder="Enter Link" value={newProject.link} onChange={handleLinkChange} />
                <input type="text" placeholder="Enter Text" value={newProject.text} onChange={handleTextChange} />
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <button onClick={handleUploadImage}>Upload Image</button>
                <button onClick={handleAddProject}>Add Project</button>
            </div>
            <div className="size-60">
                {projects.map((project, index) => (
                    <div key={index} className="project-item">
                        <a href={project.link} target="_blank" rel="noopener noreferrer">{project.text}</a>
                        {project.imageUrl && <img src={project.imageUrl} alt="Project" />}
                        <button onClick={() => deleteTodo(project.id)} className="mx-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Project;
