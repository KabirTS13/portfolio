import React from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((result) => {
                // You can access the signed-in user's information here
                const user = result.user;
                console.log(user);
            })
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cover" style={{backgroundImage: "url('https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"}}>
            <h1 className="text-5xl font-bold mb-8 text-white">Create your portfolio</h1>
            <button onClick={signInWithGoogle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl">
                Sign In with Google
            </button>
        </div>
    );
}

export default SignIn;
