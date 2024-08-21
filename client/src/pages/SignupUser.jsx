import { useEffect, useState } from "react";
//react-router-dom
import { Link, useNavigate } from "react-router-dom";
//react-hook-form
import { useForm } from "react-hook-form";
//context
import { useAuth } from "../context/AuthContext";

function SignupUser() {
  //state
  const [signupStatus, setSignupStatus] = useState(false);
  //context
  const { httpError, signupUser } = useAuth();
  //react-hook.form
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm();

  //useNavigate
  const navigate = useNavigate();

  useEffect(() => {
    let timeOut;
    if (signupStatus) {
      timeOut = setTimeout(() => {
        setSignupStatus(false);
        navigate("/signin")
      }, 3000);
    }
    return () => clearTimeout(timeOut);
  }, [signupStatus]);

  //handle submit
  const onSubmitForm = handleSubmit((data) => {
    //API
    signupUser(data).then((status) => {
      if (status === 200) {
        setSignupStatus(true);
        reset();
      }
    });
  });

  return (
    <section className="auth">
      <form className="form" onSubmit={onSubmitForm} data-cy="form-auth">
        <h2>Signup User</h2>
        {httpError && <small>{httpError}</small>}
        {signupStatus && <small>User Registered</small>}
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
        <button className="btn">Send</button>
        <p>
          Your have an account?<Link to="/signin">Signin</Link>
        </p>
      </form>
    </section>
  );
}

export default SignupUser;
