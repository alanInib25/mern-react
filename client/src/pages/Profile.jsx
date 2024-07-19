//context
import { useUser } from "../context/UserContext";
//customhook
import useFormHook from "../customerHook/useFormHook";
//api
const API_URL = import.meta.env.VITE_API_URL;
//image
import AvatarDefaul from "/user.png";

function Profile() {
  //context
  const { user, avatar, httpError, updateUser, updataUsersAvatar } = useUser();

  //customHook
  const { form, formHandleChange, formValidate, errorForm } = useFormHook({
    name: user.name,
    email: user.email,
    password: "",
    confirmPassword: "",
  });

  function handleSubmitAvatar(userAvatar) {
    const avatarData = new FormData();
    avatarData.set("avatar", userAvatar);
    return updataUsersAvatar(avatarData);
  }

  function handleSubmitProfile(e) {
    e.preventDefault();
    if (formValidate()) {
      updateUser(form).then((ok) => {
        if(ok) return alert("Succeful");
      });
    }
  }

  return (
    <section className="profile">
      <article className="profile-avatar__wrapper">
        <div>
          {avatar ? (
            <img src={`${API_URL}/uploads/${avatar}`} alt={user.name} />
          ) : (
            <img
              src={AvatarDefaul}
              alt="Not user image"
              width="100px"
              height="100px"
            />
          )}
        </div>
        {/* form update avatar */}
        <form className="form__avatar">
          <h2>User data</h2>
          <div>
            <input
              type="file"
              name="avatar"
              id="avatar"
              onChange={(e) => handleSubmitAvatar(e.target.files[0])}
            />
          </div>
        </form>
      </article>
      {httpError && <small>{httpError}</small>}
      {errorForm && <small>{errorForm}</small>}
      <article className="profile-data__wraper">
        {/* form update data user */}
        <form onSubmit={handleSubmitProfile} className="form__profile">
          <div>
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              placeholder="name..."
              onChange={formHandleChange}
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              placeholder="email..."
              onChange={formHandleChange}
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              placeholder="password..."
              onChange={formHandleChange}
              minLength="6"
              maxLength="12"
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={form.confirmPassword}
              placeholder="confirmPassword..."
              onChange={formHandleChange}
            />
          </div>
          <button>Update</button>
        </form>
      </article>
    </section>
  );
}

export default Profile;
