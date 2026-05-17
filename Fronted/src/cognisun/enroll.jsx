import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Enroll(){

    const nav=useNavigate();

    const [user,setUser]=useState([]);

    const [name,setName]=useState("");

    const [password,setPassword]=useState("");

    const handelchange =(e)=>{
        if(e.target.name === "name"){
            setName(e.target.value);
        } else if(e.target.name === "password"){
            setPassword(e.target.value);
        }
    };

    const Submited = async (e) =>{
        e.preventDefault();
        await axios.post("http://localhost:5000/api/cog/",{name,password});
        alert("done 👍");
        setName("");
        setPassword("");
        getCongnisum();
        nav("/userlist");
    }



    const logout = () =>{
        nav("/");
        alert("logout done 👍");
    }

    return(
        <div style={{alignContent:"center",border:"10px,solid",borderRadius:"50px",padding:"10rem", margin:"1rem"}}>
            <div style={{paddingLeft:"30rem"}}>
            <button onClick={logout} style={{background:"red"}}> Logout </button>
            <br />
            <br />
            <h1> Add user</h1>
            <form onSubmit={Submited}>
                Name : <input type="text" placeholder="name" value={name} name="name" onChange={handelchange} /><br/><br/>
                Password : <input type="password" placeholder="Enter password" value={password} name="password" onChange={handelchange}/><br/><br/>
            <br/>
                <button>submit</button>
            </form>
            <br/><br/>

            
            <button onClick={()=>nav("/userlist")} style={{background:"blue"}}> List </button>

            <br/><br/><br/>
            
            
        </div>
        </div>
    )
}