import { useEffect } from "react";
//context
import { useUser } from "../context/UserContext";
//components
import Users from "../components/Users";

function Dashboard() {
  //context
  const { getUserProfile, httpError } = useUser();
  //trae data del usuario logeado
  useEffect(() => {
    getUserProfile();
  },[])
  return (
    <section className="dashboard">
      {httpError && <small>{httpError}</small>}
      <Users />
    </section>
  );
}

export default Dashboard;
