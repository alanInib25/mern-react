import { useState } from "react";
//react-router-dom
import { useParams } from "react-router-dom";
//context
import { useAuth } from "../context/AuthContext";
//custom hook
import useFormHook from "../customerHook/useFormHook";

function ResetPassword() {
  //stado
  const [message, setMessage] = useState(null);
  //context
  const { httpError, userResetPassword } = useAuth();
  //customHook
  const { form, errorForm, formHandleChange, formValidate } = useFormHook({
    password: "",
    confirmPassword: "",
  });

  //useParams
  const { forgotToken } = useParams();

  //submit
  function handleSubmit(e) {
    e.preventDefault();
    if (formValidate()) {
      userResetPassword(form, forgotToken).then((data) => {
        if (data) setMessage("Password updated");
      });
    }
  }
  return (
    <section className="resetPassword">
      <form className="form" onSubmit={handleSubmit} data-cy="form-reset">
        <h2>Reset Password</h2>
        {httpError && <small>{httpError}</small>}
        {errorForm && <small>{errorForm}</small>}
        {message && <small>{message}</small>}
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
        <div className="form-row">
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm Password..."
            onChange={formHandleChange}
            value={form.confirmPassword}
          />
        </div>
        <button className="btn">Send</button>
      </form>
    </section>
  );
}

export default ResetPassword;
