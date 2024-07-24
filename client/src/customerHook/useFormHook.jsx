import { useState, useEffect } from "react";

function useFormHook(fields) {
  const [form, setForm] = useState(fields);
  const [errorForm, setErrorForm] = useState(null);

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      setErrorForm(null)
    }, 5000);
    return () => clearTimeout(timeout);
  }, [errorForm])

  function formValidate(errorText){
    console.log(form);
    let fieldsRequired = true;
    Object
    .entries(form)
    .forEach(item => {
      if(item[1] === ""){
        fieldsRequired = false;
        setErrorForm( errorText || "All fields are required");
        return;
      };
    })
    return fieldsRequired;
  }

  //handle change
  function formHandleChange(e) {
    return setForm((prevForm) => {
      return {
        ...prevForm,
        [e.target.name]: e.target.value,
      };
    });
  }

  return { form, errorForm, formHandleChange, formValidate };
}
export default useFormHook;
