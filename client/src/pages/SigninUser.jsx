import { useEffect, useState } from "react";
//react-router-dom
import { Link, useNavigate } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
//customerHook
import useFormHook from "../customerHook/useFormHook";

function SigninUser() {
  //context
  const { httpError, signupUser, signinUser } = useAuth();

  //useNavigate
  const navigate = useNavigate();

  //custom hook
  const { form, formHandleChange, errorForm, formValidate } = useFormHook({
    email: "",
    password: "",
  });

  //handle submit
  function handleSubmit(e) {
    e.preventDefault();
    //VALIDAR CAMPOS OBLIGATORIOS
    console.log(form);
    if (formValidate()) {
      //API
      return signinUser(form);
    }
  }

  return (
    <section className="auth">
      <form className="form" onSubmit={handleSubmit} data-cy="form-auth">
        <h2>Signin User</h2>
        {errorForm && <small>{errorForm}</small>}
        {httpError && <small>{httpError}</small>}
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
