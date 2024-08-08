import { useEffect, useState } from "react";
//react-router-dom
import { Link, useNavigate } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
//customerHook
import useFormHook from "../customerHook/useFormHook";

function SignupUser() {
  //state
  const { signupStatus, setSignupStatus } = useState(false);
  //context
  const { httpError, signupUser } = useAuth();

  //useNavigate
  const navigate = useNavigate();

  //custom hook form
  const { form, formHandleChange, errorForm, formValidate, clearForm } =
    useFormHook({ name: "", email: "", password: "" });

  useEffect(() => {
    let timeout;
    if (signupStatus) {
      timeout = setTimeout(() => {
        setSignupStatus(() => false);
        navigate("/signin");
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [signupStatus]);

  //handle submit
  function handleSubmit(e) {
    e.preventDefault();
    //VALIDAR CAMPOS OBLIGATORIOS
    if (formValidate()) {
      //API
      signupUser(form).then((ok) => {
        if (ok === "ok") {
          setSignupStatus(() => true);
          clearForm();
        }
      });
    }
  }

  return (
    <section className="auth">
      <form className="form" onSubmit={handleSubmit} data-cy="form-auth">
        <h2>Signup User</h2>
        {errorForm && <small>{errorForm}</small>}
        {httpError && <small>{httpError}</small>}
        {signupStatus === true && <small>User Registered</small>}
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
        <p>
          Your have an account?<Link to="/signin">Signin</Link>
        </p>
      </form>
    </section>
  );
}

export default SignupUser;
