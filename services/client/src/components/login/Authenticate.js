import React from "react";
import Register from "./Register";
import Login from "./Login";


export default function Authenticate(props) {
    const [isRegister, setIsRegister] = React.useState(props.isRegister);

    return <div className={"authContent"}>
        <div className={"authInputWrapper"}>
            {isRegister ? <Register/> : <Login/>}
            {isRegister ?
                <div>Already have an account?</div> :
                <div>Don't have an account yet?</div>
            }
            <div>Click <a onClick={() => setIsRegister(!isRegister)} style={{cursor: 'pointer'}}>here!</a></div>
        </div>
    </div>
}