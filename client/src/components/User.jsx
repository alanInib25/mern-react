//api
const API_URL = import.meta.env.VITE_API_URL;

//image
import AvatarDefaul from "/user.png";

function User({ user }) {
  return (
    <article className="user">
      <picture>
        {user.avatar ? (
          <img
            src={`${API_URL}/uploads/${user.avatar}`}
            alt={user.name}
            data-cy="user-avatar-dashboard"
          />
        ) : (
          <img
            src={`${AvatarDefaul}`}
            alt="Default User avatar"
            data-cy="user-avatar-dashboard"
          />
        )}
      </picture>
      <div className="user-info">
        <h3>{user.name}</h3>
        <h4>{user.email}</h4>
      </div>
    </article>
  );
}

export default User;
