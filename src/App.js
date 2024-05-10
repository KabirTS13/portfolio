import React from 'react';
import TodoList from './todo.js'
import Weather from './weather.js';
import Header from './header.js';
import Project from './projects.js';
import Connections from './connections.js';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function GoogleSignIn() {
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((result) => {
                // You can access the signed-in user's information here
                const user = result.user;
                console.log(user);
            })
            .catch((error) => {
                // Handle errors here
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorCode, errorMessage);
            });
    };

    return (
        <div>
            <button onClick={signInWithGoogle}>Sign In with Google</button>
        </div>
    );
}

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
                <GoogleSignIn />
            )}
        </>
    );
}

export default App;
