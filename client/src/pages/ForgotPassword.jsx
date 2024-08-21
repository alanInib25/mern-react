import { useState, useEffect } from "react";
//context
import { useAuth } from "../context/AuthContext";
//react-hook-form
import { useForm } from "react-hook-form";

function ForgotPassword() {
  //stado
  const [forgotStatus, setForgotStatus] = useState(null);
  //context
  const { httpError, userForgotPassword } = useAuth();

  //react-hook-form
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    let timeOut;
    if (forgotStatus) {
      timeOut = setTimeout(() => {
        setForgotStatus(false);
      }, 3000);
    }
    return () => clearTimeout(timeOut);
  }, [forgotStatus]);

  const onSubmitForm = handleSubmit((data) => {
    userForgotPassword(data).then((status) => {
      if (status === 200) {
        setForgotStatus(true);
        reset();
        return;
      }
    });
  });

  return (
    <section className="forgotPassword">
      <form className="form" onSubmit={onSubmitForm} data-cy="form-forgot">
        <h2>Forgot Password</h2>
        {httpError && <small>{httpError}</small>}
        {forgotStatus && <small>"We send an email to your account"</small>}
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
        </div>
        <button data-cy="btn-send" className="btn">
          Send
        </button>
      </form>
    </section>
  );
}

export default ForgotPassword;
