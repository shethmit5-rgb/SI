import { useEffect, useState } from "react"
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditUser(){

    const {id} = useParams();

    const nav=useNavigate();

    const [name,setName]=useState("");

    const [password,setPassword]=useState("");

    useEffect(()=>{
        axios.get(`http://localhost:5000/api/cog/${id}`).then((res)=>{
                setName(res.data.name);
                setPassword(res.data.password);
        });
    },[id]);

    const list = () =>{
        nav("/userlist");
    }

    const userUpdate = async (e) => {
    e.preventDefault();
    try{
        await axios.put(`http://localhost:5000/api/cog/${id}`, {
        name,
        password,
        });

        alert("updated");

        nav("/userlist");
    }
    catch(error){
        console.log("the error : ",error);
        alert("user cant Update : ",error);
    }
  };

    return(
        <div style={{alignContent:"center",border:"10px,solid",borderRadius:"50px",padding:"1rem", margin:"1rem"}}>
            <div style={{paddingLeft:"33rem"}}>
                <h4>Don't want to update : <button onClick={list} style={{background:"red"}} >Back to list</button></h4>
                <h1> Edit user page </h1>
                <form onSubmit={userUpdate}>
                    Name: <input type="text" placeholder="Enter name" value={name} onChange={(e)=>setName(e.target.value)} required /><br /><br />
                    Password: <input type="text" placeholder="Enter password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                    <br/>
                    <br/>
                    <button>Update</button>
                </form>
            </div>
        </div>
    )
}