import React from 'react';
import { auth } from './firebase';

function SignOut(){
    return auth.currentUser && (
      <button onClick={() => auth.signOut()} className="text-white text-lg hover:bg-gray-600 hover:text-white p-2 rounded">Sign Out</button>
    )
}

export default SignOut;