//api
const API_URL = import.meta.env.VITE_API_URL;

//image
import AvatarDefaul from "/user.png";
function User({ user }) {
  return (
    <div>
      <div>
        {user.avatar ? (
          <img
            src={`${API_URL}/uploads/${user.avatar}`}
            alt={user.name}
            width="10px"
            height="10px"
          />
        ) : (
          <img
            src={`${AvatarDefaul}`}
            alt="Default User avatar"
            width="100px"
            height="100px"
          />
        )}
      </div>
      <div>
        <h2>{user.name}</h2>
        <h3>{user.email}</h3>
      </div>
    </div>
  );
}

export default User;
