import { useEffect, useState } from "react";
//react-router-dom
import { Link, useNavigate } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
//customerHook
import useFormHook from "../customerHook/useFormHook";

function Auth({ auth }) {
  //state
  const [signupStatus, setSignupStatus] = useState(false);

  //context
  const { httpError, signupUser, signinUser } = useAuth();

  //useNavigate
  const navigate = useNavigate();

  //data for custom hook
  const initiaForm =
    auth === "signup"
      ? { name: "", email: "", password: "" }
      : { email: "", password: "" };
  //custom hook form
  const { form, formHandleChange, errorForm, formValidate, clearForm } =
    useFormHook(initiaForm);

  //
  useEffect(() => {
    let timeout;
    if(signupStatus){
      timeout = setTimeout(() => {
        setSignupStatus(false);
        navigate("/signin");
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [signupStatus]);

  //handle submit
  function handleSubmit(e) {
    e.preventDefault();
    //VALIDAR CAMPOS OBLIGATORIOS
    console.log(form);
    if (formValidate()) {
      //API
      if (auth === "signup") {
        signupUser(form).then((ok) => {
          if (ok === "ok") {
            setSignupStatus(true);
            clearForm();
          }
        });
      }
      if (auth === "signin") return signinUser(form);
    }
  }

  return (
    <section className="auth">
      <form className="form" onSubmit={handleSubmit} data-cy="form-auth">
        {auth === "signin" ? <h2>Signin User</h2> : <h2>Signup User</h2>}
        {errorForm && <small>{errorForm}</small>}
        {httpError && <small>{httpError}</small>}
        {signupStatus && <small>User Registered</small>}
        {auth === "signup" && (
          <div className="form-row">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name..."
              onChange={formHandleChange}
              value={form.name}
            />
          </div>
        )}
        <div className="form-row">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email..."
            onChange={formHandleChange}
            value={form.email}
          />
        </div>
        <div className="form-row">
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password..."
            onChange={formHandleChange}
            value={form.password}
          />
        </div>
        <button className="btn">Send</button>
        {auth === "signin" ? (
          <>
            <p>
              Your not have an account?<Link to="/signup">Signup</Link>
            </p>
            <p>
              Forgot Password?<Link to="/forgot-password">Go</Link>
            </p>
          </>
        ) : (
          <p>
            Your have an account?<Link to="/signin">Signin</Link>
          </p>
        )}
      </form>
    </section>
  );
}

export default Auth;
