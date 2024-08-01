//react-router-dom
import { Link } from "react-router-dom";
import first from "/first.svg";
import second from "/second.svg";
import third from "/public/third.svg";

function Home() {
  return (
    <section className="home">
      <article className="left">
        <p data-cy="homeP">
          discover the new and be surprised by <Link to="/signin"><span>people's</span></Link>
        </p>
{/*         <div className="right-buttons">
          <Link className="link signup" to="/signup">
            Signup
          </Link>
          <Link className="link signin" to="/signin">
            Signin
          </Link>
        </div> */}
      </article>
      <article className="right">
        <picture>
          <img src={`${first}`} />
        </picture>
        <picture>
          <img src={`${second}`} />
        </picture>
        <picture>
          <img src={`${third}`} />
        </picture>
        <picture>
          <img src={`${first}`} />
        </picture>
        <picture>
          <img src={`${second}`} />
        </picture>
        <picture>
          <img src={`${third}`} />
        </picture>
      </article>
    </section>
  );
}

export default Home;
