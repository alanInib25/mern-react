//react-router-dom
import { Link } from "react-router-dom";
function ErrorPage() {
  return (
    <section>
      <div>
        <Link to="/">Go back to home</Link>
        <h2>Page not found</h2>
      </div>
    </section>
  )
}

export default ErrorPage;