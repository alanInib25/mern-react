import { useEffect } from "react";
//context
import { useUser } from "../context/UserContext";
//component
import User from "../components/User";

function Users() {
  //context
  const { users, loading, getUsers } = useUser();

  useEffect(() => {
    getUsers();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <article>
      {!users.length ? (
        <h2>Not users</h2>
      ) : (
        users.map((user, index) => <User key={index} user={user} />)
      )}
    </article>
  );
}

export default Users;
