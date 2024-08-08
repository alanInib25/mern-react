import { useState, useEffect } from "react";

function useFormHook(fields) {
  const formFields = fields;
  const [form, setForm] = useState(formFields);
  const [errorForm, setErrorForm] = useState(null);

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      setErrorForm(null)
    }, 5000);
    return () => clearTimeout(timeout);
  }, [errorForm])

  function formValidate(errorText){
    let fieldsRequired = true;
    Object
    .entries(form)
    .forEach(item => {
      console.log(item)
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

  //clear form
  function clearForm(){
    setForm(formFields);
  }

  return { form, errorForm, formHandleChange, formValidate, clearForm };
}
export default useFormHook;
