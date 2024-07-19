import { useEffect } from "react"
//context
import { useAuth } from "../context/AuthContext";

function Signout() {
//context
const { signoutUser, httpError } = useAuth();
useEffect(() => {
  signoutUser();
}, [])

return(<>{httpError && <small>{httpError}</small>}</>)
}

export default Signout;