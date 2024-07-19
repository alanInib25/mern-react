import { useState } from "react";
//react-router-dom
import { Link } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
//customerHook
import useFormHook from "../customerHook/useFormHook";

function Auth({ auth }) {
  //customer hook
  const initiaForm =
    auth === "signup"
      ? { name: "", email: "", password: "" }
      : { email: "", password: "" };
  const { form, formHandleChange, errorForm, formValidate } = useFormHook(initiaForm);
  //context
  const { httpError, signupUser, signinUser } = useAuth();

  //handle submit
  function handleSubmit(e) {
    e.preventDefault();
    //VALIDAR CAMPOS OBLIGATORIOS
    if(formValidate()){
      //API
      if (auth === "signup") return signupUser(form);
      if (auth === "signin") return signinUser(form);
    }
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        {errorForm && <small>{errorForm}</small>}
        {httpError && <small>{httpError}</small>}
        <div>
          {auth === "signup" && (
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name.."
              onChange={formHandleChange}
              value={form.name}
            />
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            onChange={formHandleChange}
            value={form.email}
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password..."
            onChange={formHandleChange}
            value={form.password}
          />
        </div>
        <button>Send</button>
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
