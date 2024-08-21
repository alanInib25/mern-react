import { useState } from "react";
//react-router-dom
import { useParams, useNavigate } from "react-router-dom";
//react-hook-form
import { useForm } from "react-hook-form";
//context
import { useAuth } from "../context/AuthContext";

function ResetPassword() {
  //stado
  const [resetStatus, setResetStatus] = useState(null);
  //context
  const { httpError, userResetPassword } = useAuth();
  //navigate
  const navigate = useNavigate();
  //react-hook-form
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    let timeOut;
    if (resetStatus) {
      timeOut = setTimeout(() => {
        setResetStatus(false);
        navigate("/signin");
      }, 3000);
    }
    return () => clearTimeout(timeOut);
  }, [resetStatus]);

  //useParams
  const { forgotToken } = useParams();

  const onSubmitForm = handleSubmit((data) => {
    userResetPassword(data, forgotToken).then((status) => {
      if (status === 200) {
        setResetStatus(true);
        reset();
        return;
      }
    });
  });

  return (
    <section className="resetPassword">
      <form className="form" onSubmit={onSubmitForm} data-cy="form-reset">
        <h2>Reset Password</h2>
        {httpError && <small>{httpError}</small>}
        {resetStatus && <small>"Password Updated"</small>}
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
                useWatch("password") === value
                  ? true
                  : "Passwords and Confirm password not equals";
              },
            })}
          />
          {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
        </div>
        <button className="btn">Send</button>
      </form>
    </section>
  );
}

export default ResetPassword;
