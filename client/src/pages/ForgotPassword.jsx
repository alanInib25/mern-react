import { useState } from "react";
//context
import { useAuth } from "../context/AuthContext";
//custom hook
import useFormHook from "../customerHook/useFormHook";
function ForgotPassword() {
  //stado
  const [message, setMessage] = useState(null);
  //context
  const { httpError, userForgotPassword } = useAuth();
  //customHook
  const { form, errorForm, formHandleChange, formValidate } = useFormHook({
    email: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (formValidate()) {
      setMessage("Wait one moment")
      userForgotPassword(form).then((ok) => {
        if (ok) return setMessage("We send an email to your account");
      });
    }
  }
  return (
    <section className="forgotPassword">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {httpError && <small>{httpError}</small>}
        {errorForm && <small>{errorForm}</small>}
        {message && <small>{message}</small>}
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
        <button className="btn">Send</button>
      </form>
    </section>
  );
}

export default ForgotPassword;
