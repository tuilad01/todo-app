import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import './todo.scss'

import { TodoSchema } from '../datastore/schemas/todo-schema';

// const data = [
//     { text: "quet nha", isDone: false },
//     { text: "lau nha", isDone: false },
//     { text: "giat do", isDone: false },
// ]
const isSelectedField = "fj339_isSelected";
const todoKey = "f3dDs"

interface ITodo {
    id: string,
    text: string,
    isDone: boolean,
    priority: number
}

function TodoPage() {
    // const [todoList, setTodoList] = useState<any[]>(data.map(d => ({
    //     ...d,
    //     [isSelectedField]: false
    // })));
    const [todoList, setTodoList] = useState<any[]>([]);
    const [todoText, setTodoText] = useState("");
    const [todoEditing, setTodoEditing] = useState(-1);
    const todoSchema = new TodoSchema();
    useEffect(() => {        
        todoSchema.findAll().then(list => {
            // console.log("effect: ")
            // console.log(list)
            list.sort((a,b) => a.priority - b.priority)
            setTodoList(list);
        });

    }, [])

    const getTodoKey = (key: string | number) => `${todoKey}_${key}`

    const onSelectTask = (index: number) => {
        if (todoList[index]) {
            todoList[index][isSelectedField] = !todoList[index][isSelectedField];
            setTodoList([...todoList])
        }
    }

    const onAdd = async () => {
        if (todoText) {
            const newTodo: ITodo = {
                id: uuidv4(),
                text: todoText,
                isDone: false,
                priority: 0
            }
            // call api
            const result = await todoSchema.add(newTodo)
            // update ui
            if (result) {
                setTodoList([newTodo, ...todoList])
                setTodoText("")
            }
        }
    }

    const onRemove = async (index: number) => {
        if (todoList[index]) {
            // call api
            const result = await todoSchema.remove({ id: todoList[index].id })
            // update ui
            if (result) {
                todoList.splice(index, 1);
                setTodoList([...todoList])
            }
        }
    }

    const onEdit = (index: number) => {
        if (todoList[index]) {
            setTodoText(todoList[index].text);
            setTodoEditing(index);
        }
    }

    const onUpdate = async () => {
        if (todoList[todoEditing] && todoText) {
            todoList[todoEditing].text = todoText;

            const result = await todoSchema.update({ id: todoList[todoEditing].id }, { text: todoList[todoEditing].text })

            if (result) {
                setTodoList([...todoList])
                setTodoText("");
                setTodoEditing(-1);
            }
        }
    }

    const onCancel = () => {
        setTodoText("");
        setTodoEditing(-1);
    }

    const onClearAll = async () => {
        const arrTodoRemoved: any[] = []
        const resultConfirm = window.confirm("Are you sure?")
        if(!resultConfirm) return false;

        // find todo items that have done.
        const doneItems = todoList.filter((todo:ITodo) => todo.isDone)
        // remove one by one in indexedDB if it has been removed successfully then push id to array to update ui
        for (let index = 0; index < doneItems.length; index++) {
            const todo = doneItems[index];
            const result = await todoSchema.remove({ id: todo.id })
            if (result) {
                arrTodoRemoved.push(todo.id)
            }

        }
        if (todoEditing >= 0) {
            setTodoText("")
            setTodoEditing(-1)
        }
        setTodoList([...todoList.filter(todo => arrTodoRemoved.indexOf(todo.id) < 0)]);
    }

    const onDone = async (index: number) => {
        if (todoList[index]) {
            // call api
            const result = await todoSchema.update({ id: todoList[index].id }, { isDone: !todoList[index].isDone })
            // update ui
            if (result) {
                todoList[index].isDone = !todoList[index].isDone;
                setTodoList([...todoList])
            }
        }
    }

    const onInputChange = (e: React.ChangeEvent<any>, setFunction: any) => {
        setFunction(e.currentTarget.value);
    }

    const onKeyDownTodoText = (e: React.KeyboardEvent<any>, onAddFunc: any, onUpdateFunc: any) => {
        if (e.key === "Enter") {
            if (todoEditing >= 0) {
                onUpdateFunc();
            } else {
                onAddFunc();
            }
        } else if (e.key === "Escape") {
            onCancel();
        }

    }


    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const todos = reorder(
            todoList,
            result.source.index,
            result.destination.index
        );

        // call api
        const res = await Promise.all(todos.map(async (todo, index) => {
            return await todoSchema.update({ id: todo.id }, { priority: index })            
        }))
        //console.log(res)
        
        // update api
        setTodoList([...todos]);
    }

    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    return (
        <div className="todo container">
            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <div className="navbar">
                        <div>
                            <h1 className='navbar__title'>Todo list</h1>
                        </div>
                    </div>

                    <div className={todoEditing >= 0 ? "todo__add todo__add--editing" : "todo__add"}>
                        <Form.Control value={todoText} onChange={e => onInputChange(e, setTodoText)} onKeyDown={e => onKeyDownTodoText(e, onAdd, onUpdate)} placeholder="todo..." />
                        {todoEditing >= 0 ? (
                            <div>
                                <Button variant="success" onClick={_ => onUpdate()}>
                                    <i className="bi bi-check-lg"></i>
                                </Button>
                                <Button variant="primary" className="ml2px" onClick={_ => onCancel()}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </div>
                        ) : (
                            <Button variant="primary" onClick={_ => onAdd()}>
                                <i className="bi bi-plus-lg"></i>
                            </Button>
                        )}

                    </div>


                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <ul className='todo__list'
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {todoList.map((todo, index) => {
                                        return (
                                            <Draggable key={todo.id} draggableId={todo.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <li className={todo[isSelectedField] ? "task task--selected" : "task"} onClick={_ => onSelectTask(index)} key={getTodoKey(index)}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        >
                                                        <div className={todo.isDone ? "task__text task__text--done" : "task__text"}>
                                                            {todo.text}
                                                        </div>
                                                        <div className='task__control'>
                                                            <Button variant="success" onClick={() => onDone(index)}>
                                                                <i className="bi bi-check-lg"></i>
                                                            </Button>
                                                            <Button variant="warning" onClick={() => onEdit(index)}>
                                                                <i className="bi bi-pencil"></i>
                                                            </Button>
                                                            <Button variant="danger" onClick={() => onRemove(index)}>
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div className='todo__footer'>
                        <div>{todoList.length > 0 ? `${todoList.filter(todo => todo.isDone).length} of ${todoList.length} are done` : ''}</div>
                        <Button variant="danger" onClick={() => onClearAll()}>
                            <i className="bi bi-trash"></i> Clear All Done
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default TodoPage;
