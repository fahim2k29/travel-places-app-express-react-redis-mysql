import 'bootstrap/dist/css/bootstrap.css';
import axios from "axios";
import {useEffect, useState} from "react";

const App = () => {
    // Backend API URL
    const baseUrl = 'http://localhost:5000/travel-places';

    const [travelPlaces, setTravelPlaces] = useState([]);
    const [name, setName] = useState('');
    const [travelPlacesId, setTravelPlacesId] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    // Fetch all travel Places
    const getTravelPlaces = async () => {
        try {
            const response = await axios.get(`${baseUrl}`);
            setTravelPlaces(response.data.data);
        } catch (error) {
            console.log(error.response);
        }
    };

    // Add new travel place
    const addTravelPlacesHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseUrl}`, {name});
            setTravelPlaces([...travelPlaces, response.data.data]);
            setName('');
        } catch (error) {
            console.log(error.response);
        }
    };

    // Cancel/Reset travel place form
    const cancelTravelPlacesHandler = () => {
        setName('');
        setIsEdit(false);
    };

    // Edit travel place
    const editTravelPlacesHandler = async (todo) => {
        setName(travelPlaces.name);
        setTravelPlacesId(travelPlaces.id);
        setIsEdit(true);
    };

    const updateTravelPlacesHandler = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${baseUrl}/${travelPlacesId}`, {name});
            const updatedTravelPlaces = travelPlaces.map(todo => {
                if (travelPlaces.id === travelPlacesId) {
                    travelPlaces.title = name;
                }
                return travelPlaces;
            });
            setTravelPlaces(updatedTravelPlaces);
            setName('');
            setTravelPlacesId(null);
            setIsEdit(false);
        } catch (error) {
            console.log(error.response);
        }
    };

    // Delete todo
    const deleteTodoHandler = async (id) => {
        try {
            await axios.delete(`${baseUrl}/${id}`);
            const filteredTravelPlaces = travelPlaces.filter(travelPlaces => travelPlaces.id !== id);
            setTravelPlaces(filteredTravelPlaces);
        } catch (error) {
            console.log(error.response);
        }
    };

    // Submit handler
    const submitHandler = async (e) => {
        if (isEdit) {
            await updateTravelPlacesHandler(e);
        } else {
            await addTravelPlacesHandler(e);
        }
    };


    useEffect(() => {
        getTravelPlaces();
    }, []);

    return (
        <div className="container">
            <h1 className="h1 text-center">Travel Place APP</h1>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">
                                Add Travel Place
                            </h4>
                        </div>
                        <form onSubmit={submitHandler}>
                            <div className="card-body">
                                <div className="form-group mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input type="text" id="name" name="name" className="form-control"
                                           placeholder="Enter name" required autoFocus value={name}
                                           onChange={e => setName(e.target.value)}/>
                                </div>
                            </div>
                            <div className="card-footer">
                                <p className="text-end">
                                    <button type="button" className="btn btn-danger btn-lg" onClick={cancelTravelPlacesHandler}>
                                        Cancel
                                    </button>
                                    {isEdit ?
                                        <button type="submit" className="btn btn-primary btn-lg ms-2">
                                            Update
                                        </button> :
                                        <button type="submit" className="btn btn-primary btn-lg ms-2">
                                            Save
                                        </button>}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="row mt-5 mb-5">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">
                                Travel Place List
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover table-striped">
                                    <thead>
                                    <tr>
                                        <th className="text-center">SL#</th>
                                        <th>Name</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {travelPlaces.map((todo, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{todo.name}</td>
                                            <td className="text-center">
                                                <button type="button" className="btn btn-sm btn-primary btn-sm"
                                                        onClick={editTravelPlacesHandler.bind(this, todo)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="btn btn-sm btn-danger btn-sm ms-2"
                                                        onClick={deleteTodoHandler.bind(this, todo.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default App;