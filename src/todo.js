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
      <>
        <h1>Todo List</h1>
        <input type="text" placeholder="Enter Todo..." value={todoInput} onChange={(e) => setTodoInput(e.target.value)} />
        <button onClick={addTodo}>Add Todo</button>

        <ul>
          {todos && todos.map (todo => (
            <li key={todo.id}>
              {updateTodoId === todo.id ? (
                <>
                  <input type="text" value={updateTodo} onChange={(e) => setUpdateTodo(e.target.value)} />
                  <button onClick={() => saveEditTodo(todo.id)}>Save</button>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id, todo.completed)} />
                  <span>{todo.text}</span>
                  <button onClick={() => editTodo(todo.id)}>Edit</button>
                  <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </>
    )
}
export default TodoList