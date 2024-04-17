import React, { useState } from 'react';
import { useCollectionData } from "react-firebase-hooks/firestore"; // Synchronize a Firestore query's data with React
import { collection, addDoc, deleteDoc, doc, updateDoc, orderBy, query, getDocs } from 'firebase/firestore';

import { db } from "./firebase"

function TodoList() {
    const todosRef = collection(db, 'todos'); //Creates a reference to the "todos" collection in my firestore database
    const q = query(todosRef, orderBy("createdAt", "desc")); //Orders the todos by when they were created
    const [todos] = useCollectionData(q, { idField: 'id' }); //Use useCollectionData hook to get realtime updates of todos

    const [todoInput, setTodoInput] = useState('');

    const addTodo = async () => {
      if (todoInput.trim() === '') return; // If there is no value in the todoinput, then it shouldn't let the user create a todo.

      // Use addDoc directly to add a new document to the collection
      const docRef = await addDoc(todosRef, {
        text: todoInput,
        completed: false,
        createdAt: new Date()
      });

      const todoId = docRef.id;

      // Update the 'id' field with the actual document ID
      await updateDoc(doc(todosRef, todoId), { id: todoId });

      // After adding the document and updating the 'id' field, clear the input field
      setTodoInput('');
    };

    const [updateTodo, setUpdateTodo] = useState('')
    const [updateTodoId, setUpdateTodoId] = useState('')

    const editTodo = async (id) => {
      setUpdateTodoId(id)
      const todo = todos.find(todo => todo.id === id)
      setUpdateTodo(todo.text)
    }

    const saveEditTodo = async (id) => {
      await updateDoc(doc(db, 'todos', id), {
        text: updateTodo
      })
      setUpdateTodoId('')
      setUpdateTodo('')
    }

    const deleteTodo = async (id) => {
      await deleteDoc(doc(db, 'todos', id))
    }

    const toggleTodo = async (id, completed) => {
      await updateDoc(doc(db, 'todos', id), {
        completed: !completed // Changes the value to be the oppsite of the current value
      })
    }


    return (
      <div className="flex flex-col items-center justify-center min-h-50vh w-2/5 bg-gray-700 p-6 m-10 rounded-lg shadow-md hover:shadow-lg transition duration-300 ml-auto mr-10">
        <h1 className="text-2xl font-bold text-white mb-4">Todo List</h1>
        <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Enter Todo..." value={todoInput} onChange={(e) => setTodoInput(e.target.value)} className="form-input px-4 py-2 border rounded"/>
            <button onClick={addTodo} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Todo</button>
        </div>
        

        <ul className="list-none w-full max-w-md overflow-y-auto" style={{ maxHeight: '225px' }}>
          {todos && todos.map (todo => (
            <li key={todo.id} className="flex items-center bg-white shadow px-4 py-2 mb-2 rounded">
              {updateTodoId === todo.id ? (
                <>
                  <input type="text" value={updateTodo} onChange={(e) => setUpdateTodo(e.target.value)} className="flex-1 form-input px-2 py-1 rounded"/>
                  <button onClick={() => saveEditTodo(todo.id)} className="ml-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id, todo.completed)} className="mr-2"/>
                  <span className={`flex-1 ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{todo.text}</span>
                  <button onClick={() => editTodo(todo.id)} className="mx-1 px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => deleteTodo(todo.id)} className="mx-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
}
export default TodoList