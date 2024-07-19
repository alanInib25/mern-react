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
  const { form, errorForm, formHandleChange, formValidate } = useFormHook({ email: "" });

  function handleSubmit(e) {
    e.preventDefault();
    if (formValidate()) {
      userForgotPassword(form).then((ok) => {
        if (ok) return setMessage("we send an email to your account");
      });
    }
  }
  return (
    <section className="forgot-password">
      {httpError && <small>{httpError}</small>}
      {errorForm && <small>{errorForm}</small>}
      {message && <small>{message}</small>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email..."
            onChange={formHandleChange}
            value={form.email}
          />
        </div>
        <button>Send</button>
      </form>
    </section>
  );
}

export default ForgotPassword;
