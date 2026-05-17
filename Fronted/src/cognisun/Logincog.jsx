import { useState } from "react"
import { useNavigate } from "react-router-dom";


export default function Logincog (){

    const nav=useNavigate();

    const [id,setId]=useState("");

    const [password,setPassword] = useState("");

    const check=(e)=>{
        e.preventDefault();
        console.log(id,"-",password);

        if(id=="admin" && password=="1234567890"){
            nav("/user")
        }
        else{
            alert("faild to login");
            setId("");
            setPassword("");
        }
    }

    return(
        <div style={{alignContent:"center",border:"10px,solid",borderRadius:"50px",padding:"10rem", margin:"1rem"}}>
            <div style={{paddingLeft:"27rem"}}>
                <h1> login page </h1>
                <form onSubmit={check}>
                    User name : <input type="text" placeholder="Enter user name" name="id" value={id} onChange={(e)=>setId(e.target.value)} required/><br/><br/>
                    Password : <input type="Password" placeholder="Enter password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/><br/><br/>
                    <button style={{background:"red"}}>Login</button>
                </form>
            </div>
        </div>
    )
}