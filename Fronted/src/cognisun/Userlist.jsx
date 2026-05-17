import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function Userlist(){

    const nav=useNavigate();
    
    const [val,setVal] = useState(0);

    const [user,setUser]=useState([]);

    const getCongnisum = async () => {
        try{
                const res = await axios.get("http://localhost:5000/api/cog/cogData");
                setUser(res.data);
        }
        catch(error){
                console.log("user data not fatch : The error is => ",error);
        }
        finally{
                console.log("user data : ",user);
        }
    }

    useEffect(() => { 
       getCongnisum();
    } , []);

    const edituser = (id) => {
        nav(`EditUser/${id}`);
    }

    const deleteuser = async (id) => {
        try{
            await axios.delete(`http://localhost:5000/api/cog/${id}`);
            console.log(id);
            getCongnisum();
        }
        catch(error){
            console.log("User can't be deleted : ",error);
        }

    }

    return(
        <>

            <h1>List of data</h1>

            <table>
                <thead>
                    <tr>
                        {/* <th>No.</th> */}
                        <th>Name</th>
                        <th>Password</th>
                        <th>edit</th>
                        <th>delete</th>
                    </tr>
                </thead>
                <tbody>
                    {user.map((u)=>(
                        <tr key={u._id}>
                            {/* <td>{val} setVal({val}+1)</td> */}
                            <td>{u.name}</td>
                            <td>{u.password}</td>
                            <td><button onClick={()=>edituser(u._id)} style={{background:"orange"}} >Edit</button></td>
                            <td><button onClick={()=>deleteuser(u._id)} style={{background:"black"}} >Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <button onClick={()=>{nav("/user")}}>Add User</button>
        </>
    )
}