//react-router-dom
import { Link } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
//react-hoof-form
import { useForm } from "react-hook-form";
function SigninUser() {
  //context
  const { httpError, signinUser } = useAuth();

  //react-hoof-form
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmitForm = handleSubmit((data) => {
    signinUser(data);
    reset();
  });

  return (
    <section className="auth">
      <form className="form" onSubmit={onSubmitForm} data-cy="form-auth">
        <h2>Signin User</h2>
        {httpError && <small>{httpError}</small>}
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
                message: "Emal bad format",
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
        <>
          <p>
            Your not have an account?<Link to="/signup">Signup</Link>
          </p>
          <p>
            Forgot Password?<Link to="/forgot-password">Go</Link>
          </p>
        </>
      </form>
    </section>
  );
}

export default SigninUser;
