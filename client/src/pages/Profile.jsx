import { useState, useEffect } from "react";
//context
import { useUser } from "../context/UserContext";
//react-hook-form
import { useForm } from "react-hook-form";
//api
const API_URL = import.meta.env.VITE_API_URL;
//image
import AvatarDefaul from "/user.png";

function Profile() {
  //state
  const [updateStatus, setUpdateStatus] = useState(false);
  //context
  const { user, avatar, httpError, updateUser, updataUsersAvatar } = useUser();
  //react-hook-form
  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let timeOut;
    if(updateStatus){
      timeOut = setTimeout(() => {
        setUpdateStatus(false);
      }, 3000)
    }
    return () => clearTimeout(timeOut);
  }, [updateStatus])

  function handleSubmitAvatar(userAvatar) {
    const avatarData = new FormData();
    avatarData.set("avatar", userAvatar);
    return updataUsersAvatar(avatarData);
  }

  const onSubmitForm = handleSubmit((data) => {
    updateUser(data).then((status) => {
      if (status === 200) {
        reset({"password": "", "confirmPassword": ""});
        return setUpdateStatus(true);
      }
    });
  });

  return (
    <section className="profile">
      <article>
        <label htmlFor="avatar" data-cy="avatar-label">
          <picture>
            {avatar ? (
              <img src={`${API_URL}/uploads/${avatar}`} alt={user.name} />
            ) : (
              <img src={AvatarDefaul} alt="Not user image" />
            )}
          </picture>
        </label>
        {/* form update avatar */}
        <form data-cy="avatar-form">
          <input
            type="file"
            name="avatar"
            id="avatar"
            accept=".png, .jpg, .jpeg"
            onChange={(e) => handleSubmitAvatar(e.target.files[0])}
          />
        </form>
        {httpError && <small>{httpError}</small>}
        {/* form update data user */}
        <form onSubmit={onSubmitForm} className="form" data-cy="profile-form">
          {updateStatus && <small>Data Updated</small>}
          <div className="form-row">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name..."
              {...register("name", {
                required: {
                  value: true,
                  message: "Name is required",
                },
              })}
            />
            {errors.name && <p>{errors.name.message}</p>}
          </div>
          <div className="form-row">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email..."
              {...register("email", {
                required: {
                  value: true,
                  message: "Email is required",
                },
                pattern: {
                  value:
                    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                  message: "Email bad format",
                },
              })}
            />
            {errors.email && <p>{errors.email.message}</p>}
          </div>
          <div className="form-row">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password..."
              {...register("password", {
                required: {
                  value: true,
                  message: "Password is required",
                },
                minLength: {
                  value: 6,
                  message: "Password 6 characters min",
                },
                maxLength: {
                  value: 12,
                  message: "Password 12 characters max",
                },
              })}
            />
            {errors.password && <p>{errors.password.message}</p>}
          </div>
          <div className="form-row">
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm Password..."
              {...register("confirmPassword", {
                required: {
                  value: true,
                  message: "Confirm Password is required",
                },
                minLength: {
                  value: 6,
                  message: "Confirm Password 6 characters min",
                },
                maxLength: {
                  value: 12,
                  message: "Confirm Password 12 characters max",
                },
                validate: (value) => {
                  if (watch("password") !== value) {
                    return "Passwords and Confirm password not equals";
                  }
                  return true;
                },
              })}
            />
            {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
          </div>
          <button className="btn">Update</button>
        </form>
      </article>
    </section>
  );
}

export default Profile;
