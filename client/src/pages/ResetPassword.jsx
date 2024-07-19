import { useEffect, useState } from "react";
//react-router-dom
import { useParams, useNavigate } from "react-router-dom";
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
  //useNavigate
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;
    if (message) {
      timeout = setTimeout(() => {
        navigate("/signin");
      }, 5000);
    }
  }, [message]);

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
    <section className="forgot-password">
      {httpError && <small>{httpError}</small>}
      {errorForm && <small>{errorForm}</small>}
      {message && <small>{message}</small>}
      <form onSubmit={handleSubmit}>
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
        <div>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm Password..."
            onChange={formHandleChange}
            value={form.confirmPassword}
          />
        </div>
        <button>Send</button>
      </form>
    </section>
  );
}

export default ResetPassword;
