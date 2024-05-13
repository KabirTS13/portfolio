import React from 'react';
import TodoList from './todo.js'
import Weather from './weather.js';
import Header from './header.js';
import Project from './projects.js';
import Connections from './connections.js';
import SignIn from './signin.js';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function App() {
    const [user] = useAuthState(auth);

    return (
        <>
            {user ? (
                <>
                    <Header />
                    <div className="flex justify-between">
                        <Connections />
                        <Weather />
                    </div>
                    <div className="flex justify-between">
                        <Project />
                        <TodoList />
                    </div>
                </>
            ) : (
                <SignIn />
            )}
        </>
    );
}

export default App;
