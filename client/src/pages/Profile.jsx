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
        if (ok) return alert("Succeful");
      });
    }
  }

  return (
    <section className="profile">
      <article>
        <label htmlFor="avatar">
          <picture>
            {avatar ? (
              <img src={`${API_URL}/uploads/${avatar}`} alt={user.name} />
            ) : (
              <img src={AvatarDefaul} alt="Not user image" />
            )}
          </picture>
        </label>
        {/* form update avatar */}
        <form>
          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={(e) => handleSubmitAvatar(e.target.files[0])}
          />
        </form>
        {httpError && <small>{httpError}</small>}
        {errorForm && <small>{errorForm}</small>}
        {/* form update data user */}
        <form onSubmit={handleSubmitProfile} className="form">
          <div className="form-row">
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              placeholder="name..."
              onChange={formHandleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              placeholder="email..."
              onChange={formHandleChange}
            />
          </div>
          <div className="form-row">
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
          <div className="form-row">
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={form.confirmPassword}
              placeholder="confirmPassword..."
              onChange={formHandleChange}
            />
          </div>
          <button className="btn">Update</button>
        </form>
      </article>
    </section>
  );
}

export default Profile;
